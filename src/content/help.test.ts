import { describe, expect, it } from 'vitest';
import { COACH_STEPS, GLOSSARY, HELP, TIPS, tipFor } from './help';
import { createLife } from '../engine/life';

describe('ayuda y tutorial', () => {
  it('la guía de la primera vida tiene 5 pasos con destinos únicos', () => {
    expect(COACH_STEPS).toHaveLength(5);
    expect(new Set(COACH_STEPS.map((s) => s.target)).size).toBe(5);
  });
  it('la ayuda cubre los temas pedidos y el glosario los términos', () => {
    const ids = HELP.map((h) => h.id);
    for (const id of ['stats', 'age', 'act', 'work', 'money', 'crime', 'scen', 'slots', 'tree', 'ach']) expect(ids).toContain(id);
    const terms = GLOSSARY.map((g) => g.term.toLowerCase());
    for (const t of ['patrimonio neto', 'legado', 'antecedentes', 'libertad condicional', 'prófugo', 'quiebra', 'familia política', 'pariente de sangre']) {
      expect(terms).toContain(t);
    }
  });
  it('los consejos solo sugieren lo que aún no se probó', () => {
    const l = createLife(3);
    expect(tipFor(l, [], 0)).not.toBeNull();
    l.edu.level = 3;
    expect(TIPS.find((t) => t.id === 'univ')!.done(l, [])).toBe(true);
    for (let i = 0; i < 10; i++) expect(tipFor(l, [], i / 10)!.id).not.toBe('univ');
  });
});
