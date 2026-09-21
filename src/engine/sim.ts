import type { Life } from './types';
import { createLife } from './life';
import { autoPlay } from './autoplay';

/** Juega una vida entera con decisiones al azar. Sirve para tests de humo y balance. */
export function simulateLife(seed: number, opts: { activityChance?: number } = {}): Life {
  const life = createLife(seed);
  autoPlay(life, { seed, activityChance: opts.activityChance ?? 0.5, crimeChance: 0.08 });
  return life;
}
