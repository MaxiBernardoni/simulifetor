import type { Cond, Life, Person } from './types';
import type { Rng } from './rng';
import { firstAlive } from './text';

export interface Ctx {
  target?: Person;
}

const cmp = (a: number, op: string, b: number) =>
  op === '>=' ? a >= b : op === '<=' ? a <= b : op === '>' ? a > b : a < b;

const inRange = (v: number, r: { gte?: number; lte?: number }) =>
  (r.gte === undefined || v >= r.gte) && (r.lte === undefined || v <= r.lte);

export function evalCond(life: Life, cond: Cond, rng: Rng, ctx: Ctx = {}): boolean {
  if ('stat' in cond) return cmp(life.stats[cond.stat], cond.op, cond.value);
  if ('age' in cond) return life.age >= cond.age[0] && life.age <= cond.age[1];
  if ('year' in cond) return life.year >= cond.year[0] && life.year <= cond.year[1];
  if ('flag' in cond) return !!life.flags[cond.flag];
  if ('noFlag' in cond) return !life.flags[cond.noFlag];
  if ('money' in cond) return inRange(life.money, cond.money);
  if ('job' in cond) return (life.job !== null) === cond.job;
  if ('sector' in cond) return life.job?.sector === cond.sector;
  if ('eduGte' in cond) return life.edu.level >= cond.eduGte;
  if ('enrolled' in cond) return (life.edu.enrolled !== null) === cond.enrolled;
  if ('has' in cond) return !!firstAlive(life, cond.has);
  if ('hasNot' in cond) return !firstAlive(life, cond.hasNot);
  if ('chance' in cond) return rng.chance(cond.chance);
  if ('jailed' in cond) return life.jailYears > 0 === cond.jailed;
  if ('targetCloseness' in cond) return !!ctx.target && inRange(ctx.target.closeness, cond.targetCloseness);
  if ('targetAge' in cond) return !!ctx.target && inRange(ctx.target.age, cond.targetAge);
  if ('performance' in cond) return !!life.job && inRange(life.job.performance, cond.performance);
  if ('wealth' in cond) return cond.wealth.includes(life.wealthClass);
  if ('trial' in cond) return (life.trial !== null) === cond.trial;
  if ('asset' in cond) return life.assets.some((a) => a.kind === cond.asset);
  if ('invested' in cond) return inRange(life.invested, cond.invested);
  if ('loan' in cond) return (life.loan > 0) === cond.loan;
  if ('married' in cond) {
    const partner = firstAlive(life, 'partner');
    return (!!partner?.married) === cond.married;
  }
  return false;
}

export function allConds(life: Life, conds: Cond[] | undefined, rng: Rng, ctx: Ctx = {}): boolean {
  if (!conds) return true;
  return conds.every((c) => evalCond(life, c, rng, ctx));
}
