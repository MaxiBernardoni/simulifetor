import { describe, expect, it } from 'vitest';
import { createLife } from './life';
import { fireEvent, resolveChoice, dismissPrompt } from './events';
import { ageUp, deltaSources } from './ageUp';
import { addLog } from './effects';
import type { GameEvent } from './types';

const ev = (id: string, title: string, effects: GameEvent['effects']): GameEvent => ({
  id,
  title,
  text: 'algo pasa',
  tags: [],
  effects,
});

describe('addLog guarda los deltas cuando se le pasan', () => {
  it('sin deltas o con un array vacío no agrega el campo', () => {
    const l = createLife(1, { silent: true });
    addLog(l, 'sin efectos');
    addLog(l, 'con array vacío', 'neutral', undefined, undefined, []);
    expect(l.log[0].deltas).toBeUndefined();
    expect(l.log[1].deltas).toBeUndefined();
  });

  it('con deltas los guarda', () => {
    const l = createLife(1, { silent: true });
    addLog(l, 'algo', 'good', 'Un título', undefined, [{ key: 'happiness', amount: 4 }]);
    expect(l.log[0].deltas).toEqual([{ key: 'happiness', amount: 4 }]);
  });
});

describe('un evento sin decisiones deja sus efectos anotados en el historial', () => {
  it('fireEvent pasa ctx.deltas al log', () => {
    const l = createLife(1, { silent: true });
    fireEvent(l, ev('test.sube', 'Buen día', [{ stat: 'happiness', add: 5 }]));
    expect(l.log[l.log.length - 1].deltas).toEqual([{ key: 'happiness', amount: 5 }]);
  });
});

describe('deltaSources: de dónde salió el número del chip', () => {
  it('atribuye el cambio al evento que lo causó', () => {
    const l = createLife(1, { silent: true });
    fireEvent(l, ev('test.a', 'Buena noticia', [{ stat: 'happiness', add: 5 }]));
    fireEvent(l, ev('test.b', 'Mala noticia', [{ stat: 'happiness', add: -2 }]));
    const sources = deltaSources(l, [{ key: 'happiness', amount: 3 }], 0);
    expect(sources).toEqual([
      { title: 'Buena noticia', deltas: [{ key: 'happiness', amount: 5 }] },
      { title: 'Mala noticia', deltas: [{ key: 'happiness', amount: -2 }] },
    ]);
  });

  it('lo que no viene de un evento puntual queda en "Otros cambios", sin perder el total', () => {
    const l = createLife(1, { silent: true });
    fireEvent(l, ev('test.a', 'Un evento', [{ stat: 'health', add: -3 }]));
    const total = [{ key: 'health' as const, amount: -5 }]; // -2 de más, simulando desgaste natural (driftStats)
    const sources = deltaSources(l, total, 0);
    expect(sources).toEqual([
      { title: 'Un evento', deltas: [{ key: 'health', amount: -3 }] },
      { title: 'Otros cambios', deltas: [{ key: 'health', amount: -2 }] },
    ]);
  });

  it('sin nada atribuible, todo el total va a "Otros cambios"', () => {
    const l = createLife(1, { silent: true });
    const sources = deltaSources(l, [{ key: 'money', amount: -800 }], 0);
    expect(sources).toEqual([{ title: 'Otros cambios', deltas: [{ key: 'money', amount: -800 }] }]);
  });

  it('sin ningún residuo no agrega "Otros cambios"', () => {
    const l = createLife(1, { silent: true });
    fireEvent(l, ev('test.a', 'Un evento', [{ stat: 'happiness', add: 4 }]));
    expect(deltaSources(l, [{ key: 'happiness', amount: 4 }], 0)).toEqual([
      { title: 'Un evento', deltas: [{ key: 'happiness', amount: 4 }] },
    ]);
  });

  it('un log entry sin deltas (una entrada narrativa) no aparece en el desglose', () => {
    const l = createLife(1, { silent: true });
    addLog(l, 'Empezaste la primaria.', 'system');
    fireEvent(l, ev('test.a', 'Un evento', [{ stat: 'happiness', add: 2 }]));
    expect(deltaSources(l, [{ key: 'happiness', amount: 2 }], 0)).toEqual([
      { title: 'Un evento', deltas: [{ key: 'happiness', amount: 2 }] },
    ]);
  });

  it('ignora lo que se logueó antes de `logFrom` (años anteriores)', () => {
    const l = createLife(1, { silent: true });
    fireEvent(l, ev('test.viejo', 'Año pasado', [{ stat: 'happiness', add: 9 }]));
    const from = l.log.length;
    fireEvent(l, ev('test.nuevo', 'Este año', [{ stat: 'happiness', add: 2 }]));
    expect(deltaSources(l, [{ key: 'happiness', amount: 2 }], from)).toEqual([
      { title: 'Este año', deltas: [{ key: 'happiness', amount: 2 }] },
    ]);
  });
});

describe('ageUp: lastDeltaSources siempre suma exactamente lastDelta', () => {
  it('en 60 años de vidas al azar, el desglose nunca se desvía del total mostrado', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const l = createLife(seed * 97 + 3, { silent: true });
      for (let y = 0; y < 3 && l.alive; y++) {
        while (l.pending.length) {
          if (l.pending[0].kind === 'choice') resolveChoice(l, 0);
          else dismissPrompt(l);
        }
        ageUp(l);
        expect(l.lastDeltaSources).toBeDefined();
        // Varios eventos del mismo año pueden tocar la misma stat en sentidos opuestos y cancelarse en el neto
        // (cada uno queda igual como línea propia del desglose); lo que no puede pasar es que el NETO por stat
        // no coincida con lo que muestra el chip.
        const sum = new Map<string, number>();
        for (const src of l.lastDeltaSources!) for (const d of src.deltas) sum.set(d.key, (sum.get(d.key) ?? 0) + d.amount);
        for (const d of l.lastDelta) expect(sum.get(d.key), `seed ${seed} año ${y} ${d.key}`).toBe(d.amount);
        for (const [key, amount] of sum) {
          if (!amount) continue;
          expect(l.lastDelta.find((d) => d.key === key)?.amount, `seed ${seed} año ${y} ${key} de más`).toBe(amount);
        }
      }
    }
  });
});
