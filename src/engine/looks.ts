import type { Look, Person } from './types';
import { hairForGender, hairStylesFor } from '../content/look';

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Aspecto determinístico para una persona sin aspecto propio. Los familiares comparten tono de piel con `base`. */
export function deriveLook(p: Person, base: Look): Look {
  if (p.look) return { ...p.look, hairStyle: hairForGender(p.look.hairStyle, p.gender) };
  const h = hash(p.id);
  const family = p.kind === 'mother' || p.kind === 'father' || p.kind === 'sibling' || p.kind === 'child';
  const styles = hairStylesFor(p.gender);
  return {
    skin: family ? base.skin : h % 6,
    eyes: (h >> 4) % 6,
    hairStyle: styles[(h >> 7) % styles.length],
    hairColor: p.age >= 65 ? 6 : [0, 1, 2, 3, 4, 5, 7, 1, 0, 2][(h >> 11) % 10],
  };
}
