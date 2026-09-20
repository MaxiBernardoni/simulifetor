import type { Activity, Career, Life, Person, PersonAction } from './types';
import { rngOf } from './rng';
import { allConds } from './conditions';
import { addLog, applyEffects, changeMoney, newEffectCtx, toneOf } from './effects';
import type { EffectCtx } from './effects';
import { allActivities, allCareers, allPersonActions, getCareer, getEvent } from './registry';
import { pickOutcome, fireEvent } from './events';
import { fill } from './text';
import { makePerson } from './people';
import { formatMoney } from './format';

export interface Status {
  visible: boolean;
  reason?: string;
}


// ───────── Actividades ─────────
export function activityStatus(life: Life, a: Activity): Status {
  const rng = rngOf(life);
  if (!life.alive) return { visible: false };
  if (!a.inJail && life.jailYears > 0) return { visible: false };
  if (a.inJail && life.jailYears <= 0) return { visible: false };
  if (!allConds(life, a.conditions, rng)) return { visible: false };
  if (life.usedThisYear.includes(a.id)) return { visible: true, reason: 'Ya lo hiciste este año' };
  if (a.cost && life.money < a.cost) return { visible: true, reason: `Necesitás ${formatMoney(a.cost)}` };
  return { visible: true };
}

function finish(life: Life, title: string, text: string, ctx: EffectCtx): void {
  addLog(life, text, toneOf(ctx.deltas), title);
  for (const l of ctx.logs) addLog(life, l, 'neutral');
  life.pending.unshift({ kind: 'result', title, text, deltas: ctx.deltas });
  for (const id of ctx.triggers) {
    const ev = getEvent(id);
    if (ev && life.alive) fireEvent(life, ev);
  }
}

export function runActivity(life: Life, id: string): void {
  const a = allActivities().find((x) => x.id === id);
  if (!a || life.pending.length) return;
  const st = activityStatus(life, a);
  if (!st.visible || st.reason) return;
  const rng = rngOf(life);
  life.usedThisYear.push(a.id);
  const ctx = newEffectCtx();
  if (a.cost) changeMoney(life, ctx, -a.cost);
  const outcome = pickOutcome(life, a.outcomes);
  const text = fill(life, outcome.text);
  applyEffects(life, outcome.effects, ctx, rng);
  finish(life, a.label, text, ctx);
}

// ───────── Acciones sobre personas ─────────
export function personActionStatus(life: Life, a: PersonAction, p: Person): Status {
  const rng = rngOf(life);
  if (!p.alive || !a.kinds.includes(p.kind)) return { visible: false };
  if (!allConds(life, a.conditions, rng, { target: p })) return { visible: false };
  if (life.usedThisYear.includes(`${a.id}:${p.id}`)) return { visible: true, reason: 'Ya lo hiciste este año' };
  if (a.cost && life.money < a.cost) return { visible: true, reason: `Necesitás ${formatMoney(a.cost)}` };
  return { visible: true };
}

export function runPersonAction(life: Life, actionId: string, personId: string): void {
  const a = allPersonActions().find((x) => x.id === actionId);
  const p = life.people.find((x) => x.id === personId);
  if (!a || !p || life.pending.length) return;
  const st = personActionStatus(life, a, p);
  if (!st.visible || st.reason) return;
  const rng = rngOf(life);
  life.usedThisYear.push(`${a.id}:${p.id}`);
  const ctx = newEffectCtx(p);
  if (a.cost) changeMoney(life, ctx, -a.cost);
  const outcome = pickOutcome(life, a.outcomes);
  const text = fill(life, outcome.text, p);
  applyEffects(life, outcome.effects, ctx, rng);
  finish(life, a.label, text, ctx);
}

// ───────── Trabajo ─────────
export function isEligibleForCareer(life: Life, c: Career): boolean {
  if (life.jailYears > 0) return false;
  if (life.age < c.minAge || life.age >= 65) return false;
  if (life.edu.level < c.minEdu) return false;
  if (c.minSmarts && life.stats.smarts < c.minSmarts) return false;
  if (c.noRecord && life.flags.criminal_record) return false;
  return true;
}

/** Busca ofertas (una vez por año). Devuelve los ids de carreras ofrecidas. */
export function searchJobs(life: Life): void {
  if (life.usedThisYear.includes('search_job') || life.pending.length || life.age < 14) return;
  const rng = rngOf(life);
  life.usedThisYear.push('search_job');
  let pool = allCareers().filter((c) => isEligibleForCareer(life, c) && c.id !== life.job?.careerId);
  const offers: string[] = [];
  const n = rng.int(1, 3);
  while (offers.length < n && pool.length) {
    const c = rng.pick(pool);
    offers.push(c.id);
    pool = pool.filter((x) => x.id !== c.id);
  }
  life.offers = offers;
  if (offers.length === 0) addLog(life, 'Buscaste trabajo pero no encontraste nada para vos.', 'neutral');
}

export function takeJob(life: Life, careerId: string): void {
  const c = getCareer(careerId);
  if (!c || !life.offers.includes(careerId) || !isEligibleForCareer(life, c)) return;
  const rng = rngOf(life);
  const boss = makePerson(rng, 'friend', { age: 40 }).name;
  life.job = {
    careerId,
    title: c.levels[0].title,
    sector: c.sector,
    level: 0,
    salary: c.levels[0].salary,
    performance: 55,
    yearsAtLevel: 0,
    yearsTotal: 0,
    boss,
  };
  life.offers = [];
  addLog(life, `Empezaste a trabajar como ${c.levels[0].title}. Tu jefe/a es ${boss.split(' ')[0]}.`, 'good');
}

export function quitJob(life: Life): void {
  if (!life.job || life.pending.length) return;
  addLog(life, `Renunciaste a tu trabajo como ${life.job.title}.`, 'neutral');
  life.job = null;
}

// ───────── Estudios ─────────
export function canEnrollUniversity(life: Life): boolean {
  return life.alive && life.age >= 18 && life.age < 60 && life.edu.level === 2 && life.edu.enrolled === null && life.jailYears === 0;
}

export function enrollUniversity(life: Life): void {
  if (!canEnrollUniversity(life) || life.pending.length) return;
  life.edu.enrolled = 'university';
  life.edu.years = 0;
  addLog(
    life,
    life.wealthClass === 3
      ? 'Te anotaste en la universidad. Tu familia paga la cuota.'
      : 'Te anotaste en la universidad. Pagás $4.000 por año.',
    'system',
  );
}

export function dropUniversity(life: Life): void {
  if (life.edu.enrolled !== 'university') return;
  life.edu.enrolled = null;
  addLog(life, 'Abandonaste la universidad.', 'bad');
}
