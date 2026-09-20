import { SCHEMA_VERSION } from './types';
import type { Life, Person } from './types';
import { rngFromState } from './rng';
import { makePerson, randomFirstName } from './people';
import { SURNAMES } from '../content/names';
import { addLog } from './effects';

export const BIRTH_YEAR_RANGE: [number, number] = [1950, 2010];

export function createLife(seed?: number): Life {
  const s0 = seed ?? Math.floor(Math.random() * 2147483647);
  const life = { rng: s0 } as Life;
  const rng = rngFromState(
    () => life.rng,
    (s) => {
      life.rng = s;
    },
  );

  const gender = rng.chance(0.5) ? 'M' : 'F';
  const surname = rng.pick(SURNAMES);
  const birthYear = rng.int(BIRTH_YEAR_RANGE[0], BIRTH_YEAR_RANGE[1]);
  const wealthClass = (rng.weighted([1, 2, 3], (w) => (w === 1 ? 3 : w === 2 ? 5 : 2)) ?? 2) as 1 | 2 | 3;

  const people: Person[] = [];
  const momAge = rng.int(20, 38);
  const dadAge = momAge + rng.int(-3, 8);
  people.push(makePerson(rng, 'mother', { gender: 'F', age: momAge, closeness: rng.int(60, 95), surname: rng.pick(SURNAMES) }));
  people.push(makePerson(rng, 'father', { gender: 'M', age: Math.max(20, dadAge), closeness: rng.int(50, 95), surname }));
  const sibs = rng.weighted([0, 1, 2], (n) => (n === 0 ? 35 : n === 1 ? 40 : 25)) ?? 0;
  for (let i = 0; i < sibs; i++) {
    people.push(makePerson(rng, 'sibling', { age: Math.max(0, rng.int(-6, 8)), closeness: rng.int(35, 80), surname }));
  }

  Object.assign(life, {
    id: `life-${Date.now().toString(36)}-${rng.int(0, 9999)}`,
    name: randomFirstName(rng, gender),
    surname,
    gender,
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
    people,
    flags: {},
    jailYears: 0,
    usedThisYear: [],
    eventLast: {},
    log: [],
    pending: [],
    lastDelta: [],
    schemaVersion: SCHEMA_VERSION,
  } satisfies Omit<Life, 'rng'>);

  const clase = wealthClass === 1 ? 'una familia humilde' : wealthClass === 2 ? 'una familia de clase media' : 'una familia acomodada';
  const mom = people[0].name;
  const dad = people[1].name;
  addLog(life, `Naciste en ${birthYear}, en ${clase}. Tu madre es ${mom} y tu padre, ${dad}.`, 'system');
  if (sibs > 0) addLog(life, sibs === 1 ? 'Tenés un hermano/a.' : 'Tenés dos hermanos/as.', 'system');
  return life;
}

export const fullName = (l: Life) => `${l.name} ${l.surname}`;

export const cloneLife = (l: Life): Life => JSON.parse(JSON.stringify(l)) as Life;
