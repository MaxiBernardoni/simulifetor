import { z } from 'zod';
import type { Effect, GameEvent, Outcome } from '../engine/types';
import { contentProblem, norm } from './filter';

const stat = z.number().int().min(-15).max(15);
const effectsSchema = z.strictObject({
  happiness: stat.optional(),
  health: stat.optional(),
  smarts: stat.optional(),
  looks: stat.optional(),
  money: z.number().int().min(-20000).max(20000).optional(),
  moneyPct: z.number().min(-0.25).max(0.25).optional(),
});

type Fx = z.infer<typeof effectsSchema>;

const outcomeSchema = z.strictObject({
  weight: z.number().int().min(1).max(10).default(1),
  text: z.string().min(8).max(300),
  effects: effectsSchema.default({}),
});

const choiceSchema = z.strictObject({
  label: z.string().min(2).max(60),
  outcomes: z.array(outcomeSchema).min(1).max(3),
});

export const CATEGORIES = ['work', 'love', 'money', 'family', 'health', 'random', 'rel', 'school'] as const;

const eventSchema = z.strictObject({
  title: z.string().min(3).max(60),
  text: z.string().min(20).max(420),
  category: z.enum(CATEGORIES).default('random'),
  minAge: z.number().int().min(0).max(110),
  maxAge: z.number().int().min(0).max(120),
  weight: z.number().int().min(1).max(8).default(3),
  effects: effectsSchema.optional(),
  choices: z.array(choiceSchema).min(2).max(3).optional(),
});

export type ValidationResult = { ok: true; event: GameEvent } | { ok: false; reason: string; title?: string };

/** Saca el primer objeto JSON de un texto (tolera ```json ... ``` y texto alrededor). */
export function extractJson(raw: string): unknown {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('sin JSON');
  return JSON.parse(raw.slice(start, end + 1));
}

const toEffects = (e: Fx): Effect[] => {
  const out: Effect[] = [];
  if (e.happiness) out.push({ stat: 'happiness', add: e.happiness });
  if (e.health) out.push({ stat: 'health', add: e.health });
  if (e.smarts) out.push({ stat: 'smarts', add: e.smarts });
  if (e.looks) out.push({ stat: 'looks', add: e.looks });
  if (e.money) out.push({ money: e.money });
  if (e.moneyPct) out.push({ moneyPct: e.moneyPct });
  return out;
};

const magnitude = (e: Fx) => Math.abs(e.happiness ?? 0) + Math.abs(e.health ?? 0) + Math.abs(e.smarts ?? 0) + Math.abs(e.looks ?? 0);

const slug = (s: string) =>
  norm(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

/** Convierte la respuesta de la IA en un GameEvent seguro, o explica por qué se rechaza. */
export function validateAiEvent(
  raw: unknown,
  existingIds: Set<string> = new Set(),
  existingTitles: Set<string> = new Set(),
): ValidationResult {
  let data: unknown = raw;
  if (typeof raw === 'string') {
    try {
      data = extractJson(raw);
    } catch {
      return { ok: false, reason: 'JSON inválido' };
    }
  }
  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, reason: `formato: ${issue?.path.join('.') || 'raíz'} — ${issue?.message ?? 'inválido'}` };
  }
  const ev = parsed.data;
  const title = ev.title.trim();
  if (ev.maxAge < ev.minAge) return { ok: false, reason: 'maxAge menor que minAge', title };
  if (!ev.effects === !ev.choices) return { ok: false, reason: 'debe tener "effects" o "choices" (uno solo)', title };

  const outcomes = ev.choices ? ev.choices.flatMap((c) => c.outcomes) : [];
  const allText = [ev.title, ev.text, ...(ev.choices?.flatMap((c) => [c.label, ...c.outcomes.map((o) => o.text)]) ?? [])];
  const problem = contentProblem(allText.join(' \n '), ev.minAge);
  if (problem) return { ok: false, reason: problem, title };

  if (ev.effects && magnitude(ev.effects) > 30) return { ok: false, reason: 'efectos demasiado grandes', title };
  for (const o of outcomes) if (magnitude(o.effects) > 30) return { ok: false, reason: 'efectos demasiado grandes', title };

  const id = `ai.${slug(title) || 'evento'}-${hash(ev.text)}`;
  if (existingIds.has(id) || existingTitles.has(norm(title))) return { ok: false, reason: 'duplicado', title };

  const mkOutcome = (o: { weight: number; text: string; effects: Fx }): Outcome => ({
    weight: o.weight,
    text: o.text.trim(),
    effects: toEffects(o.effects),
  });

  const event: GameEvent = {
    id,
    title,
    text: ev.text.trim(),
    tags: ['ai', ev.category],
    weight: ev.weight,
    cooldown: 8,
    once: true,
    conditions: [{ age: [ev.minAge, ev.maxAge] }],
    ...(ev.choices
      ? { choices: ev.choices.map((c) => ({ label: c.label.trim(), outcomes: c.outcomes.map(mkOutcome) })) }
      : { effects: toEffects(ev.effects!) }),
  };
  return { ok: true, event };
}
