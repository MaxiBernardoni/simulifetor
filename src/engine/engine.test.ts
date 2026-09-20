import { describe, expect, it } from 'vitest';
import { ALL_EVENTS } from '../content/events';
import { ACTIVITIES } from '../content/activities';
import { PERSON_ACTIONS } from '../content/personActions';
import { CAREERS } from '../content/careers';
import { createLife } from './life';
import { ageUp } from './ageUp';
import { simulateLife } from './sim';
import { fill } from './text';
import type { Effect, GameEvent, Outcome } from './types';

const outcomesOf = (ev: GameEvent): Outcome[] => [
  ...(ev.choices?.flatMap((c) => c.outcomes) ?? []),
];

const allEffects = (ev: GameEvent): Effect[] => [
  ...(ev.effects ?? []),
  ...outcomesOf(ev).flatMap((o) => o.effects ?? []),
];

describe('contenido', () => {
  it('ids de eventos únicos', () => {
    const ids = ALL_EVENTS.map((e) => e.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('todo evento tiene texto y o efectos o decisiones', () => {
    for (const ev of ALL_EVENTS) {
      expect(ev.text.length, ev.id).toBeGreaterThan(5);
      expect(!!ev.choices?.length || !!ev.effects?.length, ev.id).toBe(true);
      for (const ch of ev.choices ?? []) {
        expect(ch.outcomes.length, `${ev.id}/${ch.label}`).toBeGreaterThan(0);
      }
    }
  });

  it('los triggers apuntan a eventos existentes', () => {
    const ids = new Set(ALL_EVENTS.map((e) => e.id));
    for (const ev of ALL_EVENTS) {
      for (const e of allEffects(ev)) {
        if ('trigger' in e) expect(ids.has(e.trigger), `${ev.id} -> ${e.trigger}`).toBe(true);
      }
    }
  });

  it('actividades y acciones con ids únicos y resultados', () => {
    const a = ACTIVITIES.map((x) => x.id);
    expect(a.length).toBe(new Set(a).size);
    const p = PERSON_ACTIONS.map((x) => x.id);
    expect(p.length).toBe(new Set(p).size);
    for (const x of [...ACTIVITIES, ...PERSON_ACTIONS]) expect(x.outcomes.length, x.id).toBeGreaterThan(0);
  });

  it('carreras con niveles', () => {
    for (const c of CAREERS) expect(c.levels.length, c.id).toBeGreaterThanOrEqual(3);
  });

  it('hay al menos 100 eventos', () => {
    expect(ALL_EVENTS.length).toBeGreaterThanOrEqual(100);
  });
});

describe('motor', () => {
  it('createLife es determinista con la misma semilla', () => {
    const a = createLife(42);
    const b = createLife(42);
    expect(a.name).toBe(b.name);
    expect(a.birthYear).toBe(b.birthYear);
    expect(a.people.map((p) => p.name)).toEqual(b.people.map((p) => p.name));
  });

  it('año de nacimiento dentro del rango', () => {
    for (let s = 1; s < 50; s++) {
      const l = createLife(s);
      expect(l.birthYear).toBeGreaterThanOrEqual(1950);
      expect(l.birthYear).toBeLessThanOrEqual(2010);
    }
  });

  it('ageUp avanza edad y año', () => {
    const l = createLife(7);
    ageUp(l);
    expect(l.age).toBe(1);
    expect(l.year).toBe(l.birthYear + 1);
  });

  it('fill reemplaza placeholders', () => {
    const l = createLife(3);
    expect(fill(l, 'Hola {name}, tu madre es {mother}')).toContain(l.name);
    expect(fill(l, '{partner}')).toBe('tu pareja');
  });

  it('300 vidas simuladas terminan sin errores y con stats válidos', () => {
    let totalAge = 0;
    for (let s = 1; s <= 300; s++) {
      const l = simulateLife(s);
      expect(l.alive, `seed ${s}`).toBe(false);
      expect(l.age, `seed ${s}`).toBeLessThan(125);
      for (const v of Object.values(l.stats)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
      expect(Number.isFinite(l.money)).toBe(true);
      expect(l.money, `seed ${s}`).toBeGreaterThan(-100000);
      totalAge += l.age;
    }
    const avg = totalAge / 300;
    // Expectativa de vida razonable.
    expect(avg).toBeGreaterThan(55);
    expect(avg).toBeLessThan(95);
  });

  it('misma semilla, misma vida', () => {
    const a = simulateLife(99);
    const b = simulateLife(99);
    expect(a.age).toBe(b.age);
    expect(a.log.length).toBe(b.log.length);
  });
});
