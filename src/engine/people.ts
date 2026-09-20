import type { Gender, Life, Person, PersonKind } from './types';
import type { Rng } from './rng';
import { FEMALE_NAMES, MALE_NAMES, SURNAMES } from '../content/names';

let counter = 0;
const uid = (rng: Rng) => `p${Date.now().toString(36)}${(counter++).toString(36)}${rng.int(0, 999)}`;

export function randomFirstName(rng: Rng, gender: Gender): string {
  return rng.pick(gender === 'M' ? MALE_NAMES : FEMALE_NAMES);
}

export function makePerson(
  rng: Rng,
  kind: PersonKind,
  opts: { gender?: Gender; age: number; surname?: string; closeness?: number },
): Person {
  const gender: Gender = opts.gender ?? (rng.chance(0.5) ? 'M' : 'F');
  const surname = opts.surname ?? rng.pick(SURNAMES);
  return {
    id: uid(rng),
    kind,
    name: `${randomFirstName(rng, gender)} ${surname}`,
    gender,
    age: opts.age,
    alive: true,
    closeness: opts.closeness ?? rng.int(40, 70),
  };
}

// Crea una persona nueva para la vida según su tipo y edad relativa.
export function spawnPerson(
  life: Life,
  rng: Rng,
  kind: PersonKind,
  age?: 'baby' | 'peer' | 'young',
): Person {
  let a: number;
  if (age === 'baby') a = 0;
  else if (age === 'young') a = Math.max(0, life.age - rng.int(2, 8));
  else if (kind === 'partner' || kind === 'ex') a = Math.max(18, life.age + rng.int(-5, 5));
  else a = Math.max(1, life.age + rng.int(-3, 3));
  const gender: Gender | undefined = kind === 'mother' ? 'F' : kind === 'father' ? 'M' : undefined;
  const closeness = kind === 'child' ? rng.int(60, 90) : kind === 'partner' ? rng.int(45, 70) : undefined;
  const surname = kind === 'child' || kind === 'sibling' ? life.surname : undefined;
  return makePerson(rng, kind, { gender, age: a, surname, closeness });
}
