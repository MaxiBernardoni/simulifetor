import { SCHEMA_VERSION } from './types';
import type { Gender, Life, Look, Person } from './types';
import { rngFromState } from './rng';
import { makePerson, randomFirstName } from './people';
import { SURNAMES } from '../content/names';
import { EYE_COLORS, HAIR_COLORS, hairForGender, hairStylesFor, SKIN_TONES } from '../content/look';
import { addLog } from './effects';

export const BIRTH_YEAR_RANGE: [number, number] = [1950, 2010];

export interface CreateOpts {
  name?: string;
  surname?: string;
  gender?: Gender;
  look?: Partial<Look>;
  birthYear?: number;
  wealthClass?: 1 | 2 | 3;
  /** Familia a medida (herederos): reemplaza a la generada al azar. */
  people?: Person[];
  lineageId?: string;
  generation?: number;
  parentLifeId?: string;
  /** No escribe el texto de nacimiento (lo escribe quien llama). */
  silent?: boolean;
}

export function randomLook(rng: { int(a: number, b: number): number }, gender: Gender = 'M'): Look {
  const styles = hairStylesFor(gender);
  return {
    skin: rng.int(0, SKIN_TONES.length - 1),
    eyes: rng.int(0, EYE_COLORS.length - 1),
    hairStyle: styles[rng.int(0, styles.length - 1)],
    hairColor: rng.int(0, HAIR_COLORS.length - 1),
  };
}

export function createLife(seed?: number, opts: CreateOpts = {}): Life {
  const s0 = seed ?? Math.floor(Math.random() * 2147483647);
  const life = { rng: s0 } as Life;
  const rng = rngFromState(
    () => life.rng,
    (s) => {
      life.rng = s;
    },
  );

  const randomGender: Gender = rng.chance(0.5) ? 'M' : 'F';
  const gender: Gender = opts.gender ?? randomGender;
  const surname = opts.surname?.trim() || rng.pick(SURNAMES);
  const rl = randomLook(rng, gender);
  const look: Look = { ...rl, ...opts.look };
  look.hairStyle = hairForGender(look.hairStyle, gender);
  const drawnYear = rng.int(BIRTH_YEAR_RANGE[0], BIRTH_YEAR_RANGE[1]);
  const birthYear = opts.birthYear ?? drawnYear;
  const drawnWealth = (rng.weighted([1, 2, 3], (w) => (w === 1 ? 3 : w === 2 ? 5 : 2)) ?? 2) as 1 | 2 | 3;
  const wealthClass = opts.wealthClass ?? drawnWealth;

  const people: Person[] = [];
  const momAge = rng.int(20, 38);
  const dadAge = momAge + rng.int(-3, 8);
  people.push(makePerson(rng, 'mother', { gender: 'F', age: momAge, closeness: rng.int(60, 95), surname: rng.pick(SURNAMES) }));
  people.push(makePerson(rng, 'father', { gender: 'M', age: Math.max(20, dadAge), closeness: rng.int(50, 95), surname }));
  const sibs = rng.weighted([0, 1, 2], (n) => (n === 0 ? 35 : n === 1 ? 40 : 25)) ?? 0;
  for (let i = 0; i < sibs; i++) {
    people.push(makePerson(rng, 'sibling', { age: Math.max(0, rng.int(-6, 8)), closeness: rng.int(35, 80), surname }));
  }

  const lifeId = `life-${Date.now().toString(36)}-${rng.int(0, 9999)}`;
  Object.assign(life, {
    id: lifeId,
    lineageId: opts.lineageId ?? lifeId,
    generation: opts.generation ?? 1,
    parentLifeId: opts.parentLifeId,
    name: opts.name?.trim() || randomFirstName(rng, gender),
    surname,
    gender,
    look,
    birthYear,
    age: 0,
    year: birthYear,
    alive: true,
    wealthClass,
    stats: {
      happiness: rng.int(55, 95),
      health: rng.int(60, 98),
      smarts: rng.int(15, 95),
      looks: rng.int(15, 95),
    },
    money: 0,
    pension: 0,
    edu: { level: 0, enrolled: null, years: 0, gpa: 60 },
    job: null,
    offers: [],
    assets: [],
    loan: 0,
    invested: 0,
    trial: null,
    people: opts.people ?? people,
    flags: {},
    jailYears: 0,
    usedThisYear: [],
    eventLast: {},
    log: [],
    pending: [],
    lastDelta: [],
    schemaVersion: SCHEMA_VERSION,
  } satisfies Omit<Life, 'rng'>);

  if (opts.silent) return life;
  const clase = wealthClass === 1 ? 'una familia humilde' : wealthClass === 2 ? 'una familia de clase media' : 'una familia acomodada';
  const mom = people[0].name;
  const dad = people[1].name;
  addLog(life, `Naciste en ${birthYear}, en ${clase}. Tu madre es ${mom} y tu padre, ${dad}.`, 'system');
  if (sibs > 0) addLog(life, sibs === 1 ? 'Tenés un hermano/a.' : 'Tenés dos hermanos/as.', 'system');
  return life;
}

export const fullName = (l: Life) => `${l.name} ${l.surname}`;

export const cloneLife = (l: Life): Life => JSON.parse(JSON.stringify(l)) as Life;

/** Completa campos nuevos en partidas guardadas con una versión anterior. */
export function migrateLife(raw: Life): Life {
  const l = raw as Life;
  l.assets ??= [];
  l.loan ??= 0;
  l.invested ??= 0;
  l.trial ??= null;
  l.lineageId ??= l.id;
  l.generation ??= 1;
  // Los peinados ahora son de hombre o de mujer: las partidas viejas pasan al equivalente.
  if (l.look) l.look.hairStyle = hairForGender(l.look.hairStyle, l.gender);
  l.schemaVersion = SCHEMA_VERSION;
  return l;
}
