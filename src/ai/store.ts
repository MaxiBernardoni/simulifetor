import { create } from 'zustand';
import { setAiEvents, allEvents } from '../engine/registry';
import { useGame } from '../store/gameStore';
import { AUDIT_MAX, POOL_MAX, SESSION_BATCH } from './types';
import type { AIConfig, AIProvider, AuditEntry } from './types';
import { createGemini } from './providers/gemini';
import { createGroq } from './providers/groq';
import { createMock, sampleEventJson } from './providers/mock';
import { generateEvents, narrate } from './service';
import { summarizeLife } from './prompts';
import { getApiKey, loadAIData, saveAIData, setApiKey } from './storage';
import { norm } from './filter';
import type { GameEvent } from '../engine/types';

let pool: GameEvent[] = [];
let sessionGenerated = 0;

export const providerFor = (id: AIConfig['provider']): AIProvider => (id === 'groq' ? createGroq() : createGemini());

interface AIState {
  config: AIConfig;
  hasKey: boolean;
  poolCount: number;
  audit: AuditEntry[];
  busy: boolean;
  status: string | null;
  load: () => Promise<void>;
  setConfig: (patch: Partial<AIConfig>) => Promise<void>;
  saveKey: (key: string) => Promise<void>;
  testConnection: () => Promise<void>;
  generate: (n: number, mock?: boolean) => Promise<void>;
  clearPool: () => Promise<void>;
  narrateText: (eventId: string, text: string) => Promise<string | null>;
}

export const useAI = create<AIState>((set, get) => {
  const persist = () => saveAIData({ config: get().config, pool, audit: get().audit });
  const publishPool = () => {
    setAiEvents(get().config.enabled ? pool : []);
    set({ poolCount: pool.length });
  };
  const knownIds = () => {
    const ids = new Set<string>();
    const titles = new Set<string>();
    for (const e of allEvents()) {
      ids.add(e.id);
      titles.add(norm(e.title));
    }
    for (const e of pool) {
      ids.add(e.id);
      titles.add(norm(e.title));
    }
    return { ids, titles };
  };
  const ctxNow = () => {
    const life = useGame.getState().life;
    return life && life.alive ? summarizeLife(life) : 'una persona adulta cualquiera, sin trabajo fijo';
  };

  return {
    config: { enabled: false, provider: 'gemini', narrator: false },
    hasKey: false,
    poolCount: 0,
    audit: [],
    busy: false,
    status: null,

    load: async () => {
      const d = await loadAIData();
      pool = d.pool.slice(-POOL_MAX);
      const key = await getApiKey();
      set({ config: d.config, audit: d.audit, hasKey: !!key });
      publishPool();
      // Generación en segundo plano: nunca bloquea la UI ni el turno de envejecer.
      if (d.config.enabled && key) void get().generate(SESSION_BATCH);
    },

    setConfig: async (patch) => {
      set({ config: { ...get().config, ...patch } });
      publishPool();
      await persist();
    },

    saveKey: async (key) => {
      await setApiKey(key);
      set({ hasKey: key.trim().length > 0, status: key.trim() ? 'Clave guardada de forma segura en este dispositivo.' : 'Clave borrada.' });
    },

    testConnection: async () => {
      const key = await getApiKey();
      if (!key) return set({ status: 'Primero pegá tu clave.' });
      set({ busy: true, status: 'Probando…' });
      try {
        const out = await providerFor(get().config.provider).generate('Respondé solamente con la palabra OK.', key, { timeoutMs: 8000 });
        set({ status: out.trim().length ? 'Conexión correcta.' : 'El proveedor respondió vacío.' });
      } catch (e) {
        const kind = (e as { kind?: string }).kind;
        set({
          status:
            kind === 'auth'
              ? 'La clave fue rechazada.'
              : kind === 'quota'
                ? 'Sin cuota por ahora (límite gratuito). Probá más tarde.'
                : kind === 'timeout'
                  ? 'Tardó demasiado.'
                  : 'No se pudo conectar.',
        });
      } finally {
        set({ busy: false });
      }
    },

    generate: async (n, mock = false) => {
      if (get().busy) return;
      const key = mock ? 'mock' : await getApiKey();
      if (!key) return set({ status: 'Falta la clave.' });
      const room = Math.max(0, POOL_MAX - pool.length);
      const want = mock ? Math.min(n, room) : Math.min(n, room, Math.max(0, SESSION_BATCH - sessionGenerated));
      if (want <= 0) return set({ status: mock ? 'El pool está lleno.' : 'Ya se generó el máximo de esta sesión.' });
      set({ busy: true, status: 'Generando…' });
      try {
        const provider = mock ? createMock([sampleEventJson(pool.length + 1)]) : providerFor(get().config.provider);
        const res = await generateEvents(provider, key, want, ctxNow(), knownIds(), { timeoutMs: 15000 });
        pool = [...pool, ...res.added].slice(-POOL_MAX);
        if (!mock) sessionGenerated += res.added.length + res.rejected.length;
        const audit = [...get().audit, ...res.rejected].slice(-AUDIT_MAX);
        set({
          audit,
          status: res.error
            ? `Se detuvo: ${res.error.message}.`
            : `Listo: ${res.added.length} nuevo(s), ${res.rejected.length} rechazado(s).`,
        });
        publishPool();
        await persist();
      } finally {
        set({ busy: false });
      }
    },

    clearPool: async () => {
      pool = [];
      publishPool();
      set({ status: 'Pool vaciado.' });
      await persist();
    },

    narrateText: async (eventId, text) => {
      const { config } = get();
      if (!config.enabled || !config.narrator) return null;
      const key = await getApiKey();
      if (!key) return null;
      return narrate(providerFor(config.provider), key, eventId, text, ctxNow(), 3000);
    },
  };
});
