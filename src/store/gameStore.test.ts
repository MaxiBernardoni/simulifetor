/* eslint-disable import/first */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// AsyncStorage en memoria.
const mem = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => mem.get(k) ?? null,
    setItem: async (k: string, v: string) => void mem.set(k, v),
    removeItem: async (k: string) => void mem.delete(k),
    clear: async () => mem.clear(),
  },
}));

import { useGame } from './gameStore';
import { migrateLife, createLife } from '../engine/life';
import { checkLife, checkWorld } from '../engine/invariants';
import { canSwitchTo } from '../engine/kinship';

const tick = () => new Promise((r) => setTimeout(r, 5));
const get = () => useGame.getState();

async function fresh() {
  mem.clear();
  await get().wipe();
  useGame.setState({ ready: false });
  await get().load();
}

/** Juega un año resolviendo cualquier decisión pendiente. */
function year() {
  for (let i = 0; i < 10 && get().life!.pending.length; i++) {
    if (get().life!.pending[0].kind === 'result') get().dismiss();
    else get().choose(0);
  }
  get().ageUp();
}

describe('store: guardado y ranuras', () => {
  beforeEach(fresh);

  it('nueva vida se guarda en la ranura activa con su mundo y meta', async () => {
    get().newLife({ name: 'Ana', surname: 'Prueba', gender: 'F' });
    await tick();
    const s = get();
    expect(s.life?.name).toBe('Ana');
    expect(s.world).toBeTruthy();
    expect(mem.has('vidasim.slot.0')).toBe(true);
    expect(mem.has('vidasim.world.0')).toBe(true);
    expect(mem.has('vidasim.meta.v2')).toBe(true);
    expect(checkLife(s.life!)).toEqual([]);
    expect(checkWorld(s.world!, s.life!)).toEqual([]);
  });

  it('ageUp guarda y recargar devuelve el mismo estado', async () => {
    get().newLife({ name: 'Ana', surname: 'Prueba' });
    for (let i = 0; i < 6; i++) year();
    await tick();
    const before = JSON.stringify(get().life);
    const worldBefore = JSON.stringify(get().world);
    useGame.setState({ life: null, world: null, slots: [null, null, null], worlds: [null, null, null], ready: false });
    await get().load();
    expect(get().ready).toBe(true);
    expect(JSON.stringify(get().life)).toBe(before);
    expect(JSON.stringify(get().world)).toBe(worldBefore);
  });

  it('cambiar de ranura y volver conserva cada partida', async () => {
    get().newLife({ name: 'Uno', surname: 'A' });
    await tick();
    get().switchSlot(1);
    get().newLife({ name: 'Dos', surname: 'B' });
    await tick();
    expect(get().life?.name).toBe('Dos');
    get().switchSlot(0);
    expect(get().life?.name).toBe('Uno');
    get().switchSlot(1);
    expect(get().life?.name).toBe('Dos');
  });

  it('exportar → borrar todo → importar restaura todo', async () => {
    get().newLife({ name: 'Ana', surname: 'Prueba' });
    for (let i = 0; i < 4; i++) year();
    const backup = get().exportData();
    const snapshot = JSON.stringify(get().life);
    await get().wipe();
    expect(get().life).toBeNull();
    expect(get().importData(backup)).toBeNull();
    expect(JSON.stringify(get().life)).toBe(snapshot);
    expect(get().world).toBeTruthy();
  });

  it('un texto inválido devuelve error y no modifica el estado', async () => {
    get().newLife({ name: 'Ana', surname: 'Prueba' });
    const snapshot = JSON.stringify(get().life);
    for (const bad of ['', 'hola', '{"app":"otra"}', '{"app":"vidasim"}', '{"app":"vidasim","slots":"x"']) {
      expect(get().importData(bad), bad).toBeTypeOf('string');
    }
    expect(JSON.stringify(get().life)).toBe(snapshot);
  });

  it('migra una partida de la versión anterior (una sola ranura, vida vieja) y crea su mundo', async () => {
    mem.clear();
    const old = createLife(42, { name: 'Vieja', surname: 'Partida' }) as unknown as Record<string, unknown>;
    for (const k of ['assets', 'loan', 'invested', 'trial', 'lineageId', 'generation', 'nodeId']) delete old[k];
    for (const p of old.people as Record<string, unknown>[]) delete p.nodeId;
    mem.set('vidasim.save.v1', JSON.stringify({ life: old, history: [], achievements: ['saver'] }));
    useGame.setState({ ready: false, life: null, world: null, slots: [null, null, null], worlds: [null, null, null] });
    await get().load();
    const s = get();
    expect(s.life?.name).toBe('Vieja');
    expect(s.life?.assets).toEqual([]);
    expect(s.world).toBeTruthy();
    expect(s.achievements).toContain('saver');
    expect(checkLife(s.life!)).toEqual([]);
    expect(checkWorld(s.world!, s.life!)).toEqual([]);
  });

  it('una partida corrupta no rompe el arranque', async () => {
    mem.clear();
    mem.set('vidasim.meta.v2', '{ esto no es json');
    useGame.setState({ ready: false });
    await get().load();
    expect(get().ready).toBe(true);
    expect(get().life).toBeNull();
  });
});

describe('store: tutorial', () => {
  it('una instalación nueva muestra el tutorial y una partida existente sin la marca no', async () => {
    mem.clear();
    useGame.setState({ ready: false, seenTutorial: false });
    await get().load();
    expect(get().seenTutorial).toBe(false);
    get().markTutorialSeen();
    expect(get().seenTutorial).toBe(true);
    await tick();
    // meta de una versión anterior: no tiene `seenTutorial`
    mem.set('vidasim.meta.v2', JSON.stringify({ schemaVersion: 4, history: [], achievements: [], scenarioWins: [], activeSlot: 0 }));
    useGame.setState({ ready: false, seenTutorial: false });
    await get().load();
    expect(get().seenTutorial).toBe(true);
  });
});

describe('store: vibración', () => {
  it('viene activada por defecto, se puede apagar y queda guardada', async () => {
    mem.clear();
    useGame.setState({ ready: false });
    await get().load();
    expect(get().hapticsEnabled).toBe(true);
    get().setHapticsEnabled(false);
    expect(get().hapticsEnabled).toBe(false);
    await tick();
    useGame.setState({ ready: false });
    await get().load();
    expect(get().hapticsEnabled).toBe(false);
  });

  it('una meta de una versión anterior (sin el campo) la deja activada', async () => {
    mem.clear();
    mem.set('vidasim.meta.v2', JSON.stringify({ schemaVersion: 4, history: [], achievements: [], scenarioWins: [], activeSlot: 0 }));
    useGame.setState({ ready: false });
    await get().load();
    expect(get().hapticsEnabled).toBe(true);
  });
});

describe('store: cambio de personaje', () => {
  beforeEach(fresh);

  it('con decisiones pendientes devuelve el mensaje correcto y no cambia nada', () => {
    get().newLife({ name: 'Ana', surname: 'Prueba' });
    const w = get().world!;
    const target = Object.values(w.world.nodes).find(
      (n) => n.id !== w.world.currentId && canSwitchTo(w.world, w.world.currentId, n.id).ok,
    )!;
    const life = get().life!;
    useGame.setState({ life: { ...life, pending: [{ kind: 'result', title: 'x', text: 'y', deltas: [] }] } });
    expect(get().switchCharacter(target.id)).toMatch(/Terminá/);
    expect(get().world!.world.currentId).toBe(w.world.currentId);
  });

  it('rechaza a quien la regla no permite y acepta a un pariente elegible', () => {
    get().newLife({ name: 'Ana', surname: 'Prueba' });
    const w = get().world!;
    const from = w.world.currentId;
    const nodes = Object.values(w.world.nodes).filter((n) => n.id !== from);
    const no = nodes.find((n) => !canSwitchTo(w.world, from, n.id).ok);
    if (no) expect(get().switchCharacter(no.id)).toBeTypeOf('string');
    expect(get().world!.world.currentId).toBe(from);
    const yes = nodes.find((n) => canSwitchTo(w.world, from, n.id).ok)!;
    expect(get().switchCharacter(yes.id)).toBeNull();
    expect(get().world!.world.currentId).toBe(yes.id);
    expect(checkLife(get().life!)).toEqual([]);
    expect(checkWorld(get().world!, get().life!)).toEqual([]);
  });

  it('migrateLife deja válidas las vidas de versiones 2 y 3', () => {
    for (const v of [2, 3]) {
      const l = createLife(7 + v) as unknown as Record<string, unknown>;
      for (const k of ['assets', 'loan', 'invested', 'trial']) delete l[k];
      l.schemaVersion = v;
      const m = migrateLife(l as never);
      expect(checkLife(m)).toEqual([]);
      expect(m.assets).toEqual([]);
      expect(m.schemaVersion).toBeGreaterThanOrEqual(4);
    }
  });
});
