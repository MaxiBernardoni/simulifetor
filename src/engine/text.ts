import { scaleText } from '../content/eras';
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

/** Cómo se llama esa persona respecto del jugador ("tu madre", "tu amiga", "tu esposo"…). */
export function relationLabel(p: Person): string {
  const f = p.gender === 'F';
  switch (p.kind) {
    case 'mother':
      return 'tu madre';
    case 'father':
      return 'tu padre';
    case 'sibling':
      return f ? 'tu hermana' : 'tu hermano';
    case 'friend':
      return f ? 'tu amiga' : 'tu amigo';
    case 'partner':
      return p.married ? (f ? 'tu esposa' : 'tu esposo') : f ? 'tu novia' : 'tu novio';
    case 'child':
      return f ? 'tu hija' : 'tu hijo';
    default:
      return 'tu ex';
  }
}

// Reemplaza {name}, {mother}, {partner}, {boss}, {target}... en los textos de contenido.
// La primera vez que se nombra a alguien se aclara qué es del jugador: "Marcos (tu amigo)".
export function fill(life: Life, text: string, target?: Person): string {
  const scaled = scaleText(text, life.year);
  const named = new Set<string>();
  const withRelation = (name: string, label: string) => {
    // Si el texto ya aclara la relación ("tu madre {mother}") o ya se nombró antes, va solo el nombre.
    if (named.has(name) || scaled.toLowerCase().includes(label)) return name;
    named.add(name);
    return `${name} (${label})`;
  };
  return scaled.replace(/\{(\w+)\}/g, (_m, key: string) => {
    if (key === 'name') return life.name;
    if (key === 'job') return life.job?.title ?? 'tu trabajo';
    if (key === 'crime') return life.trial?.crime ?? 'un delito';
    if (key === 'boss') return life.job?.boss ? withRelation(life.job.boss, 'tu jefe') : FALLBACK.boss;
    if (key === 'target') return target ? withRelation(first(target.name), relationLabel(target)) : FALLBACK.target;
    const p = firstAlive(life, key as PersonKind);
    if (p) return withRelation(first(p.name), relationLabel(p));
    return FALLBACK[key] ?? key;
  });
}
