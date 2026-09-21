import { describe, expect, it } from 'vitest';
import { runBalance } from './balance';

// Bandas objetivo de docs/10 (tolerancia amplia: muestra chica y semilla fija). La muestra grande vive en `npm run balance`.
describe('bandas de balance (150 vidas, semilla fija)', () => {
  const normal = runBalance({ n: 150, seed: 1, profile: 'normal' });

  it('perfil normal: esperanza de vida, quiebras, millonarias y antecedentes', () => {
    expect(normal.ageMean).toBeGreaterThanOrEqual(69);
    expect(normal.ageMean).toBeLessThanOrEqual(80);
    expect(normal.age.p10).toBeGreaterThanOrEqual(40);
    expect(normal.pct.bankrupt).toBeLessThanOrEqual(18);
    expect(normal.pct.millionaire).toBeGreaterThanOrEqual(3);
    expect(normal.pct.millionaire).toBeLessThanOrEqual(22);
    expect(normal.pct.record).toBeLessThanOrEqual(30);
  }, 60_000);

  it('ningún evento domina los disparos', () => {
    expect(normal.dominant).toEqual([]);
  });

  it('perfil crimen: la mayoría termina con antecedentes', () => {
    const r = runBalance({ n: 100, seed: 2, profile: 'crimen' });
    expect(r.pct.record).toBeGreaterThanOrEqual(40);
  }, 60_000);

  it('perfil familia: hay hijos y casamientos', () => {
    const r = runBalance({ n: 100, seed: 3, profile: 'familia' });
    expect(r.pct.children).toBeGreaterThanOrEqual(35);
    expect(r.pct.married).toBeGreaterThanOrEqual(12);
  }, 60_000);

  it('sin eventos muertos salvo los que dependen de la dinastía o de un rango de años', () => {
    const big = runBalance({ n: 150, seed: 4, profile: 'normal' });
    const dead = big.neverFired.filter((id) => !id.startsWith('dyn.') && !id.startsWith('law.'));
    expect(dead.length).toBeLessThanOrEqual(30);
  }, 60_000);
});
