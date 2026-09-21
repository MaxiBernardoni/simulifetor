import { create } from 'zustand';
import { setAiEvents, allEvents } from '../engine/registry';
import { useGame } from '../store/gameStore';
import { AUDIT_MAX, DEFAULT_AI_CONFIG, POOL_MAX, SESSION_BATCH } from './types';
import type { AIConfig, AIProvider, AuditEntry } from './types';
import { createGemini } from './providers/gemini';
import { createGroq } from './providers/groq';
import { createOpenAICompat } from './providers/openai';
import { createMock, sampleEventJson } from './providers/mock';
import { generateEvents, narrate, resolveFreeText } from './service';
import { summarizeLife } from './prompts';
import { getApiKey, loadAIData, saveAIData, setApiKey } from './storage';
import { inputProblem, norm } from './filter';
import type { GameEvent } from '../engine/types';

let pool: GameEvent[] = [];
let sessionGenerated = 0;

export const providerFor = (c: AIConfig): AIProvider =>
  c.provider === 'groq' ? createGroq() : c.provider === 'compat' ? createOpenAICompat('compat', c.baseUrl, c.model) : createGemini();

/** Clave del proveedor activo. El modelo propio (`compat`) no la necesita: devuelve '' en vez de null. */
const keyFor = async (c: AIConfig): Promise<string | null> => (await getApiKey()) ?? (c.provider === 'compat' ? '' : null);

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
  /** Responde una situación escribiendo: la IA juzga y se aplica el resultado. Devuelve un mensaje de error o null si salió bien. */
  answerText: (answer: string) => Promise<string | null>;
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
    config: { ...DEFAULT_AI_CONFIG },
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
      if (d.config.enabled && (await keyFor(d.config)) !== null) void get().generate(SESSION_BATCH);
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
      const key = await keyFor(get().config);
      if (key === null) return set({ status: 'Primero pegá tu clave.' });
      set({ busy: true, status: 'Probando…' });
      try {
        const out = await providerFor(get().config).generate('Respondé solamente con la palabra OK.', key, { timeoutMs: 8000 });
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
      const key = mock ? 'mock' : await keyFor(get().config);
      if (key === null) return set({ status: 'Falta la clave.' });
      const room = Math.max(0, POOL_MAX - pool.length);
      const want = mock ? Math.min(n, room) : Math.min(n, room, Math.max(0, SESSION_BATCH - sessionGenerated));
      if (want <= 0) return set({ status: mock ? 'El pool está lleno.' : 'Ya se generó el máximo de esta sesión.' });
      set({ busy: true, status: 'Generando…' });
      try {
        const provider = mock ? createMock([sampleEventJson(pool.length + 1)]) : providerFor(get().config);
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
      const key = await keyFor(config);
      if (key === null) return null;
      return narrate(providerFor(config), key, eventId, text, ctxNow(), 3000);
    },

    answerText: async (answer) => {
      const life = useGame.getState().life;
      const prompt = life?.pending[0];
      if (!life || prompt?.kind !== 'choice') return 'No hay ninguna situación para responder.';
      const text = answer.trim();
      if (text.length < 3) return 'Escribí qué hacés (aunque sea una frase corta).';
      if (inputProblem(text, life.age)) return 'Esa respuesta no la puedo usar. Escribí otra cosa o elegí una opción.';
      const { config } = get();
      if (!config.enabled || !config.narrator) return 'Activá la IA y el modo narrador para responder escribiendo.';
      const key = await keyFor(config);
      if (key === null) return 'Falta la clave de la IA.';
      const res = await resolveFreeText(providerFor(config), key, {
        title: prompt.title,
        situation: prompt.text,
        answer: text,
        ctx: ctxNow(),
        age: life.age,
      });
      if (!res.ok) return res.message;
      // Si mientras tanto cambió la situación, no se aplica.
      const now = useGame.getState().life?.pending[0];
      if (now?.kind !== 'choice' || now.eventId !== prompt.eventId) return 'La situación cambió mientras la IA pensaba.';
      useGame.getState().chooseFree(res.outcome);
      return null;
    },
  };
});
