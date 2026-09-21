import { describe, it, expect } from 'vitest';
import { HAIRS, hairForGender, hairGenderOf, hairStylesFor, kidHairStyles } from '../content/look';
import { createLife } from './life';
import { deriveLook } from './looks';
import { migrateLife } from './life';
import type { Person } from './types';

describe('peinados por género', () => {
  it('hay peinados de hombre y de mujer, sin unisex', () => {
    expect(hairStylesFor('M').length).toBeGreaterThanOrEqual(8);
    expect(hairStylesFor('F').length).toBeGreaterThanOrEqual(8);
    expect(hairStylesFor('M').length + hairStylesFor('F').length).toBe(HAIRS.length);
    for (const g of ['M', 'F'] as const) for (const k of kidHairStyles(g)) expect(hairGenderOf(k)).toBe(g);
  });

  it('hairForGender convierte siempre a un peinado válido del género', () => {
    for (let i = 0; i < HAIRS.length; i++) for (const g of ['M', 'F'] as const) expect(hairGenderOf(hairForGender(i, g))).toBe(g);
  });

  it('las vidas nuevas usan peinados de su género', () => {
    for (let s = 1; s <= 200; s++) {
      const l = createLife(s);
      expect(hairGenderOf(l.look.hairStyle), `seed ${s}`).toBe(l.gender);
      for (const p of l.people) if (p.look) expect(hairGenderOf(p.look.hairStyle)).toBe(p.gender);
    }
  });

  it('un peinado elegido a mano se ajusta al género', () => {
    const l = createLife(3, { gender: 'F', look: { skin: 1, eyes: 1, hairStyle: 3, hairColor: 1 } });
    expect(hairGenderOf(l.look.hairStyle)).toBe('F');
  });

  it('las partidas viejas (peinados unisex) se migran y deriveLook corrige a las personas', () => {
    const l = createLife(8, { gender: 'F' });
    l.look.hairStyle = 3; // pelado en una mujer (partida vieja)
    expect(hairGenderOf(migrateLife(l).look.hairStyle)).toBe('F');
    const p = { id: 'x', kind: 'friend', gender: 'M', age: 30, look: { skin: 1, eyes: 0, hairStyle: 1, hairColor: 0 } } as unknown as Person;
    expect(hairGenderOf(deriveLook(p, l.look).hairStyle)).toBe('M');
  });
});
