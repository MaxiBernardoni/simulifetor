import type { Life } from './types';

// mulberry32: el estado vive dentro de Life.rng, así los guardados son reproducibles.
export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  chance(p: number): boolean;
  pick<T>(arr: readonly T[]): T;
  weighted<T>(items: readonly T[], weight: (item: T) => number): T | undefined;
}

export function rngFromState(get: () => number, set: (s: number) => void): Rng {
  const next = () => {
    let a = (get() + 0x6d2b79f5) | 0;
    set(a);
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    chance: (p) => next() < p,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    weighted: (items, weight) => {
      const total = items.reduce((s, i) => s + weight(i), 0);
      if (total <= 0 || items.length === 0) return undefined;
      let r = next() * total;
      for (const it of items) {
        r -= weight(it);
        if (r < 0) return it;
      }
      return items[items.length - 1];
    },
  };
}

export function rngOf(life: Life): Rng {
  return rngFromState(
    () => life.rng,
    (s) => {
      life.rng = s;
    },
  );
}
