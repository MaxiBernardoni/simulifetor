import type { Choice, FollowUp, GameEvent, Life, Outcome, Person } from './types';
import { FOLLOWUP_ID } from './types';
import { rngOf } from './rng';
import { allConds } from './conditions';
import { addLog, applyEffects, newEffectCtx, toneOf } from './effects';
import type { EffectCtx } from './effects';
import { allEvents, getEvent } from './registry';
import { fill } from './text';
import { styleForTags } from '../content/icons';
import { refineScene, sceneForEvent } from '../content/scenes';

const DEFAULT_COOLDOWN = 4;

export function isEligible(life: Life, ev: GameEvent): boolean {
  const rng = rngOf(life);
  if (ev.once && life.eventLast[ev.id] !== undefined) return false;
  const last = life.eventLast[ev.id];
  if (last !== undefined && life.year - last < (ev.cooldown ?? DEFAULT_COOLDOWN)) return false;
  const jailEvent = !!ev.tags?.includes('jail');
  if (!ev.tags?.includes('historical') && jailEvent !== life.jailYears > 0) return false;
  if (ev.target) return eligibleTargets(life, ev).length > 0;
  return allConds(life, ev.conditions, rng);
}

/** Personas del tipo pedido que cumplen las condiciones del evento (evaluadas con esa persona de objetivo). */
function eligibleTargets(life: Life, ev: GameEvent): Person[] {
  const rng = rngOf(life);
  return life.people.filter((p) => p.alive && p.kind === ev.target && allConds(life, ev.conditions, rng, { target: p }));
}

function pickTarget(life: Life, ev: GameEvent): Person | undefined {
  if (!ev.target) return undefined;
  const list = eligibleTargets(life, ev);
  return list.length ? rngOf(life).pick(list) : undefined;
}

export function choiceAvailable(life: Life, choice: Choice, target?: Person): boolean {
  return allConds(life, choice.conditions, rngOf(life), { target });
}

function flushCtx(life: Life, ctx: EffectCtx): void {
  for (const text of ctx.logs) addLog(life, text, 'neutral');
  ctx.logs = [];
}

/** Dispara un evento: si tiene decisiones queda pendiente, si no se aplica directo. */
export function fireEvent(life: Life, ev: GameEvent, target?: Person): void {
  const rng = rngOf(life);
  life.eventLast[ev.id] = life.year;
  if (ev.choices?.length) {
    life.pending.push({
      kind: 'choice',
      eventId: ev.id,
      title: fill(life, ev.title, target),
      text: fill(life, ev.text, target),
      targetId: target?.id,
      icon: styleForTags(ev.tags).icon,
      scene: sceneForEvent(ev.id, ev.tags),
    });
    return;
  }
  const ctx = newEffectCtx(target);
  const text = fill(life, ev.text, target);
  applyEffects(life, ev.effects, ctx, rng);
  addLog(life, text, toneOf(ctx.deltas), fill(life, ev.title, target), styleForTags(ev.tags).icon);
  flushCtx(life, ctx);
  runTriggers(life, ctx);
}

function runTriggers(life: Life, ctx: EffectCtx): void {
  const queue = [...ctx.triggers];
  ctx.triggers = [];
  for (const id of queue) {
    if (!life.alive) return;
    const ev = getEvent(id);
    if (ev) fireEvent(life, ev);
  }
}

export function pickOutcome(life: Life, outcomes: Outcome[]): Outcome {
  const rng = rngOf(life);
  const allowed = outcomes.some((o) => o.conditions) ? outcomes.filter((o) => allConds(life, o.conditions, rng)) : outcomes;
  const pool = allowed.length ? allowed : outcomes;
  return rng.weighted(pool, (o) => o.weight ?? 1) ?? pool[0];
}

/** Resuelve la decisión pendiente (primer prompt de tipo choice). */
export function resolveChoice(life: Life, index: number): void {
  const prompt = life.pending[0];
  if (!prompt || prompt.kind !== 'choice') return;
  const ev = getEvent(prompt.eventId);
  const target = life.people.find((p) => p.id === prompt.targetId);
  life.pending.shift();
  if (!ev?.choices) return;
  const choice = ev.choices[index];
  if (!choice || !choiceAvailable(life, choice, target)) {
    life.pending.unshift(prompt);
    return;
  }
  finishOutcome(
    life,
    fill(life, ev.title, target),
    styleForTags(ev.tags).icon,
    sceneForEvent(ev.id, ev.tags),
    target,
    pickOutcome(life, choice.outcomes),
  );
}

/** Aplica un resultado ya elegido: efectos, historial y el cartel de resultado. */
function finishOutcome(life: Life, title: string, icon: string, baseScene: string, target: Person | undefined, outcome: Outcome): void {
  const rng = rngOf(life);
  const ctx = newEffectCtx(target);
  const text = fill(life, outcome.text, target);
  applyEffects(life, outcome.effects, ctx, rng);
  addLog(life, text, toneOf(ctx.deltas), title, icon);
  flushCtx(life, ctx);
  life.pending.unshift({
    kind: 'result',
    title,
    text,
    deltas: ctx.deltas,
    icon,
    scene: refineScene(baseScene, ctx.deltas),
    targetId: target?.id,
  });
  runTriggers(life, ctx);
}

/**
 * Resuelve la decisión pendiente con un resultado que no sale del evento (por ejemplo, el veredicto de la IA sobre una
 * respuesta escrita). El resultado tiene que venir ya validado y acotado.
 */
export function resolveWithOutcome(life: Life, outcome: Outcome, next?: FollowUp): void {
  const prompt = life.pending[0];
  if (!prompt || prompt.kind !== 'choice') return;
  const ev = getEvent(prompt.eventId);
  const target = life.people.find((p) => p.id === prompt.targetId);
  life.pending.shift();
  const icon = prompt.icon ?? styleForTags(ev?.tags).icon;
  const scene = prompt.scene ?? (ev ? sceneForEvent(ev.id, ev.tags) : 'random');
  finishOutcome(life, prompt.title, icon, scene, target, outcome);
  // La continuación va justo después del cartel de resultado: el jugador decide otra vez.
  if (next && life.alive) {
    life.pending.splice(1, 0, { kind: 'choice', eventId: FOLLOWUP_ID, ...next, targetId: target?.id, icon, scene });
  }
}

export function dismissPrompt(life: Life): void {
  if (life.pending[0]?.kind === 'result') life.pending.shift();
}

/** Elige y dispara los eventos de un año. */
export function runYearEvents(life: Life): void {
  const rng = rngOf(life);
  // Eventos históricos: siempre se disparan cuando aplican.
  for (const ev of allEvents()) {
    if (!life.alive) return;
    if (ev.tags?.includes('historical') && isEligible(life, ev)) fireEvent(life, ev, pickTarget(life, ev));
  }

  const n =
    life.age < 4
      ? 1
      : life.age >= 70
        ? (rng.weighted([1, 2], (x) => (x === 1 ? 60 : 40)) ?? 1)
        : (rng.weighted([1, 2, 3], (x) => (x === 1 ? 35 : x === 2 ? 45 : 20)) ?? 1);

  let pool = allEvents().filter((e) => !e.tags?.includes('historical') && !e.tags?.includes('court') && isEligible(life, e));
  let choicesQueued = life.pending.filter((p) => p.kind === 'choice').length;

  for (let i = 0; i < n && life.alive; i++) {
    const ev = rng.weighted(pool, (e) => e.weight ?? 10);
    if (!ev) break;
    pool = pool.filter((e) => e.id !== ev.id);
    if (ev.choices?.length) {
      if (choicesQueued >= 2) continue;
      choicesQueued++;
    }
    fireEvent(life, ev, pickTarget(life, ev));
  }
}
