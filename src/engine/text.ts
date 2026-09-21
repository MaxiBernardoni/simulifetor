import type { Life, Person, PersonKind } from './types';

export function firstAlive(life: Life, kind: PersonKind): Person | undefined {
  return life.people.find((p) => p.kind === kind && p.alive);
}

const first = (name: string) => name.split(' ')[0];

const FALLBACK: Record<string, string> = {
  mother: 'tu madre',
  father: 'tu padre',
  friend: 'un amigo',
  partner: 'tu pareja',
  ex: 'tu ex',
  child: 'tu hijo',
  sibling: 'tu hermano',
  boss: 'tu jefe',
  target: 'esa persona',
};

// Reemplaza {name}, {mother}, {partner}, {boss}, {target}... en los textos de contenido.
export function fill(life: Life, text: string, target?: Person): string {
  return text.replace(/\{(\w+)\}/g, (_m, key: string) => {
    if (key === 'name') return life.name;
    if (key === 'job') return life.job?.title ?? 'tu trabajo';
    if (key === 'crime') return life.trial?.crime ?? 'un delito';
    if (key === 'boss') return life.job?.boss ?? FALLBACK.boss;
    if (key === 'target') return target ? first(target.name) : FALLBACK.target;
    const p = firstAlive(life, key as PersonKind);
    if (p) return first(p.name);
    return FALLBACK[key] ?? key;
  });
}
