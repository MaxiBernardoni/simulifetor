import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Life, LifeSummary } from '../engine/types';
import { SCHEMA_VERSION } from '../engine/types';
import { cloneLife, createLife, migrateLife } from '../engine/life';
import type { CreateOpts } from '../engine/life';
import { ageUp } from '../engine/ageUp';
import { addLog } from '../engine/effects';
import { ACHIEVEMENTS } from '../content/achievements';
import { buyAsset, investMoney, netWorth, repayLoan, sellAsset, takeLoan, withdrawInvestments } from '../engine/assets';
import { dismissPrompt, resolveChoice } from '../engine/events';
import { createHeir, legacyPoints } from '../engine/dynasty';
import { checkScenario, createScenarioLife } from '../engine/scenarios';
import { getScenario } from '../content/scenarios';
import {
  dropUniversity,
  enrollUniversity,
  quitJob,
  runActivity,
  runPersonAction,
  searchJobs,
  takeJob,
} from '../engine/actions';

export const SLOT_COUNT = 3;
const META_KEY = 'vidasim.meta.v2';
const slotKey = (i: number) => `vidasim.slot.${i}`;
const OLD_KEY = 'vidasim.save.v1';

export type Tab = 'life' | 'activities' | 'work' | 'people' | 'assets' | 'more' | 'tree' | 'slots' | 'backup';

export interface Creating {
  step: 'mode' | 'scenarios' | 'create';
  scenarioId?: string;
}

interface Meta {
  schemaVersion: number;
  history: LifeSummary[];
  achievements: string[];
  scenarioWins: string[];
  activeSlot: number;
}

interface GameState {
  ready: boolean;
  creating: Creating | null;
  slots: (Life | null)[];
  activeSlot: number;
  life: Life | null;
  history: LifeSummary[];
  achievements: string[];
  scenarioWins: string[];
  toast: { id: number; title: string; icon: string } | null;
  clearToast: () => void;
  tab: Tab;
  load: () => Promise<void>;
  setTab: (t: Tab) => void;
  startCreating: () => void;
  setCreating: (c: Creating | null) => void;
  cancelCreate: () => void;
  newLife: (opts?: CreateOpts) => void;
  continueAsHeir: (personId: string) => boolean;
  switchSlot: (i: number) => void;
  deleteSlot: (i: number) => void;
  exportData: () => string;
  importData: (json: string) => string | null;
  ageUp: () => void;
  choose: (i: number) => void;
  dismiss: () => void;
  activity: (id: string) => void;
  personAction: (actionId: string, personId: string) => void;
  searchJobs: () => void;
  takeJob: (careerId: string) => void;
  quitJob: () => void;
  enroll: () => void;
  dropUni: () => void;
  buy: (catalogId: string, financed: boolean) => void;
  sell: (assetId: string) => void;
  loan: (amount: number) => void;
  repay: (amount: number) => void;
  invest: (amount: number) => void;
  withdraw: () => void;
  wipe: () => Promise<void>;
}

export const summarize = (l: Life): LifeSummary => ({
  id: l.id,
  name: `${l.name} ${l.surname}`,
  birthYear: l.birthYear,
  deathYear: l.year,
  age: l.age,
  cause: l.cause ?? 'desconocida',
  money: l.money,
  job: l.job?.title ?? (l.flags.retired ? 'Jubilado/a' : 'Sin trabajo'),
  lineageId: l.lineageId,
  generation: l.generation,
  parentId: l.parentLifeId,
  look: l.look,
  gender: l.gender,
  legacy: legacyPoints(l),
  children: l.people.filter((p) => p.kind === 'child').length,
  netWorth: netWorth(l),
  scenarioId: l.scenario?.id,
  scenarioResult: l.scenario?.status,
});

async function saveSlot(i: number, life: Life | null): Promise<void> {
  try {
    if (life) await AsyncStorage.setItem(slotKey(i), JSON.stringify(life));
    else await AsyncStorage.removeItem(slotKey(i));
  } catch {
    // Sin guardado: el juego sigue funcionando en memoria.
  }
}

async function saveMeta(m: Omit<Meta, 'schemaVersion'>): Promise<void> {
  try {
    const data: Meta = { schemaVersion: SCHEMA_VERSION, ...m };
    await AsyncStorage.setItem(META_KEY, JSON.stringify(data));
  } catch {
    // nada
  }
}

const emptySlots = (): (Life | null)[] => Array.from({ length: SLOT_COUNT }, () => null);

export const useGame = create<GameState>((set, get) => {
  const meta = (over: Partial<Meta> = {}): Omit<Meta, 'schemaVersion'> => {
    const s = get();
    return { history: s.history, achievements: s.achievements, scenarioWins: s.scenarioWins, activeSlot: s.activeSlot, ...over };
  };

  /** Aplica un cambio sobre una copia de la vida, guarda y registra logros, escenario y muerte. */
  const mutate = (fn: (l: Life) => void) => {
    const cur = get().life;
    if (!cur) return;
    const next = cloneLife(cur);
    fn(next);

    let achievements = get().achievements;
    let toast = get().toast;
    for (const a of ACHIEVEMENTS) {
      if (!achievements.includes(a.id) && a.check(next)) {
        achievements = [...achievements, a.id];
        toast = { id: Date.now() + achievements.length, title: a.title, icon: a.icon };
        addLog(next, `Logro desbloqueado: ${a.title}.`, 'good', 'Logro', 'Trophy');
      }
    }

    let scenarioWins = get().scenarioWins;
    const result = checkScenario(next);
    if (result === 'won' && next.scenario && !scenarioWins.includes(next.scenario.id)) {
      scenarioWins = [...scenarioWins, next.scenario.id];
      const title = getScenario(next.scenario.id)?.title ?? 'Escenario';
      toast = { id: Date.now() + 999, title: `Escenario: ${title}`, icon: 'Trophy' };
    }

    let history = get().history;
    if (cur.alive && !next.alive) history = [summarize(next), ...history];

    const slots = get().slots.slice();
    const a = get().activeSlot;
    slots[a] = next;
    set({ life: next, slots, history, achievements, scenarioWins, toast });
    void saveSlot(a, next);
    void saveMeta(meta({ history, achievements, scenarioWins }));
  };

  const applyLife = (life: Life | null) => {
    const slots = get().slots.slice();
    const a = get().activeSlot;
    slots[a] = life;
    set({ life, slots, tab: 'life', creating: null });
    void saveSlot(a, life);
    void saveMeta(meta());
  };

  return {
    ready: false,
    creating: null,
    slots: emptySlots(),
    activeSlot: 0,
    life: null,
    history: [],
    achievements: [],
    scenarioWins: [],
    toast: null,
    clearToast: () => set({ toast: null }),
    tab: 'life',

    load: async () => {
      try {
        const rawMeta = await AsyncStorage.getItem(META_KEY);
        if (rawMeta) {
          const m = JSON.parse(rawMeta) as Meta;
          const slots = emptySlots();
          for (let i = 0; i < SLOT_COUNT; i++) {
            const raw = await AsyncStorage.getItem(slotKey(i));
            if (raw) slots[i] = migrateLife(JSON.parse(raw) as Life);
          }
          const active = Math.min(Math.max(m.activeSlot ?? 0, 0), SLOT_COUNT - 1);
          set({ slots, activeSlot: active, life: slots[active], history: m.history ?? [], achievements: m.achievements ?? [], scenarioWins: m.scenarioWins ?? [], ready: true });
          return;
        }
        // Migración desde la versión de una sola partida.
        const old = await AsyncStorage.getItem(OLD_KEY);
        if (old) {
          const d = JSON.parse(old) as { life: Life | null; history?: LifeSummary[]; achievements?: string[] };
          const slots = emptySlots();
          slots[0] = d.life ? migrateLife(d.life) : null;
          set({ slots, activeSlot: 0, life: slots[0], history: d.history ?? [], achievements: d.achievements ?? [], ready: true });
          void saveSlot(0, slots[0]);
          void saveMeta(meta());
          return;
        }
      } catch {
        // Partida corrupta: se arranca de cero.
      }
      set({ ready: true });
    },

    setTab: (tab) => set({ tab }),

    startCreating: () => set({ creating: { step: 'mode' } }),
    setCreating: (creating) => set({ creating }),
    cancelCreate: () => set({ creating: null }),

    newLife: (opts) => {
      const sid = get().creating?.scenarioId;
      const life = (sid ? createScenarioLife(sid, opts) : null) ?? createLife(undefined, opts);
      applyLife(life);
    },

    continueAsHeir: (personId) => {
      const prev = get().life;
      if (!prev) return false;
      const heir = createHeir(prev, personId);
      if (!heir) return false;
      applyLife(heir);
      return true;
    },

    switchSlot: (i) => {
      const life = get().slots[i] ?? null;
      set({ activeSlot: i, life, tab: 'life', creating: null });
      void saveMeta(meta({ activeSlot: i }));
    },

    deleteSlot: (i) => {
      const slots = get().slots.slice();
      slots[i] = null;
      const isActive = get().activeSlot === i;
      set({ slots, life: isActive ? null : get().life });
      void saveSlot(i, null);
    },

    exportData: () => {
      const s = get();
      return JSON.stringify({ app: 'vidasim', schemaVersion: SCHEMA_VERSION, activeSlot: s.activeSlot, slots: s.slots, history: s.history, achievements: s.achievements, scenarioWins: s.scenarioWins });
    },

    importData: (json) => {
      try {
        const d = JSON.parse(json.trim()) as { app?: string; slots?: (Life | null)[]; history?: LifeSummary[]; achievements?: string[]; scenarioWins?: string[]; activeSlot?: number };
        if (d.app !== 'vidasim' || !Array.isArray(d.slots)) return 'Este texto no es una copia de seguridad de VidaSim.';
        const slots = emptySlots();
        d.slots.slice(0, SLOT_COUNT).forEach((l, i) => {
          slots[i] = l ? migrateLife(l) : null;
        });
        const active = Math.min(Math.max(d.activeSlot ?? 0, 0), SLOT_COUNT - 1);
        set({ slots, activeSlot: active, life: slots[active], history: d.history ?? [], achievements: d.achievements ?? [], scenarioWins: d.scenarioWins ?? [], tab: 'life', creating: null });
        slots.forEach((l, i) => void saveSlot(i, l));
        void saveMeta(meta());
        return null;
      } catch {
        return 'No se pudo leer el texto. Copialo completo, sin cortar.';
      }
    },

    ageUp: () => mutate(ageUp),
    choose: (i) => mutate((l) => resolveChoice(l, i)),
    dismiss: () => mutate(dismissPrompt),
    activity: (id) => mutate((l) => runActivity(l, id)),
    personAction: (a, p) => mutate((l) => runPersonAction(l, a, p)),
    searchJobs: () => mutate(searchJobs),
    takeJob: (id) => mutate((l) => takeJob(l, id)),
    quitJob: () => mutate(quitJob),
    enroll: () => mutate(enrollUniversity),
    dropUni: () => mutate(dropUniversity),
    buy: (id, financed) => mutate((l) => buyAsset(l, id, financed)),
    sell: (id) => mutate((l) => sellAsset(l, id)),
    loan: (n) => mutate((l) => takeLoan(l, n)),
    repay: (n) => mutate((l) => repayLoan(l, n)),
    invest: (n) => mutate((l) => investMoney(l, n)),
    withdraw: () => mutate(withdrawInvestments),

    wipe: async () => {
      set({ life: null, slots: emptySlots(), activeSlot: 0, history: [], achievements: [], scenarioWins: [], tab: 'life', creating: null });
      try {
        for (let i = 0; i < SLOT_COUNT; i++) await AsyncStorage.removeItem(slotKey(i));
        await AsyncStorage.removeItem(META_KEY);
        await AsyncStorage.removeItem(OLD_KEY);
      } catch {
        // nada
      }
    },
  };
});

// Solo en desarrollo: permite inspeccionar/manejar el juego desde la consola del navegador.
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  (globalThis as unknown as { __game: typeof useGame }).__game = useGame;
}
