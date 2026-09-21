import { describe, it, expect } from 'vitest';
import { eraAt, priceIndex, wageIndex, scaleMoney, scaleText, hasTech, TECH } from '../content/eras';
import { CAREERS } from '../content/careers';
import { ACTIVITIES } from '../content/activities';
import { ALL_EVENTS } from '../content/events';
import { createLife } from './life';
import { evalCond } from './conditions';
import { rngOf } from './rng';
import { c } from '../content/dsl';
import { isEligibleForCareer, activityStatus } from './actions';
import { ageUp } from './ageUp';
import { simulateLife } from './sim';
import { realNetWorth } from './assets';

describe('eras', () => {
  it('índices positivos, acotados y crecientes para precios', () => {
    let prev = 0;
    for (let y = 1940; y <= 2120; y++) {
      const p = priceIndex(y);
      expect(p).toBeGreaterThanOrEqual(0.15);
      expect(p).toBeLessThanOrEqual(8.5);
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
      const w = wageIndex(y) / p;
      expect(w).toBeGreaterThanOrEqual(0.85);
      expect(w).toBeLessThanOrEqual(1.1);
    }
    expect(priceIndex(2000)).toBeCloseTo(1, 5);
  });

  it('la tecnología solo se agrega con los años (monótona)', () => {
    let prev = 0;
    for (let y = 1900; y <= 2120; y++) {
      const n = eraAt(y).tech.size;
      expect(n).toBeGreaterThanOrEqual(prev);
      prev = n;
    }
    expect(eraAt(1960).tech.has('internet')).toBe(false);
    expect(eraAt(2015).tech.has('smartphone')).toBe(true);
    expect(Object.keys(TECH).length).toBeGreaterThan(8);
  });

  it('leyes con rango de vigencia', () => {
    expect(eraAt(1980).laws.has('servicio_militar')).toBe(true);
    expect(eraAt(2005).laws.has('servicio_militar')).toBe(false);
    expect(eraAt(2020).laws.has('drogas_blandas_legales')).toBe(true);
  });

  it('scaleMoney y scaleText escalan por época y redondean', () => {
    expect(scaleMoney(1000, 2000)).toBe(1000);
    expect(scaleMoney(1000, 1960)).toBeLessThan(scaleMoney(1000, 2020));
    expect(scaleText('Costo: $1.000 y $500', 2000)).toBe('Costo: $1.000 y $500');
    expect(scaleText('Sin plata', 1960)).toBe('Sin plata');
    expect(scaleText('Costo: $1.000', 1960)).toMatch(/^Costo: \$\d+$/);
  });

  it('condiciones tech / law / era', () => {
    const l = createLife(5);
    const rng = rngOf(l);
    l.year = 1995;
    expect(evalCond(l, c.tech('internet'), rng)).toBe(false);
    expect(evalCond(l, c.tech('celular'), rng)).toBe(true);
    expect(evalCond(l, c.law('servicio_militar'), rng)).toBe(true);
    expect(evalCond(l, c.era('90s'), rng)).toBe(true);
    l.year = 2030;
    expect(evalCond(l, c.era('90s'), rng)).toBe(false);
  });

  it('las carreras respetan since/until', () => {
    const l = createLife(9);
    l.age = 30;
    l.edu.level = 3;
    l.stats.smarts = 90;
    const tele = CAREERS.find((x) => x.id === 'telegraphist')!;
    const inf = CAREERS.find((x) => x.id === 'influencer')!;
    l.year = 1970;
    expect(isEligibleForCareer(l, tele)).toBe(true);
    expect(isEligibleForCareer(l, inf)).toBe(false);
    l.year = 2015;
    expect(isEligibleForCareer(l, tele)).toBe(false);
    expect(isEligibleForCareer(l, inf)).toBe(true);
  });

  it('actividades con tecnología solo aparecen cuando existe', () => {
    const l = createLife(11);
    l.age = 25;
    const a = ACTIVITIES.find((x) => x.id === 'chat_ai')!;
    l.year = 2000;
    expect(activityStatus(l, a).visible).toBe(false);
    l.year = 2026;
    expect(activityStatus(l, a).visible).toBe(true);
  });

  it('todo evento con c.tech o c.year no exige tecnología inexistente en su rango', () => {
    for (const ev of ALL_EVENTS) {
      const yr = ev.conditions?.find((k) => 'year' in k) as { year: [number, number] } | undefined;
      const techs = (ev.conditions ?? []).filter((k) => 'tech' in k) as { tech: string }[];
      if (!yr) continue;
      for (const t of techs) expect(hasTech(t.tech, yr.year[1]), `${ev.id} ${t.tech}`).toBe(true);
    }
  });

  it('hay al menos 40 eventos históricos nuevos y ninguno mata directo', () => {
    const hist = ALL_EVENTS.filter((e) => e.id.startsWith('hist.'));
    expect(hist.length).toBeGreaterThanOrEqual(48);
    for (const e of hist) expect(JSON.stringify(e)).not.toContain('"die"');
  });

  it('los salarios nuevos respetan la inflación (mismo trabajo, más plata nominal después)', () => {
    const a = createLife(21);
    a.year = 1960;
    a.age = 25;
    const b = createLife(21);
    b.year = 2020;
    b.age = 25;
    const cash = CAREERS.find((x) => x.id === 'cashier')!;
    for (const l of [a, b]) {
      l.offers = ['cashier'];
      l.jailYears = 0;
    }
    expect(cash.levels[0].salary * priceIndex(2020)).toBeGreaterThan(cash.levels[0].salary * priceIndex(1960));
  });

  it('ageUp sigue funcionando en todas las épocas y el patrimonio real queda acotado', () => {
    for (const seed of [3, 8, 13, 21, 34]) {
      const l = simulateLife(seed);
      expect(Number.isFinite(realNetWorth(l))).toBe(true);
    }
    const l = createLife(40);
    l.year = 1950;
    l.birthYear = 1950;
    for (let i = 0; i < 30; i++) {
      l.pending = [];
      ageUp(l);
    }
    expect(l.year).toBe(1980);
  });
});
