import type { Life, Person } from './types';
import { createLife } from './life';
import { autoPlay, tidyAfterSimulation } from './autoplay';
import { rngFromState } from './rng';
import { addLog } from './effects';
import { inheritLook } from './people';
import { getCareer } from './registry';
import { netWorth } from './assets';
import { formatMoney } from './format';

const kidsOf = (l: Life) => l.people.filter((p) => p.kind === 'child').length;

/** Puntaje de legado de una vida: qué tanto dejó. */
export function legacyPoints(l: Life): number {
  const nw = Math.max(0, netWorth(l));
  const j = l.job;
  const c = j ? getCareer(j.careerId) : undefined;
  let pts = l.age + Math.floor(nw / 8000) + kidsOf(l) * 6 + l.edu.level * 4;
  if (j && c && j.level >= c.levels.length - 1) pts += 15;
  if (l.flags.criminal_record) pts -= 8;
  if (l.flags.murderer) pts -= 25;
  if (l.scenario?.status === 'won') pts += 30;
  return Math.max(0, Math.round(pts));
}

/** Herederos posibles: los hijos vivos; si no hay, los hermanos vivos. */
export function heirsOf(l: Life): Person[] {
  const children = l.people.filter((p) => p.alive && p.kind === 'child');
  if (children.length) return children;
  return l.people.filter((p) => p.alive && p.kind === 'sibling');
}

/** Patrimonio que se reparte al morir (tras impuestos de sucesión). */
export function estateOf(l: Life): number {
  return Math.max(0, Math.round(netWorth(l) * 0.8));
}

/**
 * Crea la vida del heredero. Continúa desde la edad que tiene el heredero al morir el personaje anterior:
 * su pasado se simula automáticamente, con la familia real como parte de ella.
 */
export function createHeir(prev: Life, personId: string): Life | null {
  const heir = prev.people.find((p) => p.id === personId && p.alive);
  if (!heir) return null;

  const targetAge = heir.age;
  const birthYear = prev.year - targetAge;
  const firstName = heir.name.split(' ')[0];
  const others = heirsOf(prev).filter((p) => p.id !== heir.id);

  for (let attempt = 0; attempt < 10; attempt++) {
    const seed = (Date.now() + attempt * 7919) % 2147483647;
    let rs = seed;
    const rng = rngFromState(() => rs, (s) => { rs = s; });
    const look = heir.look ?? inheritLook(prev.look, heir.gender, rng);

    // Familia real: el personaje anterior y su pareja como padres (o el hermano fallecido).
    const family: Person[] = [];
    const clone = (p: Person, patch: Partial<Person>): Person => ({ ...p, ...patch, id: `${p.id}-h${attempt}`, frozen: true });
    if (heir.kind === 'child') {
      family.push(clone({ ...prevAsPerson(prev), kind: prev.gender === 'F' ? 'mother' : 'father' }, { age: Math.max(20, prev.age - targetAge) }));
      const partner = prev.people.find((p) => p.alive && p.kind === 'partner');
      if (partner) family.push(clone({ ...partner, kind: partner.gender === 'F' ? 'mother' : 'father', married: false }, { age: Math.max(20, partner.age - targetAge) }));
      for (const o of others) family.push(clone({ ...o, kind: 'sibling' }, {}));
    } else {
      // Heredero hermano: los padres son los del personaje anterior.
      for (const p of prev.people.filter((x) => x.kind === 'mother' || x.kind === 'father')) family.push(clone(p, {}));
      family.push(clone({ ...prevAsPerson(prev), kind: 'sibling' }, {}));
      for (const o of others) family.push(clone({ ...o, kind: 'sibling' }, {}));
    }

    const life = createLife(seed, {
      name: firstName, surname: prev.surname, gender: heir.gender, look, birthYear,
      wealthClass: prev.wealthClass, people: family, lineageId: prev.lineageId, generation: prev.generation + 1,
      parentLifeId: prev.id, silent: true,
    });
    autoPlay(life, { seed, untilAge: targetAge, crimeChance: 0.03, activityChance: 0.5, familyBias: true });
    if (!life.alive || life.age !== targetAge) continue;

    // Estado final de la familia.
    for (const p of life.people) {
      if (!p.frozen) continue;
      p.frozen = false;
      const src = p.id.replace(/-h\d+$/, '');
      if (src === prev.id + '-self') {
        p.alive = false;
        p.age = prev.age;
      } else {
        const orig = prev.people.find((x) => x.id === src);
        if (orig) {
          p.age = orig.age;
          p.alive = orig.alive;
          p.closeness = orig.closeness;
        }
      }
    }

    tidyAfterSimulation(life);

    // Herencia y prestigio familiar.
    const share = Math.round(estateOf(prev) * (others.length ? 0.6 : 0.85));
    life.money += share;
    life.flags.heir = true;
    if (netWorth(prev) >= 500000) life.flags.famous_family = true;
    if (prev.flags.criminal_record || prev.flags.murderer) life.flags.infamous_family = true;
    life.log = [];
    life.pending = [];
    life.eventLast = {};
    addLog(life, `Continuás la historia de la familia ${prev.surname}. ${prev.name} murió a los ${prev.age} años.`, 'system', `Generación ${life.generation}`, 'Crown');
    if (share > 0) addLog(life, `Heredaste ${formatMoney(share)}${others.length ? ' (el resto se repartió entre tus hermanos)' : ''}.`, 'good', 'Herencia', 'Coins');
    return life;
  }
  return null;
}

function prevAsPerson(prev: Life): Person {
  return {
    id: prev.id + '-self',
    kind: prev.gender === 'F' ? 'mother' : 'father',
    name: `${prev.name} ${prev.surname}`,
    gender: prev.gender,
    age: prev.age,
    alive: true,
    closeness: 70,
    look: prev.look,
  };
}
