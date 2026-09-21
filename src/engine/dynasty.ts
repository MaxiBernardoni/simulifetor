import type { Life, Person } from './types';
import { getCareer } from './registry';
import { netWorth } from './assets';

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
