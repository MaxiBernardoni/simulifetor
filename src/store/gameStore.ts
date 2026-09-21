import { eraAt } from '../content/eras';
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
import { legacyPoints } from '../engine/dynasty';
import { checkScenario, createScenarioLife } from '../engine/scenarios';
import { getScenario } from '../content/scenarios';
import { advanceWorld, createWorld, syncLifeToWorld, syncWorldToLife } from '../engine/world';
import type { WorldData } from '../engine/world';
import { canSwitchTo, commonAncestor, relationLabel } from '../engine/kinship';
import { applySwitch, materializeLife } from '../engine/materialize';
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
const worldKey = (i: number) => `vidasim.world.${i}`;
const OLD_KEY = 'vidasim.save.v1';

export type Tab = 'life' | 'activities' | 'work' | 'people' | 'assets' | 'more' | 'tree' | 'slots' | 'backup' | 'ai';

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
  worlds: (WorldData | null)[];
  activeSlot: number;
  life: Life | null;
  /** Árbol genealógico de la partida activa. */
  world: WorldData | null;
  history: LifeSummary[];
  achievements: string[];
  scenarioWins: string[];
  toast: { id: number; title: string; icon: string; kicker?: string } | null;
  clearToast: () => void;
  tab: Tab;
  load: () => Promise<void>;
  setTab: (t: Tab) => void;
  startCreating: () => void;
  setCreating: (c: Creating | null) => void;
  cancelCreate: () => void;
  newLife: (opts?: CreateOpts) => void;
  /** Pasa a vivir la vida de otro familiar. Devuelve un mensaje si no se pudo. */
  switchCharacter: (nodeId: string) => string | null;
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

async function saveWorld(i: number, wd: WorldData | null): Promise<void> {
  try {
    if (wd) await AsyncStorage.setItem(worldKey(i), JSON.stringify(wd));
    else await AsyncStorage.removeItem(worldKey(i));
  } catch {
    // nada
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
const emptyWorlds = (): (WorldData | null)[] => Array.from({ length: SLOT_COUNT }, () => null);

/** Deja consistente una vida cargada con su mundo (crea el mundo si falta, repara enlaces rotos). */
function reconcile(life: Life | null, wd: WorldData | null | undefined): WorldData | null {
  if (!life) return wd ?? null;
  let world = wd ?? null;
  if (!world || !life.nodeId || !world.world.nodes[life.nodeId]) {
    life.nodeId = undefined;
    for (const p of life.people) p.nodeId = undefined;
    world = createWorld(life);
    return world;
  }
  for (const p of life.people) if (p.nodeId && !world.world.nodes[p.nodeId]) p.nodeId = undefined;
  syncLifeToWorld(world.world, life);
  return world;
}

export const useGame = create<GameState>((set, get) => {
  const meta = (over: Partial<Meta> = {}): Omit<Meta, 'schemaVersion'> => {
    const s = get();
    return { history: s.history, achievements: s.achievements, scenarioWins: s.scenarioWins, activeSlot: s.activeSlot, ...over };
  };

  /** Aplica un cambio sobre una copia de la vida, guarda y registra logros, escenario, familia y muerte. */
  const mutate = (fn: (l: Life) => void, opts: { tick?: boolean } = {}) => {
    const cur = get().life;
    if (!cur) return;
    const next = cloneLife(cur);
    fn(next);

    // Familia: los nuevos parientes se registran y, si pasó un año, el resto de la familia vive el suyo.
    let wd = get().world;
    let history = get().history;
    let worldChanged = false;
    if (wd && next.nodeId) {
      const seqBefore = wd.world.seq;
      if (opts.tick) {
        const { died } = advanceWorld(wd, next);
        for (const d of died) history = [summarize(d), ...history];
        worldChanged = true;
      } else {
        syncLifeToWorld(wd.world, next);
        syncWorldToLife(wd.world, next);
      }
      if (wd.world.seq !== seqBefore) worldChanged = true;
      wd = { world: wd.world, lives: wd.lives };
    }

    let achievements = get().achievements;
    let toast = get().toast;
    for (const a of ACHIEVEMENTS) {
      if (!achievements.includes(a.id) && a.check(next)) {
        achievements = [...achievements, a.id];
        toast = { id: Date.now() + achievements.length, title: a.title, icon: a.icon };
        addLog(next, `Logro desbloqueado: ${a.title}.`, 'good', 'Logro', 'Trophy');
      }
    }

    if (next.alive && eraAt(next.year).id !== eraAt(cur.year).id && next.age > 0) {
      toast = { id: Date.now() + 555, title: `Empiezan los ${eraAt(next.year).label.toLowerCase()}`, icon: 'Globe', kicker: 'Cambio de época' };
    }

    let scenarioWins = get().scenarioWins;
    const result = checkScenario(next);
    if (result === 'won' && next.scenario && !scenarioWins.includes(next.scenario.id)) {
      scenarioWins = [...scenarioWins, next.scenario.id];
      const title = getScenario(next.scenario.id)?.title ?? 'Escenario';
      toast = { id: Date.now() + 999, title: `Escenario: ${title}`, icon: 'Trophy' };
    }

    if (cur.alive && !next.alive) history = [summarize(next), ...history];

    const slots = get().slots.slice();
    const worlds = get().worlds.slice();
    const a = get().activeSlot;
    slots[a] = next;
    worlds[a] = wd;
    set({ life: next, slots, world: wd, worlds, history, achievements, scenarioWins, toast });
    void saveSlot(a, next);
    if (worldChanged) void saveWorld(a, wd);
    void saveMeta(meta({ history, achievements, scenarioWins }));
  };

  /** Empieza una vida nueva en la ranura activa, con su propio árbol genealógico. */
  const applyLife = (life: Life | null) => {
    const slots = get().slots.slice();
    const worlds = get().worlds.slice();
    const a = get().activeSlot;
    const wd = life ? createWorld(life) : null;
    slots[a] = life;
    worlds[a] = wd;
    set({ life, slots, world: wd, worlds, tab: 'life', creating: null });
    void saveSlot(a, life);
    void saveWorld(a, wd);
    void saveMeta(meta());
  };

  const loadSlotsFrom = (lives: (Life | null)[], worldsIn: (WorldData | null | undefined)[]) => {
    const slots = emptySlots();
    const worlds = emptyWorlds();
    lives.forEach((l, i) => {
      if (i >= SLOT_COUNT) return;
      slots[i] = l ? migrateLife(l) : null;
      worlds[i] = reconcile(slots[i], worldsIn[i]);
    });
    return { slots, worlds };
  };

  return {
    ready: false,
    creating: null,
    slots: emptySlots(),
    worlds: emptyWorlds(),
    activeSlot: 0,
    life: null,
    world: null,
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
          const lives: (Life | null)[] = [];
          const ws: (WorldData | null)[] = [];
          for (let i = 0; i < SLOT_COUNT; i++) {
            const raw = await AsyncStorage.getItem(slotKey(i));
            lives.push(raw ? (JSON.parse(raw) as Life) : null);
            const rw = await AsyncStorage.getItem(worldKey(i));
            ws.push(rw ? (JSON.parse(rw) as WorldData) : null);
          }
          const { slots, worlds } = loadSlotsFrom(lives, ws);
          const active = Math.min(Math.max(m.activeSlot ?? 0, 0), SLOT_COUNT - 1);
          set({
            slots, worlds, activeSlot: active, life: slots[active], world: worlds[active],
            history: m.history ?? [], achievements: m.achievements ?? [], scenarioWins: m.scenarioWins ?? [], ready: true,
          });
          slots.forEach((l, i) => {
            if (l && !ws[i]) void saveWorld(i, worlds[i]);
          });
          return;
        }
        // Migración desde la versión de una sola partida.
        const old = await AsyncStorage.getItem(OLD_KEY);
        if (old) {
          const d = JSON.parse(old) as { life: Life | null; history?: LifeSummary[]; achievements?: string[] };
          const { slots, worlds } = loadSlotsFrom([d.life], []);
          set({ slots, worlds, activeSlot: 0, life: slots[0], world: worlds[0], history: d.history ?? [], achievements: d.achievements ?? [], ready: true });
          void saveSlot(0, slots[0]);
          void saveWorld(0, worlds[0]);
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

    switchCharacter: (nodeId) => {
      const s = get();
      const cur = s.life;
      const wd = s.world;
      if (!cur || !wd) return 'No hay una partida activa.';
      if (cur.alive && cur.pending.length > 0) return 'Terminá lo que estás haciendo antes de cambiar de personaje.';
      if (cur.alive && cur.scenario?.status === 'active') return 'No podés cambiar de personaje mientras hay un escenario en curso.';
      const check = canSwitchTo(wd.world, wd.world.currentId, nodeId);
      if (!check.ok) return check.reason ?? 'No se puede cambiar a esa persona.';
      const target = wd.lives[nodeId] ?? materializeLife(wd, nodeId);
      if (!target) return 'No se pudo generar esa vida. Probá de nuevo.';
      delete wd.lives[nodeId];
      // El personaje anterior, si sigue vivo, continúa solo (bot).
      if (cur.alive) {
        cur.log = cur.log.slice(-40);
        wd.lives[cur.nodeId!] = cur;
      }
      applySwitch(target, cur, wd);
      wd.world.currentId = nodeId;
      syncLifeToWorld(wd.world, target);
      syncWorldToLife(wd.world, target);
      const slots = s.slots.slice();
      const worlds = s.worlds.slice();
      slots[s.activeSlot] = target;
      const nwd = { world: wd.world, lives: wd.lives };
      worlds[s.activeSlot] = nwd;
      set({ life: target, slots, world: nwd, worlds, tab: 'life', creating: null });
      void saveSlot(s.activeSlot, target);
      void saveWorld(s.activeSlot, nwd);
      return null;
    },

    switchSlot: (i) => {
      const life = get().slots[i] ?? null;
      set({ activeSlot: i, life, world: get().worlds[i] ?? null, tab: 'life', creating: null });
      void saveMeta(meta({ activeSlot: i }));
    },

    deleteSlot: (i) => {
      const slots = get().slots.slice();
      const worlds = get().worlds.slice();
      slots[i] = null;
      worlds[i] = null;
      const isActive = get().activeSlot === i;
      set({ slots, worlds, life: isActive ? null : get().life, world: isActive ? null : get().world });
      void saveSlot(i, null);
      void saveWorld(i, null);
    },

    exportData: () => {
      const s = get();
      return JSON.stringify({
        app: 'vidasim', schemaVersion: SCHEMA_VERSION, activeSlot: s.activeSlot, slots: s.slots, worlds: s.worlds,
        history: s.history, achievements: s.achievements, scenarioWins: s.scenarioWins,
      });
    },

    importData: (json) => {
      try {
        const d = JSON.parse(json.trim()) as {
          app?: string; slots?: (Life | null)[]; worlds?: (WorldData | null)[]; history?: LifeSummary[];
          achievements?: string[]; scenarioWins?: string[]; activeSlot?: number;
        };
        if (d.app !== 'vidasim' || !Array.isArray(d.slots)) return 'Este texto no es una copia de seguridad de VidaSim.';
        const { slots, worlds } = loadSlotsFrom(d.slots.slice(0, SLOT_COUNT), d.worlds ?? []);
        const active = Math.min(Math.max(d.activeSlot ?? 0, 0), SLOT_COUNT - 1);
        set({
          slots, worlds, activeSlot: active, life: slots[active], world: worlds[active], history: d.history ?? [],
          achievements: d.achievements ?? [], scenarioWins: d.scenarioWins ?? [], tab: 'life', creating: null,
        });
        slots.forEach((l, i) => {
          void saveSlot(i, l);
          void saveWorld(i, worlds[i]);
        });
        void saveMeta(meta());
        return null;
      } catch {
        return 'No se pudo leer el texto. Copialo completo, sin cortar.';
      }
    },

    ageUp: () => mutate(ageUp, { tick: true }),
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
      set({ life: null, world: null, slots: emptySlots(), worlds: emptyWorlds(), activeSlot: 0, history: [], achievements: [], scenarioWins: [], tab: 'life', creating: null });
      try {
        for (let i = 0; i < SLOT_COUNT; i++) {
          await AsyncStorage.removeItem(slotKey(i));
          await AsyncStorage.removeItem(worldKey(i));
        }
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
  (globalThis as unknown as { __kin: unknown }).__kin = { canSwitchTo, commonAncestor, relationLabel };
}
