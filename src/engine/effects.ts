import type { Delta, Effect, Life, LogEntry, Person, StatKey, Tone } from './types';
import type { Rng } from './rng';
import { firstAlive } from './text';
import { scaleMoney } from '../content/eras';
import { spawnPerson } from './people';

export interface EffectCtx {
  target?: Person;
  deltas: Delta[];
  logs: string[];
  triggers: string[];
}

export const newEffectCtx = (target?: Person): EffectCtx => ({
  target,
  deltas: [],
  logs: [],
  triggers: [],
});

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function addLog(life: Life, text: string, tone: Tone = 'neutral', title?: string, icon?: string): void {
  const entry: LogEntry = { age: life.age, year: life.year, text, tone };
  if (title) entry.title = title;
  if (icon) entry.icon = icon;
  life.log.push(entry);
}

export function killLife(life: Life, cause: string): void {
  if (!life.alive) return;
  life.alive = false;
  life.cause = cause;
  life.jailYears = 0;
  addLog(life, `Moriste a los ${life.age} años. Causa: ${cause}.`, 'bad', undefined, 'Ghost');
}

export function addDelta(ctx: EffectCtx, key: Delta['key'], amount: number): void {
  if (!amount) return;
  const ex = ctx.deltas.find((d) => d.key === key);
  if (ex) ex.amount += amount;
  else ctx.deltas.push({ key, amount });
}

export function changeStat(life: Life, ctx: EffectCtx, stat: StatKey, add: number): void {
  const before = life.stats[stat];
  life.stats[stat] = clamp(before + add);
  addDelta(ctx, stat, life.stats[stat] - before);
}

export function changeMoney(life: Life, ctx: EffectCtx, amount: number): void {
  life.money = Math.round(life.money + amount);
  addDelta(ctx, 'money', Math.round(amount));
}

function resolveWho(life: Life, ctx: EffectCtx, who: string): Person | undefined {
  if (who === 'target') return ctx.target;
  return firstAlive(life, who as Person['kind']);
}

function sendToJail(life: Life, ctx: EffectCtx, years: number): void {
  // Menores de edad: reformatorio, condenas acotadas.
  const y = life.age < 18 ? Math.min(years, 3) : years;
  life.jailYears += y;
  life.flags.criminal_record = true;
  life.job = null;
  if (life.edu.enrolled === 'university') life.edu.enrolled = null;
  ctx.logs.push(`Te condenaron a ${y} ${y === 1 ? 'año' : 'años'} de ${life.age < 18 ? 'reformatorio' : 'prisión'}.`);
}

export function applyEffect(life: Life, e: Effect, ctx: EffectCtx, rng: Rng): void {
  if ('stat' in e) return changeStat(life, ctx, e.stat, e.add);
  if ('money' in e) return changeMoney(life, ctx, scaleMoney(e.money, life.year));
  if ('moneyPct' in e) return changeMoney(life, ctx, Math.round(life.money * e.moneyPct));
  if ('setFlag' in e) {
    life.flags[e.setFlag] = true;
    return;
  }
  if ('clearFlag' in e) {
    delete life.flags[e.clearFlag];
    return;
  }
  if ('addPerson' in e) {
    const p = spawnPerson(life, rng, e.addPerson.kind, e.addPerson.age);
    life.people.push(p);
    if (e.addPerson.kind === 'partner') {
      // Una sola pareja a la vez.
      for (const o of life.people) if (o !== p && o.kind === 'partner' && o.alive) o.kind = 'ex';
    }
    return;
  }
  if ('relation' in e) {
    const p = resolveWho(life, ctx, e.relation.who);
    if (!p) return;
    if (e.relation.closeness) p.closeness = clamp(p.closeness + e.relation.closeness);
    if (e.relation.remove) {
      life.people = life.people.filter((x) => x !== p);
      return;
    }
    if (e.relation.becomes) {
      p.kind = e.relation.becomes;
      p.married = false;
    }
    if (e.relation.married !== undefined) p.married = e.relation.married;
    return;
  }
  if ('performance' in e) {
    if (life.job) life.job.performance = clamp(life.job.performance + e.performance);
    return;
  }
  if ('gpa' in e) {
    life.edu.gpa = clamp(life.edu.gpa + e.gpa);
    return;
  }
  if ('salaryMult' in e) {
    if (life.job) life.job.salary = Math.round(life.job.salary * e.salaryMult);
    return;
  }
  if ('loseJob' in e) {
    if (life.job) {
      ctx.logs.push(`Perdiste tu trabajo como ${life.job.title}.`);
      life.job = null;
    }
    return;
  }
  if ('jail' in e) {
    sendToJail(life, ctx, rng.int(e.jail[0], e.jail[1]));
    return;
  }
  if ('arrest' in e) {
    life.trial = { crime: e.arrest.crime, years: e.arrest.years };
    ctx.logs.push(`Te arrestaron por ${e.arrest.crime}.`);
    ctx.triggers.push('court.trial');
    return;
  }
  if ('sentence' in e) {
    const t = life.trial;
    life.trial = null;
    if (!t) return;
    const base = rng.int(t.years[0], t.years[1]);
    if (e.sentence === 'none') {
      ctx.logs.push('Te absolvieron de todos los cargos.');
    } else if (e.sentence === 'probation') {
      life.flags.criminal_record = true;
      ctx.logs.push('Te dieron libertad condicional: sin cárcel, pero con antecedentes.');
    } else {
      const years = e.sentence === 'half' ? Math.max(1, Math.ceil(base / 2)) : e.sentence === 'double' ? base * 2 : base;
      sendToJail(life, ctx, years);
    }
    return;
  }
  if ('loseAsset' in e) {
    const i = life.assets.findIndex((a) => a.kind === e.loseAsset);
    if (i >= 0) {
      ctx.logs.push(`Perdiste tu ${life.assets[i].name.toLowerCase()}.`);
      life.assets.splice(i, 1);
    }
    return;
  }
  if ('invest' in e) {
    const amt = Math.min(e.invest, Math.max(0, life.money));
    life.money -= amt;
    life.invested += amt;
    addDelta(ctx, 'money', -amt);
    return;
  }
  if ('parole' in e) {
    life.jailYears = Math.max(0, life.jailYears - e.parole);
    return;
  }
  if ('die' in e) return killLife(life, e.die);
  if ('log' in e) {
    ctx.logs.push(e.log);
    return;
  }
  if ('trigger' in e) {
    ctx.triggers.push(e.trigger);
  }
}

export function applyEffects(life: Life, effects: Effect[] | undefined, ctx: EffectCtx, rng: Rng): void {
  if (!effects) return;
  for (const e of effects) {
    if (!life.alive) return;
    applyEffect(life, e, ctx, rng);
  }
}

export function toneOf(deltas: Delta[]): Tone {
  const score = deltas
    .filter((d) => d.key !== 'money')
    .reduce((s, d) => s + d.amount, 0);
  return score > 0 ? 'good' : score < 0 ? 'bad' : 'neutral';
}
