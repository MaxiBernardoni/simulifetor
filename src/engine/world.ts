import type { Gender, Life, Look, Person } from './types';
import { rngFromState } from './rng';
import type { Rng } from './rng';
import { rngOf } from './rng';
import { FEMALE_NAMES, MALE_NAMES, SURNAMES } from '../content/names';
import { baseMortality, personDied } from './ageUp';
import { inheritLook } from './people';
import { deriveLook } from './looks';
import { netWorth } from './assets';
import { autoPlay } from './autoplay';

/** Una persona del árbol genealógico. Puede tener una vida completa o simularse de forma liviana. */
export interface TreeNode {
  id: string;
  name: string;
  surname: string;
  gender: Gender;
  look: Look;
  birthYear: number;
  deathYear?: number;
  cause?: string;
  alive: boolean;
  age: number;
  fatherId?: string;
  motherId?: string;
  partnerId?: string;
  married?: boolean;
  exIds?: string[];
  /** Descendiente de la familia (no es pariente político). */
  blood: boolean;
  wealthClass: 1 | 2 | 3;
  /** Datos de resumen, actualizados si la persona tiene vida completa. */
  job?: string;
  netWorth?: number;
  legacy?: number;
  full?: boolean;
}

export interface World {
  familyId: string;
  surname: string;
  /** Año calendario compartido por toda la familia. */
  year: number;
  currentId: string;
  seq: number;
  rng: number;
  nodes: Record<string, TreeNode>;
}

/** El mundo más las vidas completas de quienes ya jugaste (menos la actual, que vive en el store). */
export interface WorldData {
  world: World;
  lives: Record<string, Life>;
}

const first = (full: string) => full.split(' ')[0];
const lastName = (full: string) => full.split(' ').slice(1).join(' ');
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const wrng = (w: World): Rng =>
  rngFromState(
    () => w.rng,
    (s) => {
      w.rng = s;
    },
  );

function addNode(w: World, n: Omit<TreeNode, 'id'>): TreeNode {
  const id = `n${++w.seq}`;
  const node: TreeNode = { id, ...n };
  w.nodes[id] = node;
  return node;
}

const jobLabel = (l: Life): string =>
  !l.alive ? 'Fallecido/a' : l.jailYears > 0 ? 'Preso/a' : l.job?.title ?? (l.flags.retired ? 'Jubilado/a' : l.edu.enrolled ? 'Estudiante' : l.age < 5 ? 'Niño/a' : l.age < 18 ? 'Estudiante' : 'Sin trabajo');

/** Probabilidad aproximada de seguir vivo a cierta edad (para generar ancestros). */
const survives = (age: number) => (age < 50 ? 0.99 : age < 70 ? 0.93 : age < 80 ? 0.72 : age < 90 ? 0.38 : 0.1);

function randomLook(rng: Rng, near?: Look): Look {
  return {
    skin: near ? clamp(near.skin + rng.int(-1, 1), 0, 5) : rng.int(0, 5),
    eyes: rng.int(0, 5),
    hairStyle: rng.int(0, 7),
    hairColor: rng.int(0, 7),
  };
}

function setParents(child: TreeNode, a: TreeNode, b?: TreeNode): void {
  const put = (p: TreeNode) => {
    if (p.gender === 'F' && !child.motherId) child.motherId = p.id;
    else if (p.gender === 'M' && !child.fatherId) child.fatherId = p.id;
    else if (!child.fatherId) child.fatherId = p.id;
    else if (!child.motherId) child.motherId = p.id;
  };
  put(a);
  if (b) put(b);
}

function link(a: TreeNode, b: TreeNode, married: boolean): void {
  a.partnerId = b.id;
  b.partnerId = a.id;
  a.married = b.married = married;
}

function endRelationship(w: World, a: TreeNode, b?: TreeNode): void {
  a.exIds = [...(a.exIds ?? []), ...(b ? [b.id] : [])];
  if (b) b.exIds = [...(b.exIds ?? []), a.id];
  if (a.partnerId === b?.id) a.partnerId = undefined;
  if (b && b.partnerId === a.id) b.partnerId = undefined;
  a.married = b ? (b.married = false) : false;
  void w;
}

function setDeath(w: World, n: TreeNode, rng: Rng): void {
  const ageNow = w.year - n.birthYear;
  const at = clamp(rng.int(55, 96), 55, Math.max(55, ageNow));
  n.alive = false;
  n.deathYear = Math.min(w.year, n.birthYear + at);
  n.age = n.deathYear - n.birthYear;
  n.cause = 'vejez';
}

// ───────────────────────── Creación ─────────────────────────

function personNode(w: World, p: Person, life: Life, blood: boolean): TreeNode {
  const node = addNode(w, {
    name: first(p.name),
    surname: lastName(p.name) || life.surname,
    gender: p.gender,
    look: deriveLook(p, life.look),
    birthYear: life.year - p.age,
    alive: p.alive,
    age: p.age,
    blood,
    wealthClass: life.wealthClass,
    deathYear: p.alive ? undefined : life.year,
    cause: p.alive ? undefined : 'desconocida',
  });
  p.nodeId = node.id;
  p.look = node.look;
  return node;
}

/** Abuelos, tíos y primos de una persona que todavía no tiene padres en el árbol. */
function genAncestors(w: World, child: TreeNode, rng: Rng): void {
  const gfBirth = child.birthYear - rng.int(20, 34);
  const gmBirth = gfBirth + rng.int(-4, 5);
  const mk = (birth: number, gender: Gender, surname: string, parents?: [TreeNode, TreeNode]): TreeNode => {
    const age = w.year - birth;
    const node = addNode(w, {
      name: rng.pick(gender === 'M' ? MALE_NAMES : FEMALE_NAMES), surname, gender,
      look: randomLook(rng, child.look), birthYear: birth, alive: true, age, blood: true, wealthClass: child.wealthClass,
    });
    if (parents) setParents(node, parents[0], parents[1]);
    if (age >= 55 && !rng.chance(survives(age))) setDeath(w, node, rng);
    return node;
  };
  const gf = mk(gfBirth, 'M', child.surname);
  const gm = mk(gmBirth, 'F', rng.pick(SURNAMES));
  link(gf, gm, true);
  setParents(child, gf, gm);

  // Tíos y tíos políticos, con sus hijos (primos).
  const uncles = rng.weighted([0, 1, 2], (n) => (n === 0 ? 30 : n === 1 ? 45 : 25)) ?? 0;
  for (let i = 0; i < uncles; i++) {
    let birth = child.birthYear + rng.int(-9, 9);
    if (birth === child.birthYear) birth += 1;
    birth = Math.max(birth, Math.max(gfBirth, gmBirth) + 18);
    if (birth > w.year) continue;
    const gender: Gender = rng.chance(0.5) ? 'M' : 'F';
    const uncle = mk(birth, gender, child.surname, [gf, gm]);
    const uAge = w.year - birth;
    if (uAge >= 24 && rng.chance(0.65)) {
      const pg: Gender = gender === 'M' ? 'F' : 'M';
      const partner = addNode(w, {
        name: rng.pick(pg === 'M' ? MALE_NAMES : FEMALE_NAMES), surname: rng.pick(SURNAMES), gender: pg,
        look: randomLook(rng), birthYear: birth + rng.int(-6, 6), alive: true, age: 0, blood: false, wealthClass: child.wealthClass,
      });
      partner.age = w.year - partner.birthYear;
      if (partner.age >= 55 && !rng.chance(survives(partner.age))) setDeath(w, partner, rng);
      link(uncle, partner, rng.chance(0.85));
      const kids = rng.weighted([0, 1, 2, 3], (n) => (n === 0 ? 20 : n === 1 ? 35 : n === 2 ? 35 : 10)) ?? 0;
      for (let k = 0; k < kids; k++) {
        const kb = birth + rng.int(22, 34) + k * 2;
        if (kb > w.year) continue;
        const kg: Gender = rng.chance(0.5) ? 'M' : 'F';
        const father = uncle.gender === 'M' ? uncle : partner;
        const mother = uncle.gender === 'M' ? partner : uncle;
        const cousin = addNode(w, {
          name: rng.pick(kg === 'M' ? MALE_NAMES : FEMALE_NAMES), surname: father.surname, gender: kg,
          look: inheritLook(uncle.look, kg, rng), birthYear: kb, alive: true, age: w.year - kb, blood: true, wealthClass: child.wealthClass,
        });
        setParents(cousin, father, mother);
      }
    }
  }
}

/** Crea el árbol genealógico de una vida: su familia directa y una familia extendida generada. */
export function createWorld(life: Life): WorldData {
  const w: World = { familyId: life.lineageId, surname: life.surname, year: life.year, currentId: '', seq: 0, rng: (life.rng ^ 0x9e3779b9) | 0, nodes: {} };
  const rng = wrng(w);
  const me = addNode(w, {
    name: life.name, surname: life.surname, gender: life.gender, look: life.look, birthYear: life.birthYear,
    alive: life.alive, age: life.age, blood: true, wealthClass: life.wealthClass, full: true, job: jobLabel(life),
  });
  life.nodeId = me.id;
  w.currentId = me.id;

  const mother = life.people.find((p) => p.kind === 'mother');
  const father = life.people.find((p) => p.kind === 'father');
  const mN = mother ? personNode(w, mother, life, true) : undefined;
  const fN = father ? personNode(w, father, life, true) : undefined;
  if (mN) me.motherId = mN.id;
  if (fN) me.fatherId = fN.id;
  if (mN && fN) link(mN, fN, true);

  for (const p of life.people) {
    if (p.nodeId) continue;
    if (p.kind === 'sibling') {
      const n = personNode(w, p, life, true);
      n.fatherId = fN?.id;
      n.motherId = mN?.id;
    } else if (p.kind === 'partner') {
      const n = personNode(w, p, life, false);
      link(me, n, !!p.married);
    }
  }
  for (const p of life.people) {
    if (p.nodeId || p.kind !== 'child') continue;
    const n = personNode(w, p, life, true);
    setParents(n, me, life.people.find((x) => x.kind === 'partner' && x.nodeId) ? w.nodes[life.people.find((x) => x.kind === 'partner')!.nodeId!] : undefined);
  }
  if (mN) genAncestors(w, mN, rng);
  if (fN) genAncestors(w, fN, rng);
  return { world: w, lives: {} };
}

// ───────────────────────── Simulación liviana ─────────────────────────

function die(w: World, n: TreeNode, rng: Rng): void {
  n.alive = false;
  n.deathYear = w.year;
  n.cause = n.age >= 75 ? 'vejez' : rng.pick(['una enfermedad', 'un accidente', 'un infarto']);
}

function newPartner(w: World, n: TreeNode, rng: Rng): void {
  const pg: Gender = rng.chance(0.92) ? (n.gender === 'M' ? 'F' : 'M') : n.gender;
  const age = Math.max(18, n.age + rng.int(-5, 5));
  const p = addNode(w, {
    name: rng.pick(pg === 'M' ? MALE_NAMES : FEMALE_NAMES), surname: rng.pick(SURNAMES), gender: pg, look: randomLook(rng),
    birthYear: w.year - age, alive: true, age, blood: false, wealthClass: n.wealthClass,
  });
  link(n, p, rng.chance(0.8));
}

function bearChild(w: World, mother: TreeNode, father: TreeNode, rng: Rng): void {
  const g: Gender = rng.chance(0.5) ? 'M' : 'F';
  const from = father.blood ? father : mother;
  const c = addNode(w, {
    name: rng.pick(g === 'M' ? MALE_NAMES : FEMALE_NAMES), surname: father.surname, gender: g, look: inheritLook(from.look, g, rng),
    birthYear: w.year, alive: true, age: 0, blood: mother.blood || father.blood, wealthClass: mother.wealthClass,
  });
  setParents(c, mother, father);
}

/** Un año de vida liviana para alguien sin vida completa: edad, pareja, hijos y muerte. */
export function liteYear(w: World, n: TreeNode, rng: Rng): void {
  n.age++;
  const wealthFactor = n.wealthClass === 3 ? 0.85 : n.wealthClass === 1 ? 1.15 : 1;
  if (rng.chance(baseMortality(n.age) * wealthFactor)) {
    die(w, n, rng);
    return;
  }
  let partner = n.partnerId ? w.nodes[n.partnerId] : undefined;
  const hasKids = Object.values(w.nodes).some((k) => k.fatherId === n.id || k.motherId === n.id);
  if (partner?.alive && rng.chance(hasKids ? 0.005 : 0.012)) {
    endRelationship(w, n, partner);
    partner = undefined;
  }
  const single = !partner || !partner.alive;
  if (single && n.blood && n.age >= 20 && n.age <= (partner ? 75 : 55) && rng.chance(partner ? 0.04 : 0.09)) {
    if (partner) n.exIds = [...(n.exIds ?? []), partner.id];
    n.partnerId = undefined;
    newPartner(w, n, rng);
    partner = w.nodes[n.partnerId!];
  }
  if (n.gender === 'F' && partner?.alive && partner.gender === 'M' && n.age >= 20 && n.age <= 41 && partner.age <= 60) {
    const kids = Object.values(w.nodes).filter((k) => k.motherId === n.id).length;
    if (kids < 4 && rng.chance(kids === 0 ? 0.17 : 0.13)) bearChild(w, n, partner, rng);
  }
}

// ───────────────────────── Sincronización con las vidas completas ─────────────────────────

function updateNodeFromLife(node: TreeNode, life: Life): void {
  node.alive = life.alive;
  node.age = life.age;
  node.full = true;
  node.job = jobLabel(life);
  node.netWorth = netWorth(life);
  node.look = life.look;
  if (!life.alive && node.deathYear === undefined) {
    node.deathYear = life.year;
    node.cause = life.cause;
  }
}

/** Lleva al árbol lo que pasó dentro de una vida: hijos nuevos, parejas, rupturas y estado de la persona. */
export function syncLifeToWorld(w: World, life: Life): void {
  if (!life.nodeId) return;
  const me = w.nodes[life.nodeId];
  if (!me) return;
  updateNodeFromLife(me, life);
  const parents = life.people.filter((p) => (p.kind === 'mother' || p.kind === 'father') && p.nodeId).map((p) => w.nodes[p.nodeId!]).filter(Boolean);
  for (const p of life.people) {
    if (p.nodeId) {
      const n = w.nodes[p.nodeId];
      if (!n) continue;
      if (p.kind === 'partner' && me.partnerId !== n.id) {
        if (me.partnerId && w.nodes[me.partnerId]) endRelationship(w, me, w.nodes[me.partnerId]);
        link(me, n, !!p.married);
      } else if (p.kind === 'partner') {
        me.married = n.married = !!p.married;
      } else if (p.kind === 'ex' && me.partnerId === n.id) {
        endRelationship(w, me, n);
      }
      continue;
    }
    if (p.kind === 'partner') {
      const n = personNode(w, p, life, false);
      if (me.partnerId && w.nodes[me.partnerId]) endRelationship(w, me, w.nodes[me.partnerId]);
      link(me, n, !!p.married);
    } else if (p.kind === 'child') {
      const n = personNode(w, p, life, true);
      const partner = life.people.find((x) => x.kind === 'partner' && x.nodeId);
      setParents(n, me, partner ? w.nodes[partner.nodeId!] : undefined);
    } else if (p.kind === 'sibling') {
      const n = personNode(w, p, life, true);
      for (const par of parents) setParents(n, par);
    }
  }
}

/** Aplica al estado de una vida lo que decidió el mundo sobre sus familiares (edad, muerte, pareja). */
export function syncWorldToLife(w: World, life: Life): void {
  const rng = rngOf(life);
  for (const p of life.people) {
    if (!p.nodeId) continue;
    const n = w.nodes[p.nodeId];
    if (!n) continue;
    if (n.alive) {
      p.age = n.age;
      p.alive = true;
    } else if (p.alive) {
      p.age = n.age;
      personDied(life, p, rng);
    }
    if (p.kind === 'partner') {
      if (life.nodeId && n.partnerId !== life.nodeId) p.kind = 'ex';
      else p.married = !!n.married;
    }
  }
}

function botYear(w: World, wd: WorldData, id: string, died: Life[]): void {
  const life = wd.lives[id];
  const node = w.nodes[id];
  if (!life || !node) return;
  autoPlay(life, { seed: (life.rng ^ (life.age * 7919)) | 0, untilAge: life.age + 1, activityChance: 0.4, crimeChance: 0.03, familyBias: true });
  syncLifeToWorld(w, life);
  if (!life.alive) {
    died.push(life);
    delete wd.lives[id];
  }
}

/**
 * Hace pasar los años en la familia hasta el año de la vida actual: las vidas completas
 * siguen solas (bots) y el resto se simula de forma liviana.
 */
export function advanceWorld(wd: WorldData, current: Life): { died: Life[] } {
  const w = wd.world;
  const died: Life[] = [];
  const rng = wrng(w);
  // Los recién llegados (bebés, parejas nuevas) se registran DESPUÉS de avanzar el año, para que no envejezcan de más.
  while (w.year < current.year) {
    w.year++;
    for (const id of Object.keys(w.nodes)) {
      const node = w.nodes[id];
      if (!node.alive || id === w.currentId) continue;
      if (wd.lives[id]) botYear(w, wd, id, died);
      else liteYear(w, node, rng);
    }
  }
  for (const l of [current, ...Object.values(wd.lives)]) {
    syncLifeToWorld(w, l);
    syncWorldToLife(w, l);
  }
  return { died };
}

/** Migración / carga: si una vida no tiene mundo, se le crea uno. */
export function ensureWorld(life: Life | null, wd: WorldData | null | undefined): WorldData | null {
  if (!life) return wd ?? null;
  if (wd && wd.world.nodes[life.nodeId ?? '']) return wd;
  if (wd && life.nodeId === undefined) {
    // Vida guardada sin nodo: se reconstruye.
    return createWorld(life);
  }
  return createWorld(life);
}
