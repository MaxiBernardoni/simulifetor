import { describe, expect, it } from 'vitest';
import { PERSON_ACTIONS } from '../content/personActions';
import { createLife, migrateLife } from './life';
import { offeredThisYear, personActionStatus, runPersonAction } from './actions';
import { applyEffect, newEffectCtx, toneOf } from './effects';
import { rngOf } from './rng';
import { checkLife } from './invariants';
import { isBadVibes } from './people';
import type { Life, Person, PersonKind } from './types';

const action = (id: string) => PERSON_ACTIONS.find((a) => a.id === id)!;

function adultWith(kind: PersonKind, patch: Partial<Person> = {}): { life: Life; p: Person } {
  const life = createLife(11, { silent: true });
  life.age = 30;
  life.year = 2020;
  life.birthYear = 1990;
  const p: Person = { id: 'x1', kind, name: 'Sofía Paz', gender: 'F', age: 32, alive: true, friendship: 60, ...patch };
  life.people.push(p);
  return { life, p };
}

const shown = (life: Life, id: string, p: Person) => {
  const a = action(id);
  return personActionStatus(life, a, p).visible;
};

/** ¿En cuántos años de una ventana se ofrece la acción? (la rotación depende del año). */
function yearsOffered(life: Life, id: string, p: Person, from = 1990, to = 2060): number {
  let n = 0;
  for (let y = from; y < to; y++) {
    life.year = y;
    if (shown(life, id, p)) n++;
  }
  return n;
}

describe('amistad y amor: modelo y migración', () => {
  it('una partida vieja con `closeness` pasa a `friendship`; la pareja arranca con amor', () => {
    const l = createLife(3, { silent: true });
    const old = [
      { id: 'a', kind: 'friend', name: 'Ana Paz', gender: 'F', age: 20, alive: true, closeness: 42 },
      { id: 'b', kind: 'partner', name: 'Beto Paz', gender: 'M', age: 22, alive: true, closeness: 66 },
    ];
    l.people = old as unknown as Person[];
    migrateLife(l);
    expect(l.people[0]).toMatchObject({ friendship: 42 });
    expect(l.people[0].romance).toBeUndefined();
    expect(l.people[1]).toMatchObject({ friendship: 66, romance: 66 });
    expect('closeness' in l.people[0]).toBe(false);
  });

  it('el amor está bloqueado hasta que una acción positiva lo desbloquea', () => {
    const { life, p } = adultWith('friend');
    expect(p.romance).toBeUndefined();
    const ctx = newEffectCtx(p);
    applyEffect(life, { relation: { who: 'target', romance: -5 } }, ctx, rngOf(life));
    expect(p.romance).toBeUndefined();
    applyEffect(life, { relation: { who: 'target', romance: 8 } }, ctx, rngOf(life));
    expect(p.romance).toBe(8);
  });

  it('nunca hay amor si alguno de los dos es menor de edad', () => {
    const { life, p } = adultWith('friend', { age: 16 });
    applyEffect(life, { relation: { who: 'target', romance: 20, friendship: 5 } }, newEffectCtx(p), rngOf(life));
    expect(p.romance).toBeUndefined();
    expect(p.friendship).toBe(65);
    const b = adultWith('friend');
    b.life.age = 16;
    applyEffect(b.life, { relation: { who: 'target', romance: 20 } }, newEffectCtx(b.p), rngOf(b.life));
    expect(b.p.romance).toBeUndefined();
  });

  it('la amistad puede ser negativa ("mala onda") y respeta los invariantes', () => {
    const { life, p } = adultWith('friend', { friendship: 10 });
    applyEffect(life, { relation: { who: 'target', friendship: -70 } }, newEffectCtx(p), rngOf(life));
    expect(p.friendship).toBe(-60);
    expect(isBadVibes(p)).toBe(true);
    expect(checkLife(life)).toEqual([]);
    applyEffect(life, { relation: { who: 'target', friendship: -500 } }, newEffectCtx(p), rngOf(life));
    expect(p.friendship).toBe(-100);
  });

  it('a quien es "mala onda" ya no se le ofrecen gestos amistosos', () => {
    const { life, p } = adultWith('friend', { friendship: -50 });
    expect(shown(life, 'hug', p)).toBe(false);
    expect(shown(life, 'spend_time', p)).toBe(false);
    p.friendship = 20;
    expect(shown(life, 'hug', p)).toBe(true);
  });
});

describe('acciones que se desbloquean por niveles', () => {
  it('las románticas piden amistad de 50 o más', () => {
    const { life, p } = adultWith('friend', { friendship: 49 });
    expect(yearsOffered(life, 'flirt', p)).toBe(0);
    p.friendship = 50;
    expect(yearsOffered(life, 'flirt', p)).toBeGreaterThan(0);
  });

  it('cada escalón pide más amor: cita 10, beso 25, noche 45', () => {
    const { life, p } = adultWith('friend', { friendship: 60, romance: 5 });
    for (const id of ['date', 'kiss', 'lover_night']) expect(yearsOffered(life, id, p)).toBe(0);
    p.romance = 10;
    expect(yearsOffered(life, 'date', p)).toBeGreaterThan(0);
    expect(yearsOffered(life, 'kiss', p)).toBe(0);
    p.romance = 25;
    expect(yearsOffered(life, 'kiss', p)).toBeGreaterThan(0);
    expect(yearsOffered(life, 'lover_night', p)).toBe(0);
    p.romance = 45;
    expect(yearsOffered(life, 'lover_night', p)).toBeGreaterThan(0);
  });

  it('con amor bloqueado no se ofrece nada que lo requiera', () => {
    const { life, p } = adultWith('friend', { friendship: 90 });
    for (const id of ['date', 'kiss', 'lover_night', 'confess', 'romantic_surprise', 'jealous_scene'])
      expect(yearsOffered(life, id, p)).toBe(0);
  });

  it('la oferta anual rota: no aparece todos los años y es estable dentro de un año', () => {
    const { life, p } = adultWith('friend', { friendship: 60 });
    const n = yearsOffered(life, 'flirt', p, 1990, 2090);
    expect(n).toBeGreaterThan(30);
    expect(n).toBeLessThan(90);
    life.year = 2030;
    const first = offeredThisYear(life, action('flirt'), p);
    for (let i = 0; i < 5; i++) expect(offeredThisYear(life, action('flirt'), p)).toBe(first);
    // no cambia por lo que pase en el juego (amor, amistad) dentro del mismo año
    p.friendship = 99;
    expect(offeredThisYear(life, action('flirt'), p)).toBe(first);
  });

  it('acciones distintas se ofrecen en años distintos (variedad)', () => {
    const { life, p } = adultWith('friend', { friendship: 80, romance: 60 });
    const ids = ['flirt', 'date', 'kiss', 'confess', 'lover_night', 'romantic_surprise'];
    const sets = new Set<string>();
    for (let y = 2000; y < 2030; y++) {
      life.year = y;
      sets.add(ids.filter((id) => shown(life, id, p)).join(','));
    }
    expect(sets.size).toBeGreaterThan(5);
  });
});

describe('familia y edades', () => {
  it('entre adultos también se puede fomentar el amor con familiares', () => {
    for (const kind of ['mother', 'father', 'sibling', 'child'] as PersonKind[]) {
      const { life, p } = adultWith(kind, { friendship: 70, age: 40 });
      expect(yearsOffered(life, 'flirt', p), kind).toBeGreaterThan(0);
    }
  });

  it('si alguno es menor no hay acciones románticas, aunque haya amistad', () => {
    const minor = adultWith('sibling', { friendship: 90, age: 15, romance: 80 });
    for (const a of PERSON_ACTIONS.filter((x) => x.id === 'flirt' || x.conditions?.some((c) => 'targetRomance' in c))) {
      expect(yearsOffered(minor.life, a.id, minor.p), a.id).toBe(0);
    }
    const kid = adultWith('friend', { friendship: 90, romance: 80 });
    kid.life.age = 16;
    for (const a of PERSON_ACTIONS.filter((x) => x.id === 'flirt' || x.conditions?.some((c) => 'targetRomance' in c))) {
      expect(yearsOffered(kid.life, a.id, kid.p), a.id).toBe(0);
    }
  });
});

describe('reacciones distintas, cambios distintos', () => {
  it('cada acción romántica tiene reacciones con cambios diferentes de amistad y amor', () => {
    const romantic = PERSON_ACTIONS.filter(
      (a) => a.rotate && a.conditions?.some((c) => 'targetRomance' in c || JSON.stringify(c).includes('18')),
    );
    expect(romantic.length).toBeGreaterThanOrEqual(8);
    for (const a of romantic) {
      const changes = new Set(a.outcomes.map((o) => JSON.stringify((o.effects ?? []).filter((e) => 'relation' in e))));
      expect(changes.size, a.id).toBe(a.outcomes.length);
      const signs = a.outcomes.map((o) =>
        (o.effects ?? []).some((e) => 'relation' in e && ((e.relation.friendship ?? 0) < 0 || (e.relation.romance ?? 0) < 0)),
      );
      expect(signs.some(Boolean), `${a.id} debería tener reacción mala`).toBe(true);
    }
  });

  it('al ejecutar una acción romántica se mueven las barras y no se rompen los invariantes', () => {
    let moved = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const { life, p } = adultWith('friend', { friendship: 70, romance: 40 });
      life.rng = seed * 7919;
      life.money = 100000;
      life.year = 2000;
      life.birthYear = 1970;
      life.age = 30;
      while (!shown(life, 'kiss', p) && life.year < 2100) life.year++;
      life.age = life.year - life.birthYear;
      const before = [p.friendship, p.romance];
      runPersonAction(life, 'kiss', 'x1');
      if (p.friendship !== before[0] || p.romance !== before[1]) moved++;
      expect(checkLife(life)).toEqual([]);
    }
    expect(moved).toBe(40);
  });
});

describe('el resultado muestra cuánto cambiaron las barras', () => {
  it('los cambios de amistad y amor van en los deltas del resultado, sin contar como stats', () => {
    const { life, p } = adultWith('friend', { friendship: 70, romance: 40 });
    const ctx = newEffectCtx(p);
    applyEffect(life, { relation: { who: 'target', friendship: -10, romance: -9 } }, ctx, rngOf(life));
    expect(ctx.deltas).toEqual([
      { key: 'friendship', amount: -10 },
      { key: 'romance', amount: -9 },
    ]);
    expect(toneOf(ctx.deltas)).toBe('neutral');
    // el tope también se refleja: solo se informa lo que realmente cambió
    const c2 = newEffectCtx(p);
    applyEffect(life, { relation: { who: 'target', friendship: -500 } }, c2, rngOf(life));
    expect(c2.deltas).toEqual([{ key: 'friendship', amount: -160 }]);
  });
});
