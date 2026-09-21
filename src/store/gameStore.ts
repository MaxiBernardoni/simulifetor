import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Life, LifeSummary } from '../engine/types';
import { SCHEMA_VERSION } from '../engine/types';
import { cloneLife, createLife, migrateLife } from '../engine/life';
import type { CreateOpts } from '../engine/life';
import { ageUp } from '../engine/ageUp';
import { addLog } from '../engine/effects';
import { ACHIEVEMENTS } from '../content/achievements';
import { buyAsset, investMoney, repayLoan, sellAsset, takeLoan, withdrawInvestments } from '../engine/assets';
import { dismissPrompt, resolveChoice } from '../engine/events';
import {
  dropUniversity,
  enrollUniversity,
  quitJob,
  runActivity,
  runPersonAction,
  searchJobs,
  takeJob,
} from '../engine/actions';

const KEY = 'vidasim.save.v1';

export type Tab = 'life' | 'activities' | 'work' | 'people' | 'assets' | 'more';

interface SaveData {
  schemaVersion: number;
  life: Life | null;
  history: LifeSummary[];
  achievements?: string[];
}

interface GameState {
  ready: boolean;
  creating: boolean;
  life: Life | null;
  history: LifeSummary[];
  achievements: string[];
  toast: { id: number; title: string; icon: string } | null;
  clearToast: () => void;
  tab: Tab;
  load: () => Promise<void>;
  setTab: (t: Tab) => void;
  startCreating: () => void;
  cancelCreate: () => void;
  newLife: (opts?: CreateOpts) => void;
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

const summarize = (l: Life): LifeSummary => ({
  id: l.id,
  name: `${l.name} ${l.surname}`,
  birthYear: l.birthYear,
  deathYear: l.year,
  age: l.age,
  cause: l.cause ?? 'desconocida',
  money: l.money,
  job: l.job?.title ?? (l.flags.retired ? 'Jubilado/a' : 'Sin trabajo'),
});

async function persist(life: Life | null, history: LifeSummary[], achievements: string[]): Promise<void> {
  try {
    const data: SaveData = { schemaVersion: SCHEMA_VERSION, life, history, achievements };
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Sin guardado: el juego sigue funcionando en memoria.
  }
}

export const useGame = create<GameState>((set, get) => {
  /** Aplica un cambio sobre una copia de la vida, guarda y registra la muerte. */
  const mutate = (fn: (l: Life) => void) => {
    const cur = get().life;
    if (!cur) return;
    const next = cloneLife(cur);
    fn(next);
    let history = get().history;
    if (cur.alive && !next.alive) history = [summarize(next), ...history];
    // Logros nuevos.
    let achievements = get().achievements;
    let toast = get().toast;
    for (const a of ACHIEVEMENTS) {
      if (!achievements.includes(a.id) && a.check(next)) {
        achievements = [...achievements, a.id];
        toast = { id: Date.now() + achievements.length, title: a.title, icon: a.icon };
        addLog(next, `Logro desbloqueado: ${a.title}.`, 'good', 'Logro', 'Trophy');
      }
    }
    set({ life: next, history, achievements, toast });
    void persist(next, history, achievements);
  };

  return {
    ready: false,
    creating: false,
    life: null,
    history: [],
    achievements: [],
    toast: null,
    clearToast: () => set({ toast: null }),
    tab: 'life',

    load: async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const data = JSON.parse(raw) as SaveData;
          if (data.schemaVersion >= 2 && data.schemaVersion <= SCHEMA_VERSION) {
            set({
              life: data.life ? migrateLife(data.life) : null,
              history: data.history ?? [],
              achievements: data.achievements ?? [],
              ready: true,
            });
            return;
          }
        }
      } catch {
        // Partida corrupta: se arranca de cero.
      }
      set({ ready: true });
    },

    setTab: (tab) => set({ tab }),

    startCreating: () => set({ creating: true }),
    cancelCreate: () => set({ creating: false }),

    newLife: (opts) => {
      const life = createLife(undefined, opts);
      set({ life, tab: 'life', creating: false });
      void persist(life, get().history, get().achievements);
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
      set({ life: null, history: [], achievements: [], tab: 'life', creating: false });
      try {
        await AsyncStorage.removeItem(KEY);
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
