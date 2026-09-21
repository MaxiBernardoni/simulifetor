import { priceIndex, scaleMoney, wageIndex } from '../content/eras';
import type { Delta, Life, StatKey } from './types';
import { rngOf } from './rng';
import type { Rng } from './rng';
import { addLog, killLife } from './effects';
import { runYearEvents } from './events';
import { getCareer } from './registry';
import { firstAlive } from './text';
import { formatMoney } from './format';
import { carCost, housingCost, updateAssets } from './assets';

const TAX = 0.8;
const RETIRE_AGE = 65;

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/** Probabilidad anual de muerte por edad (curva simplificada). */
export function baseMortality(age: number): number {
  if (age < 1) return 0.005;
  if (age < 15) return 0.0004;
  if (age < 40) return 0.0012;
  if (age < 55) return 0.004;
  if (age < 65) return 0.01;
  if (age < 75) return 0.025;
  if (age < 85) return 0.07;
  if (age < 95) return 0.18;
  return 0.35;
}

function causeOfDeath(life: Life, rng: Rng): string {
  if (life.age >= 75) return rng.pick(['vejez', 'vejez', 'un paro cardíaco', 'neumonía']);
  if (life.age < 18) return rng.pick(['un accidente', 'una enfermedad', 'un accidente']);
  return rng.pick(['un infarto', 'un accidente de tránsito', 'una enfermedad fulminante', 'una complicación médica', 'un aneurisma']);
}

function snapshot(life: Life) {
  return { stats: { ...life.stats }, money: life.money };
}

function computeDelta(life: Life, before: ReturnType<typeof snapshot>): Delta[] {
  const out: Delta[] = [];
  (Object.keys(life.stats) as StatKey[]).forEach((k) => {
    const d = life.stats[k] - before.stats[k];
    if (d) out.push({ key: k, amount: d });
  });
  const dm = life.money - before.money;
  if (dm) out.push({ key: 'money', amount: dm });
  return out;
}

/** Consecuencias de que muera un familiar o conocido. */
export function personDied(life: Life, p: Life['people'][number], rng: Rng): void {
  p.alive = false;
  const loss = Math.round(p.closeness / 7);
  life.stats.happiness = clamp(life.stats.happiness - loss);
  addLog(life, `${p.name.split(' ')[0]} (${labelOf(p.kind)}) murió a los ${p.age} años.`, 'bad', undefined, 'Ghost');
  if ((p.kind === 'mother' || p.kind === 'father') && life.age >= 22 && life.wealthClass >= 2) {
    const inh = rng.int(1500, 9000) * life.wealthClass;
    life.money += inh;
    addLog(life, `Heredás ${formatMoney(inh)}.`, 'good', undefined, 'Coins');
  }
}

function agePeople(life: Life, rng: Rng): void {
  for (const p of life.people) {
    if (!p.alive || p.frozen) continue;
    p.age++;
    // Los familiares del árbol: su muerte la decide el mundo, acá solo se enfría o no la relación.
    if (p.nodeId) {
      if (rng.chance(0.4)) p.closeness = clamp(p.closeness - rng.int(0, 3));
      continue;
    }
    if (rng.chance(baseMortality(p.age) * 0.9)) {
      personDied(life, p, rng);
    } else if (p.kind === 'friend' || p.kind === 'ex') {
      if (rng.chance(0.5)) p.closeness = clamp(p.closeness - rng.int(1, 4));
    } else if (rng.chance(0.4)) {
      p.closeness = clamp(p.closeness - rng.int(0, 3));
    }
  }
  // Consecuencias de descuidar relaciones.
  for (const p of [...life.people]) {
    if (!p.alive || p.frozen) continue;
    const first = p.name.split(' ')[0];
    if ((p.kind === 'friend' || p.kind === 'ex') && p.closeness <= 8) {
      life.people = life.people.filter((x) => x !== p);
      addLog(life, `Perdiste el contacto con ${first}. Ya ni se saludan.`, 'neutral', 'Distancia');
    } else if (p.kind === 'partner' && p.closeness <= 15 && rng.chance(0.5)) {
      const was = p.married;
      p.kind = 'ex';
      p.married = false;
      life.stats.happiness = clamp(life.stats.happiness - 10);
      if (was) {
        life.money -= Math.round(Math.max(0, life.money) * 0.3);
        life.flags.divorced = true;
      }
      addLog(life, was ? `${first} pidió el divorcio. Se acabó.` : `${first} te dejó. Ya no había nada que salvar.`, 'bad', 'Ruptura');
    }
  }
  // Los hijos que se fueron a vivir solos: se quedan en la lista.
}

export function labelOf(kind: string): string {
  const m: Record<string, string> = {
    mother: 'madre',
    father: 'padre',
    sibling: 'hermano/a',
    friend: 'amigo/a',
    partner: 'pareja',
    child: 'hijo/a',
    ex: 'ex',
  };
  return m[kind] ?? kind;
}

function driftStats(life: Life, rng: Rng): void {
  const s = life.stats;
  s.happiness = clamp(s.happiness + Math.round((55 - s.happiness) * 0.06));
  const a = life.age;
  // El cuerpo tiende a un nivel de salud que baja con la edad; hay recuperación natural.
  const target = a < 40 ? 85 : a < 60 ? 72 : a < 75 ? 58 : 45;
  const pull = a < 60 ? 0.15 : 0.08;
  s.health += Math.round((target - s.health) * pull);
  if (a >= 60) s.health -= rng.int(0, 2);
  if (a > 35 && rng.chance(0.4)) s.looks -= 1;
  s.health = clamp(s.health);
  s.looks = clamp(s.looks);
  if (life.flags.chronic) s.health = clamp(s.health - 1);
  if (life.flags.substance) s.health = clamp(s.health - 2);
}

function updateEducation(life: Life, rng: Rng): void {
  const e = life.edu;
  const a = life.age;
  if (a === 5) {
    e.enrolled = 'primary';
    e.years = 0;
    addLog(life, 'Empezaste la primaria.', 'system');
  }
  if (a === 12 && e.enrolled === 'primary') {
    e.level = 1;
    e.enrolled = 'secondary';
    e.years = 0;
    addLog(life, 'Terminaste la primaria. Ahora, la secundaria.', 'system');
  }
  if (e.enrolled === 'secondary' && life.flags.dropout) {
    e.enrolled = null;
    addLog(life, 'Dejaste la escuela.', 'bad');
  }
  if (a === 18 && e.enrolled === 'secondary') {
    e.level = 2;
    e.enrolled = null;
    addLog(life, 'Te recibiste de la secundaria.', 'good');
  }
  if (e.enrolled) {
    e.years++;
    const target = life.stats.smarts * 0.8 + rng.int(0, 25);
    e.gpa = clamp(Math.round(e.gpa * 0.5 + target * 0.5));
  }
  if (e.enrolled === 'university') {
    if (life.wealthClass < 3) life.money -= scaleMoney(4000, life.year);
    if (e.gpa < 30 && rng.chance(0.3)) {
      e.enrolled = null;
      addLog(life, 'Te echaron de la universidad por bajo rendimiento.', 'bad');
    } else if (e.years >= 4) {
      e.level = 3;
      e.enrolled = null;
      life.flags.graduated = true;
      addLog(life, 'Te graduaste de la universidad.', 'good');
    }
  }
}

function updateWork(life: Life, rng: Rng): void {
  const j = life.job;
  if (j && life.jailYears === 0) {
    life.money += Math.round(j.salary * TAX);
    j.yearsAtLevel++;
    j.yearsTotal++;
    j.performance = clamp(j.performance + rng.int(-8, 8) + Math.round((life.stats.smarts - 50) / 25));
    const career = getCareer(j.careerId);
    if (career && j.performance >= 75 && j.yearsAtLevel >= 2 && j.level < career.levels.length - 1 && rng.chance(0.6)) {
      j.level++;
      j.title = career.levels[j.level].title;
      j.salary = Math.round(career.levels[j.level].salary * wageIndex(life.year) * (1 + j.yearsTotal * 0.01));
      j.yearsAtLevel = 0;
      addLog(life, `¡Te ascendieron a ${j.title}!`, 'good');
    } else {
      j.salary = Math.round(j.salary * 1.03 * (wageIndex(life.year) / wageIndex(life.year - 1)));
    }
    if (j.performance < 15 && rng.chance(0.5)) {
      addLog(life, `Te echaron de tu trabajo como ${j.title} por bajo rendimiento.`, 'bad');
      life.job = null;
    } else if (life.age >= RETIRE_AGE) {
      life.pension = Math.round(j.salary * TAX * 0.45);
      addLog(life, `Te jubilaste como ${j.title}. Cobrás ${formatMoney(life.pension)} al año.`, 'system');
      life.job = null;
      life.flags.retired = true;
    }
  } else if (!j && life.age >= RETIRE_AGE && !life.flags.retired && life.jailYears === 0) {
    life.flags.retired = true;
    life.pension = life.pension || scaleMoney(4000, life.year);
    addLog(life, 'Te jubilaste. Cobrás una jubilación mínima.', 'system');
  }
  if (life.pension > 0 && life.jailYears === 0) life.money += life.pension;
  // Los ahorros en cuenta siguen (casi) a la inflación: el dinero quieto no se evapora por la época.
  if (life.money > 0) life.money += Math.round(life.money * (priceIndex(life.year) / priceIndex(life.year - 1) - 1) * 0.9);

  updateAssets(life, rng);

  // Gastos de vida.
  if (life.age >= 18 && life.jailYears === 0) {
    const familyHelps = life.age < 22 && life.wealthClass >= 2 && !life.job;
    if (!familyHelps) {
      const px = priceIndex(life.year);
      const kids = life.people.filter((p) => p.kind === 'child' && p.alive && p.age < 18).length;
      // Gasto de estilo de vida: quien gana más, gasta más.
      const lifestyle = life.job ? Math.round(Math.max(0, life.job.salary * TAX - 12000 * px) * 0.6) : 0;
      life.money -= housingCost(life) + carCost(life) + Math.round(kids * 2500 * px) + lifestyle;
    }
  }
  if (life.money < 0) life.money = Math.round(life.money * 1.08);
  if (life.money < -20000 * priceIndex(life.year)) {
    life.stats.happiness = clamp(life.stats.happiness - 4);
  }
  if (life.money < -40000 * priceIndex(life.year)) {
    // Quiebra: se pierde todo y se arranca con una deuda chica.
    life.money = -Math.round(5000 * priceIndex(life.year));
    life.assets = [];
    life.loan = 0;
    life.invested = 0;
    life.flags.bankrupt = true;
    life.stats.happiness = clamp(life.stats.happiness - 12);
    addLog(life, 'Te declararon en quiebra. Te embargaron todo lo que tenías.', 'bad', 'Quiebra');
  }
}

function updateJail(life: Life): void {
  if (life.jailYears <= 0) return;
  life.jailYears--;
  life.stats.health = clamp(life.stats.health - 1);
  life.stats.happiness = clamp(life.stats.happiness - 3);
  if (life.jailYears === 0) {
    life.flags.ex_convict = true;
    addLog(life, 'Saliste de prisión. Con antecedentes.', 'system');
  }
}

function checkMortality(life: Life, rng: Rng): void {
  if (life.stats.health <= 0) {
    killLife(life, 'complicaciones de salud');
    return;
  }
  const factor = Math.max(0.4, Math.min(2.5, 1 + (50 - life.stats.health) / 60));
  if (rng.chance(baseMortality(life.age) * factor)) killLife(life, causeOfDeath(life, rng));
}

/** Avanza un año de vida. Muta `life`. No hace nada si hay decisiones pendientes o murió. */
export function ageUp(life: Life): void {
  if (!life.alive || life.pending.length > 0) return;
  const before = snapshot(life);
  const rng = rngOf(life);

  life.age++;
  life.year++;
  life.usedThisYear = [];
  life.offers = [];

  agePeople(life, rng);
  driftStats(life, rng);
  updateEducation(life, rng);
  updateWork(life, rng);
  updateJail(life);
  checkMortality(life, rng);

  if (life.alive) runYearEvents(life);
  if (life.alive && life.stats.health <= 0) killLife(life, 'complicaciones de salud');

  life.lastDelta = computeDelta(life, before);
}

export const hasPartner = (life: Life) => !!firstAlive(life, 'partner');
