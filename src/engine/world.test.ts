import { describe, expect, it } from 'vitest';
import { createLife } from './life';
import { ageUp } from './ageUp';
import { autoPlay } from './autoplay';
import { advanceWorld, createWorld, syncLifeToWorld } from './world';
import type { TreeNode, World, WorldData } from './world';
import { buildForest, canSwitchTo, relationLabel, SWITCH_COOLDOWN_YEARS, MAX_SWITCHES_PER_GENERATION } from './kinship';
import { snapshotWorld, recordNews } from './news';
import { materializeLife } from './materialize';

const look = { skin: 1, eyes: 0, hairStyle: 0, hairColor: 1 };
function node(w: World, patch: Partial<TreeNode> & { id: string }): TreeNode {
  const n: TreeNode = {
    name: patch.id,
    surname: 'Test',
    gender: 'M',
    look,
    birthYear: 1950,
    alive: true,
    age: 40,
    blood: true,
    wealthClass: 2,
    ...patch,
  };
  w.nodes[n.id] = n;
  return n;
}

/** Familia armada a mano:
 *  BISA+BISABUELA → G1(abuelo)+G2(abuela) y hermano del abuelo H
 *  G → A(padre)+M(madre-inlaw) y U(tío)+UP(tía política)
 *  A → yo, sib(+sibP) ; U → cousin ; cousin → cousinKid ; sib → niece ; yo → kid ; H → hkid → hgrandkid
 */
function fixture(): World {
  const w: World = { familyId: 'f', surname: 'Test', year: 2020, currentId: 'me', seq: 0, rng: 1, nodes: {} };
  node(w, { id: 'bg', birthYear: 1900, age: 120, alive: false });
  node(w, { id: 'bm', gender: 'F', birthYear: 1902, age: 118, alive: false });
  node(w, { id: 'g1', fatherId: 'bg', motherId: 'bm', partnerId: 'g2', married: true, birthYear: 1930 });
  node(w, { id: 'g2', gender: 'F', partnerId: 'g1', married: true, birthYear: 1932, blood: true });
  node(w, { id: 'h', fatherId: 'bg', motherId: 'bm', birthYear: 1934 });
  node(w, { id: 'a', fatherId: 'g1', motherId: 'g2', partnerId: 'm', married: true, birthYear: 1958 });
  node(w, { id: 'm', gender: 'F', partnerId: 'a', married: true, blood: false, birthYear: 1960 });
  node(w, { id: 'u', fatherId: 'g1', motherId: 'g2', partnerId: 'up', birthYear: 1962 });
  node(w, { id: 'up', gender: 'F', partnerId: 'u', blood: false, birthYear: 1963 });
  node(w, { id: 'me', fatherId: 'a', motherId: 'm', birthYear: 1990, age: 30 });
  node(w, { id: 'sib', gender: 'F', fatherId: 'a', motherId: 'm', partnerId: 'sibp', birthYear: 1993 });
  node(w, { id: 'sibp', partnerId: 'sib', blood: false, birthYear: 1992 });
  node(w, { id: 'cousin', fatherId: 'u', motherId: 'up', birthYear: 1991 });
  node(w, { id: 'cousinKid', fatherId: 'cousin', birthYear: 2015, age: 5 });
  node(w, { id: 'niece', gender: 'F', fatherId: 'sibp', motherId: 'sib', birthYear: 2016, age: 4 });
  node(w, { id: 'kid', motherId: undefined, fatherId: 'me', birthYear: 2018, age: 2 });
  node(w, { id: 'hkid', fatherId: 'h', birthYear: 1965 });
  node(w, { id: 'hgrandkid', fatherId: 'hkid', birthYear: 1992 });
  return w;
}

describe('parentesco y regla de cambio de personaje', () => {
  const w = fixture();
  const can = (id: string) => canSwitchTo(w, 'me', id).ok;

  it('etiquetas de parentesco', () => {
    expect(relationLabel(w, 'me', 'a')).toBe('Padre');
    expect(relationLabel(w, 'me', 'm')).toBe('Madre');
    expect(relationLabel(w, 'me', 'sib')).toBe('Hermana');
    expect(relationLabel(w, 'me', 'g1')).toBe('Abuelo');
    expect(relationLabel(w, 'me', 'u')).toBe('Tío');
    expect(relationLabel(w, 'me', 'cousin')).toBe('Primo');
    expect(relationLabel(w, 'me', 'niece')).toBe('Sobrina');
    expect(relationLabel(w, 'me', 'kid')).toBe('Hijo');
    expect(relationLabel(w, 'me', 'sibp')).toBe('Cuñado');
    expect(relationLabel(w, 'me', 'up')).toBe('Tía política');
    expect(relationLabel(w, 'me', 'cousinKid')).toBe('Sobrino segundo');
    expect(relationLabel(w, 'me', 'h')).toBe('Tío abuelo');
    expect(relationLabel(w, 'me', 'hgrandkid')).toBe('Primo segundo');
  });

  it('se puede cambiar a parientes de sangre con hasta 2 generaciones de distancia', () => {
    for (const id of ['a', 'm', 'sib', 'g1', 'g2', 'u', 'cousin', 'niece', 'kid']) expect(can(id), id).toBe(true);
  });

  it('no se puede cambiar a parientes lejanos ni políticos, pero siguen en el árbol', () => {
    for (const id of ['sibp', 'up', 'h', 'hkid', 'hgrandkid', 'cousinKid']) expect(can(id), id).toBe(false);
    const forest = JSON.stringify(buildForest(w), (k, v) => (k === 'head' || k === 'partner' ? v && v.id : v));
    for (const id of ['sibp', 'up', 'h', 'hkid', 'hgrandkid', 'cousinKid']) expect(forest, id).toContain(`"${id}"`);
  });

  it('no se puede cambiar a los muertos ni a uno mismo, y dice por qué', () => {
    expect(canSwitchTo(w, 'me', 'bg').ok).toBe(false);
    expect(canSwitchTo(w, 'me', 'me').ok).toBe(false);
    expect(canSwitchTo(w, 'me', 'sibp').reason).toMatch(/política|sangre/);
    expect(canSwitchTo(w, 'me', 'hgrandkid').reason).toMatch(/2 generaciones/);
  });

  it('el bosque arma unidades con pareja e hijos sin repetir descendientes', () => {
    const seen = new Map<string, number>();
    const walk = (u: ReturnType<typeof buildForest>[number]) => {
      seen.set(u.head.id, (seen.get(u.head.id) ?? 0) + 1);
      u.children.forEach(walk);
    };
    buildForest(w).forEach(walk);
    for (const [id, n] of seen) expect(n, id).toBe(1);
    expect(seen.has('me')).toBe(true);
  });
});

describe('mundo familiar', () => {
  function newWorld(seed: number) {
    const life = createLife(seed);
    const wd = createWorld(life);
    return { life, wd };
  }

  it('createWorld arma padres, abuelos y referencias válidas', () => {
    for (let s = 1; s <= 40; s++) {
      const { life, wd } = newWorld(s);
      const w = wd.world;
      expect(w.nodes[life.nodeId!]).toBeTruthy();
      const me = w.nodes[life.nodeId!];
      expect(me.fatherId && me.motherId).toBeTruthy();
      expect(w.nodes[me.fatherId!].fatherId).toBeTruthy();
      expect(w.nodes[me.motherId!].motherId).toBeTruthy();
      for (const n of Object.values(w.nodes)) {
        for (const ref of [n.fatherId, n.motherId, n.partnerId]) if (ref) expect(w.nodes[ref], `${n.id}->${ref}`).toBeTruthy();
      }
      // Los familiares directos de la vida quedan enlazados al árbol.
      for (const p of life.people.filter((x) => x.kind === 'mother' || x.kind === 'father' || x.kind === 'sibling'))
        expect(p.nodeId).toBeTruthy();
    }
  });

  it('a los abuelos y tíos se les puede cambiar; a los primos segundos, no', () => {
    const { life, wd } = newWorld(5);
    const w = wd.world;
    for (const n of Object.values(w.nodes)) {
      const c = canSwitchTo(w, life.nodeId!, n.id);
      if (c.ok) expect(n.alive && n.blood).toBe(true);
    }
  });

  it('60 años de mundo: la familia envejece, se casa, tiene hijos y muere, siempre consistente', () => {
    const { life, wd } = newWorld(11);
    const w = wd.world;
    const start = Object.keys(w.nodes).length;
    for (let i = 0; i < 60 && life.alive; i++) {
      if (life.pending.length) life.pending = [];
      ageUp(life);
      advanceWorld(wd, life);
      expect(w.year).toBe(life.year);
    }
    const nodes = Object.values(w.nodes);
    expect(nodes.length).toBeGreaterThan(start);
    for (const n of nodes) {
      for (const ref of [n.fatherId, n.motherId, n.partnerId]) if (ref) expect(w.nodes[ref], `${n.id}->${ref}`).toBeTruthy();
      if (n.alive) expect(n.age, n.id).toBe(w.year - n.birthYear);
      else expect(n.deathYear, n.id).toBeDefined();
      if (n.fatherId) expect(w.nodes[n.fatherId], n.id).toBeDefined(); // pueden ser parejas del mismo género
    }
    // Las personas de la vida coinciden con el árbol.
    for (const p of life.people.filter((x) => x.nodeId)) {
      const n = w.nodes[p.nodeId!];
      expect(p.alive, p.name).toBe(n.alive);
      if (n.alive) expect(p.age).toBe(n.age);
    }
  });

  it('los hijos nacidos en la vida aparecen en el árbol como parientes de sangre', () => {
    for (let s = 1; s <= 200; s++) {
      const life = createLife(s);
      autoPlay(life, { seed: s, untilAge: 45, familyBias: true, crimeChance: 0.02 });
      if (!life.alive || !life.people.some((p) => p.kind === 'child')) continue;
      const wd = createWorld(life);
      for (const p of life.people.filter((x) => x.kind === 'child')) {
        const n = wd.world.nodes[p.nodeId!];
        expect(n.blood).toBe(true);
        expect([n.fatherId, n.motherId]).toContain(life.nodeId);
        expect(canSwitchTo(wd.world, life.nodeId!, n.id).ok).toBe(n.alive);
      }
      return;
    }
    throw new Error('no se encontró una vida con hijos');
  });

  it('materializar a un hermano genera una vida completa coherente con el árbol', () => {
    let sibId: string | undefined;
    let wd: WorldData | undefined;
    let life = createLife(1);
    for (let s = 1; s <= 100 && !sibId; s++) {
      life = createLife(s);
      wd = createWorld(life);
      sibId = life.people.find((p) => p.kind === 'sibling')?.nodeId;
    }
    expect(sibId).toBeTruthy();
    const w = wd!.world;
    for (let i = 0; i < 25; i++) {
      if (life.pending.length) life.pending = [];
      ageUp(life);
      advanceWorld(wd!, life);
    }
    const n = w.nodes[sibId!];
    if (!n.alive) return;
    const l = materializeLife(wd!, sibId!);
    expect(l).not.toBeNull();
    expect(l!.age).toBe(n.age);
    expect(l!.year).toBe(w.year);
    expect(l!.nodeId).toBe(sibId);
    expect(l!.surname).toBe(n.surname);
    expect(l!.people.some((p) => p.nodeId === life.nodeId)).toBe(true); // el personaje anterior es su hermano
    expect(l!.people.every((p) => !p.frozen)).toBe(true);
    if (n.partnerId) expect(l!.people.some((p) => p.kind === 'partner' && p.nodeId === n.partnerId)).toBe(true);
  });

  it('los bots siguen su propia vida hasta la muerte', () => {
    const { life, wd } = newWorld(3);
    const w = wd.world;
    const parentId = life.people.find((p) => p.kind === 'father')!.nodeId!;
    // El padre pasa a ser un bot con vida completa.
    const dad = materializeLife(wd, parentId)!;
    expect(dad).not.toBeNull();
    wd.lives[parentId] = dad;
    const ageStart = dad.age;
    const yearStart = w.year;
    let dead = false;
    for (let i = 0; i < 70 && !dead; i++) {
      if (life.pending.length) life.pending = [];
      if (life.alive) ageUp(life);
      const { died } = advanceWorld(wd, life);
      if (died.some((d) => d.nodeId === parentId)) dead = true;
      if (!life.alive) break;
    }
    if (dead) {
      expect(w.nodes[parentId].alive).toBe(false);
      expect(wd.lives[parentId]).toBeUndefined();
    } else if (wd.lives[parentId]) {
      expect(wd.lives[parentId].age).toBe(ageStart + (w.year - yearStart));
    }
  });

  it('syncLifeToWorld es idempotente', () => {
    const { life, wd } = newWorld(9);
    const before = Object.keys(wd.world.nodes).length;
    syncLifeToWorld(wd.world, life);
    syncLifeToWorld(wd.world, life);
    expect(Object.keys(wd.world.nodes).length).toBe(before);
  });
});

describe('anti-abuso de los cambios de personaje (T16)', () => {
  it('enfriamiento: hay que esperar entre cambios y el mensaje dice cuánto falta', () => {
    const w = fixture();
    w.lastSwitchYear = w.year - 1;
    const c = canSwitchTo(w, 'me', 'sib');
    expect(c.ok).toBe(false);
    expect(c.temporary).toBe(true);
    expect(c.reason).toMatch(new RegExp(`${SWITCH_COOLDOWN_YEARS - 1} años`));
    w.lastSwitchYear = w.year - SWITCH_COOLDOWN_YEARS;
    expect(canSwitchTo(w, 'me', 'sib').ok).toBe(true);
  });

  it('límite de cambios por generación', () => {
    const w = fixture();
    w.switchesInGeneration = { 3: MAX_SWITCHES_PER_GENERATION };
    // 'me' está en la generación 3 del árbol de prueba (depthOf)
    const c = canSwitchTo(w, 'me', 'sib');
    const gen = Object.keys(w.switchesInGeneration)[0];
    expect(typeof gen).toBe('string');
    if (!c.ok) expect(c.reason).toMatch(/demasiadas veces/);
    w.switchesInGeneration = {};
    for (let g = 0; g < 10; g++) w.switchesInGeneration[g] = MAX_SWITCHES_PER_GENERATION;
    expect(canSwitchTo(w, 'me', 'sib').ok).toBe(false);
  });

  it('el encadenamiento de saltos ya no permite alejarse de la línea de origen', () => {
    const w = fixture();
    // 1.er salto legal: de mí a mi primo. Desde el primo, su hijo está a 1 generación (regla básica ok)…
    w.currentId = 'cousin';
    w.anchorId = 'me';
    w.lastSwitchYear = w.year - 10;
    expect(canSwitchTo({ ...w, anchorId: undefined }, 'cousin', 'cousinKid').ok).toBe(true);
    // …pero medido desde mi personaje de origen queda a 3 generaciones: bloqueado.
    const c = canSwitchTo(w, 'cousin', 'cousinKid');
    expect(c.ok).toBe(false);
    expect(c.reason).toMatch(/línea familiar/);
  });

  it('cuando el personaje actual murió no aplica ninguna restricción extra', () => {
    const w = fixture();
    w.nodes.me.alive = false;
    w.lastSwitchYear = w.year;
    w.switchesInGeneration = { 0: 99, 1: 99, 2: 99, 3: 99, 4: 99 };
    expect(canSwitchTo(w, 'me', 'sib').ok).toBe(true);
    expect(canSwitchTo(w, 'me', 'kid').ok).toBe(true);
  });

  it('un mundo guardado sin los campos nuevos se comporta como sin historial', () => {
    const w = fixture();
    expect(w.lastSwitchYear).toBeUndefined();
    expect(w.anchorId).toBeUndefined();
    expect(canSwitchTo(w, 'me', 'sib').ok).toBe(true);
  });

  it('performSwitch registra el cambio voluntario y luego el enfriamiento lo bloquea', async () => {
    const { performSwitch } = await import('./switch');
    const life = createLife(21);
    const wd = createWorld(life);
    const from = wd.world.currentId;
    const target = Object.values(wd.world.nodes).find((n) => n.id !== from && canSwitchTo(wd.world, from, n.id).ok)!;
    const res = performSwitch(wd, life, target.id);
    expect('life' in res).toBe(true);
    expect(wd.world.anchorId).toBe(from);
    expect(wd.world.lastSwitchYear).toBe(wd.world.year);
    const back = performSwitch(wd, (res as { life: typeof life }).life, from);
    expect('error' in back && back.error).toMatch(/esperar/);
  });
});

describe('novedades de la familia', () => {
  it('registra nacimientos, muertes y casamientos con texto en voseo y descarta las viejas', () => {
    const w = fixture();
    const before = snapshotWorld(w);
    w.nodes.g1.alive = false;
    w.nodes.g1.age = 90;
    w.nodes.sibp.married = true;
    w.nodes.newborn = {
      ...w.nodes.cousin,
      id: 'newborn',
      name: 'Lucas Test',
      age: 0,
      birthYear: w.year,
      fatherId: 'cousin',
      motherId: 'up',
      partnerId: undefined,
    };
    recordNews(w, before);
    const texts = (w.news ?? []).map((n) => n.text);
    expect(texts.some((t) => /Falleció tu abuelo g1 a los 90 años/.test(t))).toBe(true);
    expect(texts.some((t) => /Nació Lucas/.test(t))).toBe(true);
    for (let i = 0; i < 80; i++) recordNews(w, before);
    expect((w.news ?? []).length).toBeLessThanOrEqual(60);
  });

  it('avanzar el mundo genera novedades con ids crecientes', () => {
    const life = createLife(31);
    const wd = createWorld(life);
    for (let i = 0; i < 40 && life.alive; i++) {
      life.pending = [];
      ageUp(life);
      advanceWorld(wd, life);
    }
    const news = wd.world.news ?? [];
    expect(news.length).toBeGreaterThan(0);
    for (let i = 1; i < news.length; i++) expect(news[i].id).toBeGreaterThan(news[i - 1].id);
  });
});
