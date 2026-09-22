import type { Activity, Career, Life, Person, PersonAction } from './types';
import { rngOf } from './rng';
import { allConds } from './conditions';
import { addLog, applyEffects, changeMoney, newEffectCtx, toneOf } from './effects';
import type { EffectCtx } from './effects';
import { allActivities, allCareers, allPersonActions, getCareer, getEvent } from './registry';
import { pickOutcome, fireEvent } from './events';
import { fill, firstAlive } from './text';
import { ACTION_CATEGORY } from '../content/personActions';
import { refineScene, sceneForActivity, sceneForPersonAction } from '../content/scenes';
import { makePerson } from './people';
import { formatMoney } from './format';
import { hasTech, scaleMoney, wageIndex } from '../content/eras';

/** Costo de una actividad/acción en el año de la vida (los montos están escritos en valores del 2000). */
export const costOf = (life: Life, a: { cost?: number }): number => (a.cost ? scaleMoney(a.cost, life.year) : 0);

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
  if (a.tech && !hasTech(a.tech, life.year)) return { visible: false };
  if (!allConds(life, a.conditions, rng)) return { visible: false };
  if (life.usedThisYear.includes(a.id)) return { visible: true, reason: 'Ya lo hiciste este año' };
  if (a.cost && life.money < costOf(life, a)) return { visible: true, reason: `Necesitás ${formatMoney(costOf(life, a))}` };
  return { visible: true };
}

function finish(life: Life, title: string, text: string, ctx: EffectCtx, icon?: string, scene?: string, targetId?: string): void {
  addLog(life, text, toneOf(ctx.deltas), title, icon);
  for (const l of ctx.logs) addLog(life, l, 'neutral');
  life.pending.unshift({
    kind: 'result',
    title,
    text,
    deltas: ctx.deltas,
    icon,
    scene: scene ? refineScene(scene, ctx.deltas) : undefined,
    targetId,
  });
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
  if (a.cost) changeMoney(life, ctx, -costOf(life, a));
  const outcome = pickOutcome(life, a.outcomes);
  const text = fill(life, outcome.text);
  applyEffects(life, outcome.effects, ctx, rng);
  finish(life, a.label, text, ctx, a.icon, sceneForActivity(a.id));
}

// ───────── Acciones sobre personas ─────────
/** Cuántas acciones de cada categoría se ofrecen a la vez con una persona. */
export const MAX_PER_CATEGORY = 6;

/** Hash estable (FNV-1a) → número entre 0 y 1. */
function unit(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

/**
 * Qué acciones se ofrecen con esta persona este año: de las que cumplen sus condiciones (niveles de amistad y amor,
 * edades…), hasta `MAX_PER_CATEGORY` por categoría. Las esenciales (`core`) entran primero y el resto se sortea con un
 * hash de vida + año + persona + acción: cambia cada año, pero es estable dentro del año y no gasta azar del juego.
 */
export function offeredActions(life: Life, p: Person): Set<string> {
  const rng = rngOf(life);
  const byCat = new Map<string, PersonAction[]>();
  for (const a of allPersonActions()) {
    if (!a.kinds.includes(p.kind) || !allConds(life, a.conditions, rng, { target: p })) continue;
    const cat = ACTION_CATEGORY[a.id] ?? a.id;
    const list = byCat.get(cat);
    if (list) list.push(a);
    else byCat.set(cat, [a]);
  }
  const out = new Set<string>();
  const seed = `${life.name}${life.surname}${life.birthYear}|${life.year}|${p.kind}|${p.name}|`;
  for (const list of byCat.values()) {
    // Con 6 o menos entran todas; si sobran, primero las esenciales y el resto por sorteo del año.
    const chosen =
      list.length <= MAX_PER_CATEGORY
        ? list
        : list
            .map((a) => ({ a, rank: a.core ? -1 : unit(seed + a.id) }))
            .sort((x, y) => x.rank - y.rank)
            .slice(0, MAX_PER_CATEGORY)
            .map((x) => x.a);
    for (const a of chosen) out.add(a.id);
  }
  return out;
}

export function personActionStatus(life: Life, a: PersonAction, p: Person, offered: Set<string> = offeredActions(life, p)): Status {
  const rng = rngOf(life);
  if (!p.alive || !a.kinds.includes(p.kind)) return { visible: false };
  if (!allConds(life, a.conditions, rng, { target: p })) return { visible: false };
  if (!offered.has(a.id)) return { visible: false };
  if (life.usedThisYear.includes(`${a.id}:${p.id}`)) return { visible: true, reason: 'Ya lo hiciste este año' };
  if (a.cost && life.money < costOf(life, a)) return { visible: true, reason: `Necesitás ${formatMoney(costOf(life, a))}` };
  return { visible: true };
}

export function runPersonAction(life: Life, actionId: string, personId: string, offered?: Set<string>): void {
  const a = allPersonActions().find((x) => x.id === actionId);
  const p = life.people.find((x) => x.id === personId);
  if (!a || !p || life.pending.length) return;
  const st = personActionStatus(life, a, p, offered);
  if (!st.visible || st.reason) return;
  const rng = rngOf(life);
  life.usedThisYear.push(`${a.id}:${p.id}`);
  const ctx = newEffectCtx(p);
  if (a.cost) changeMoney(life, ctx, -costOf(life, a));
  const outcome = pickOutcome(life, a.outcomes);
  const text = fill(life, outcome.text, p);
  applyEffects(life, outcome.effects, ctx, rng);
  // Un gesto romántico con otra persona deja rastro con la pareja oficial.
  const partner = firstAlive(life, 'partner');
  if (a.risk && partner && partner !== p) partner.suspicion = Math.min(100, (partner.suspicion ?? 0) + a.risk);
  finish(life, a.label, text, ctx, a.icon, sceneForPersonAction(a.id), p.id);
}

// ───────── Trabajo ─────────
export function isEligibleForCareer(life: Life, c: Career): boolean {
  if (life.jailYears > 0) return false;
  if (life.age < c.minAge || life.age >= 65) return false;
  if (c.since !== undefined && life.year < c.since) return false;
  if (c.until !== undefined && life.year > c.until) return false;
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
    salary: Math.round(c.levels[0].salary * wageIndex(life.year)),
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
