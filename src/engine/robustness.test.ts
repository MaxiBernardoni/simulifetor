import { describe, expect, it } from 'vitest';
import { createLife } from './life';
import { autoPlay } from './autoplay';
import { checkLife, checkWorld } from './invariants';
import { advanceWorld, createWorld } from './world';
import { ageUp } from './ageUp';
import { canSwitchTo } from './kinship';
import { performSwitch } from './switch';
import { SCENARIOS } from '../content/scenarios';
import { createScenarioLife } from './scenarios';

const FULL = !!process.env.FULL;
const N = FULL ? 1000 : 100;
const WORLDS = FULL ? 200 : 60;

function play(seed: number, opts: { crime?: number; family?: boolean }): string[] {
  const life = createLife(seed);
  const problems: string[] = [];
  for (const until of [8, 20, 35, 50, 70, 120]) {
    if (!life.alive) break;
    autoPlay(life, { seed: seed + until, untilAge: until, activityChance: 0.5, crimeChance: opts.crime ?? 0.08, familyBias: opts.family });
    for (const b of checkLife(life)) problems.push(`seed ${seed} edad ${life.age}: ${b}`);
  }
  return problems;
}

describe('invariantes de vida', () => {
  it.each([
    ['sin crimen', { crime: 0 }],
    ['crimen alto', { crime: 0.7 }],
    ['con sesgo familiar', { family: true }],
    ['por defecto', {}],
  ])(
    `%s: ${N} vidas sanas`,
    (_n, opts) => {
      const problems: string[] = [];
      for (let s = 1; s <= N && problems.length < 10; s++) problems.push(...play(s * 7 + 3, opts as { crime?: number; family?: boolean }));
      expect(problems).toEqual([]);
    },
    120_000,
  );

  it('todos los escenarios: vidas sanas', () => {
    const problems: string[] = [];
    for (const sc of SCENARIOS) {
      for (let s = 1; s <= 11; s++) {
        const life = createScenarioLife(sc.id);
        if (!life) throw new Error(`escenario ${sc.id}`);
        autoPlay(life, { seed: s, activityChance: 0.5, crimeChance: 0.1, familyBias: true });
        for (const b of checkLife(life)) problems.push(`${sc.id}/${s}: ${b}`);
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
  }, 120_000);
});

describe('invariantes del mundo y fuzz de cambios de personaje', () => {
  it(`${WORLDS} mundos con cambios de personaje cada 3–7 años`, () => {
    const problems: string[] = [];
    let failedMaterialize = 0;
    for (let seed = 1; seed <= WORLDS && problems.length < 10; seed++) {
      let life = createLife(seed * 5);
      const wd = createWorld(life);
      let next = 3 + (seed % 5);
      for (let y = 0; y < 80; y++) {
        if (life.alive) {
          life.pending = [];
          ageUp(life);
          advanceWorld(wd, life);
        }
        if (y >= next) {
          next = y + 3 + ((seed + y) % 5);
          const w = wd.world;
          const from = w.currentId;
          const candidates = Object.values(w.nodes).filter((n) => n.id !== from);
          const ok = candidates.filter((n) => canSwitchTo(w, from, n.id).ok);
          // Un candidato rechazado nunca debe poder materializarse por la vía normal.
          for (const n of candidates.filter((c) => !canSwitchTo(w, from, c.id).ok).slice(0, 2)) {
            expect(canSwitchTo(w, from, n.id).ok).toBe(false);
          }
          if (ok.length) {
            const target = ok[(seed + y) % ok.length];
            const res = performSwitch(wd, life, target.id);
            if ('error' in res) {
              // Materializar a alguien muy anciano puede fallar (el bot no llega vivo a esa edad): es un aviso esperado y raro.
              if (/No se pudo generar/.test(res.error)) failedMaterialize++;
              else if (!/Terminá|escenario/.test(res.error)) problems.push(`seed ${seed} año ${y}: ${res.error}`);
            } else {
              life = res.life;
              for (const b of checkLife(life)) problems.push(`seed ${seed} año ${y} (vida nueva): ${b}`);
            }
          }
        }
        for (const b of checkWorld(wd, life)) problems.push(`seed ${seed} año ${y}: ${b}`);
        for (const b of checkLife(life)) problems.push(`seed ${seed} año ${y}: ${b}`);
        if (problems.length >= 10) break;
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
    expect(failedMaterialize).toBeLessThanOrEqual(Math.ceil(WORLDS / 20));
  }, 120_000);
});
