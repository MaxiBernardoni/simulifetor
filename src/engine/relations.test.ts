import { describe, expect, it } from 'vitest';
import { ACTION_CATEGORIES, ACTION_CATEGORY, PERSON_ACTIONS } from '../content/personActions';
import { BONDS } from '../content/events/bonds';
import { ageUp } from './ageUp';
import { isEligible, resolveChoice } from './events';
import { createLife, migrateLife } from './life';
import { offeredThisYear, personActionStatus, runPersonAction } from './actions';
import { applyEffect, newEffectCtx, toneOf } from './effects';
import { rngOf } from './rng';
import { checkLife } from './invariants';
import { isBadVibes } from './people';
import { relationTitle } from './relationTitle';
import { findLover } from './text';
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

describe('categorías de acciones', () => {
  it('toda acción tiene una categoría que existe', () => {
    const ids = new Set(ACTION_CATEGORIES.map((c) => c.id));
    for (const a of PERSON_ACTIONS) expect(ids.has(ACTION_CATEGORY[a.id]), `${a.id} sin categoría`).toBe(true);
    for (const id of Object.keys(ACTION_CATEGORY))
      expect(
        PERSON_ACTIONS.some((a) => a.id === id),
        `categoría de ${id} sin acción`,
      ).toBe(true);
  });
});

describe('infidelidad', () => {
  function withPartner(seed: number) {
    const { life, p } = adultWith('friend', { friendship: 70, romance: 40 });
    life.rng = seed * 104729;
    life.money = 100000;
    const partner: Person = {
      id: 'pp',
      kind: 'partner',
      name: 'Julia Roca',
      gender: 'F',
      age: 30,
      alive: true,
      friendship: 70,
      romance: 70,
    };
    life.people.push(partner);
    return { life, p, partner };
  }

  it('un gesto romántico con otra persona deja rastro en la pareja; con la propia pareja, no', () => {
    const { life, p, partner } = withPartner(1);
    while (!shown(life, 'kiss', p)) life.year++;
    runPersonAction(life, 'kiss', 'x1');
    expect(partner.suspicion ?? 0).toBeGreaterThanOrEqual(22);
    const b = withPartner(2);
    while (!shown(b.life, 'kiss', b.partner)) b.life.year++;
    runPersonAction(b.life, 'kiss', 'pp');
    expect(b.partner.suspicion ?? 0).toBe(0);
  });

  it('con mucha sospecha la pareja se termina enterando y hay que decidir; sin sospecha nunca', () => {
    let found = 0;
    let clean = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const a = withPartner(seed);
      a.partner.suspicion = 100;
      ageUp(a.life);
      if (a.life.pending.some((x) => x.kind === 'choice' && x.title === 'Te descubrieron')) found++;
      const b = adultWith('friend');
      b.life.people.push({ id: 'pp', kind: 'partner', name: 'Julia Roca', gender: 'F', age: 30, alive: true, friendship: 70, romance: 70 });
      b.life.rng = seed * 7;
      ageUp(b.life);
      if (b.life.pending.some((x) => x.title === 'Te descubrieron')) clean++;
    }
    expect(found).toBeGreaterThan(10);
    expect(clean).toBe(0);
  });

  it('el evento de descubrimiento nunca sale al azar y cada decisión tiene consecuencias válidas', () => {
    const ev = BONDS.find((e) => e.id === 'love.cheat_discovered')!;
    const l0 = withPartner(3).life;
    expect(isEligible(l0, ev)).toBe(false);
    for (let seed = 1; seed <= 40; seed++) {
      for (let choice = 0; choice < 3; choice++) {
        const { life, partner } = withPartner(seed);
        if (seed % 2) partner.married = true;
        life.pending.push({ kind: 'choice', eventId: ev.id, title: ev.title, text: ev.text, targetId: partner.id });
        resolveChoice(life, choice);
        expect(checkLife(life)).toEqual([]);
        expect(life.pending[0]?.kind).toBe('result');
      }
    }
  });

  it('un amorío con mucho amor sube la sospecha año a año', () => {
    const { life, partner } = (() => {
      const w = withPartner(5);
      w.p.romance = 80;
      return w;
    })();
    ageUp(life);
    expect(partner.suspicion ?? 0).toBeGreaterThan(0);
  });
});

describe('varios amoríos y pareja oficial', () => {
  it('pedirle a un amorío que sea pareja lo convierte en pareja y la anterior pasa a ser ex', () => {
    let done = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const { life, p } = adultWith('friend', { friendship: 80, romance: 80 });
      life.rng = seed * 31;
      life.people.push({ id: 'old', kind: 'partner', name: 'Marta Sol', gender: 'F', age: 33, alive: true, friendship: 50, romance: 50 });
      while (!shown(life, 'make_official', p)) life.year++;
      runPersonAction(life, 'make_official', 'x1');
      expect(checkLife(life)).toEqual([]);
      if (p.kind === 'partner') {
        done++;
        expect(life.people.find((x) => x.id === 'old')!.kind).toBe('ex');
      }
    }
    expect(done).toBeGreaterThan(10);
  });
});

describe('eventos de amistad, amor y enemistad', () => {
  const ev = (id: string) => BONDS.find((e) => e.id === id)!;

  it('hay eventos de las tres cosas y todos mueven las barras', () => {
    expect(BONDS.filter((e) => e.id.startsWith('bond.friend')).length).toBeGreaterThanOrEqual(4);
    expect(
      BONDS.filter((e) =>
        ['bond.slow_burn', 'bond.lover_jealous', 'bond.partner_anniversary', 'bond.partner_stress', 'bond.ex_texts'].includes(e.id),
      ).length,
    ).toBe(5);
    expect(BONDS.filter((e) => e.id.startsWith('bond.enemy') || e.id === 'bond.sibling_feud').length).toBeGreaterThanOrEqual(4);
    for (const e of BONDS) expect(JSON.stringify(e)).toMatch(/"relation"/);
  });

  it('los de enemistad solo salen con amistad negativa', () => {
    for (const id of ['bond.enemy_rumors', 'bond.enemy_street', 'bond.enemy_truce', 'bond.enemy_sabotage']) {
      const good = adultWith('friend', { friendship: 50 });
      expect(isEligible(good.life, ev(id)), `${id} con amistad positiva`).toBe(false);
      const bad = adultWith('friend', { friendship: -10 });
      expect(isEligible(bad.life, ev(id)), `${id} con enemistad`).toBe(true);
    }
    const sib = adultWith('sibling', { friendship: -20 });
    expect(isEligible(sib.life, ev('bond.sibling_feud'))).toBe(true);
  });

  it('los de amor piden adultos y amor desbloqueado cuando corresponde', () => {
    const kid = adultWith('friend', { friendship: 80, age: 16 });
    expect(isEligible(kid.life, ev('bond.slow_burn'))).toBe(false);
    const ok = adultWith('friend', { friendship: 80 });
    expect(isEligible(ok.life, ev('bond.slow_burn'))).toBe(true);
    expect(isEligible(ok.life, ev('bond.lover_jealous'))).toBe(false);
    ok.p.romance = 50;
    expect(isEligible(ok.life, ev('bond.lover_jealous'))).toBe(true);
  });

  it('la mala onda empieza en amistad negativa', () => {
    expect(isBadVibes({ friendship: 0 })).toBe(false);
    expect(isBadVibes({ friendship: -1 })).toBe(true);
  });
});

describe('títulos de relación', () => {
  const t = (kind: PersonKind, friendship: number, romance?: number, extra: Partial<Person> = {}, hasPartner = false) =>
    relationTitle({ kind, gender: 'M', friendship, romance, ...extra }, hasPartner).title;

  it('amistad: neutral, conocido, amigo y mejor amigo', () => {
    expect(t('friend', 5)).toBe('Neutral');
    expect(t('friend', 20)).toBe('Conocido');
    expect(t('friend', 50)).toBe('Amigo');
    expect(t('friend', 90)).toBe('Mejor amigo');
    expect(t('friend', 90, undefined, { gender: 'F' })).toBe('Mejor amiga');
  });

  it('enemistad: mala onda, enemigo y némesis', () => {
    expect(t('friend', -10)).toBe('Mala onda');
    expect(t('friend', -60)).toBe('Enemigo');
    expect(t('friend', -60, undefined, { gender: 'F' })).toBe('Enemiga');
    expect(t('friend', -90)).toBe('Némesis');
  });

  it('amor: interés amoroso, amigo con derechos, romance y amante según haya pareja', () => {
    expect(t('friend', 50, 30)).toBe('Interés amoroso');
    expect(t('friend', 50, 50)).toBe('Amigo con derechos');
    expect(t('friend', 70, 70)).toBe('Romance');
    expect(t('friend', 70, 70, {}, true)).toBe('Amante');
  });

  it('amor mezclado con mala onda', () => {
    expect(t('friend', -10, 40)).toBe('Relación tóxica');
    expect(t('friend', -60, 40)).toBe('Amor-odio');
    expect(t('partner', -60, 50)).toBe('Amor-odio');
    expect(t('mother', -20, 50)).toBe('Familiar: amor-odio');
  });

  it('pareja, esposo/a, alma gemela y crisis', () => {
    expect(t('partner', 60, 60)).toBe('Pareja');
    expect(t('partner', 60, 60, { married: true })).toBe('Esposo');
    expect(t('partner', 60, 60, { married: true, gender: 'F' })).toBe('Esposa');
    expect(t('partner', 10, 60)).toBe('Pareja distante');
    expect(t('partner', 90, 90)).toBe('Alma gemela');
    expect(t('partner', -10, 10)).toBe('Pareja en crisis');
  });

  it('ex: enemigo, con cuentas pendientes o amigable', () => {
    expect(t('ex', -60)).toBe('Ex enemigo');
    expect(t('ex', 30, 50)).toBe('Ex con cuentas pendientes');
    expect(t('ex', 70)).toBe('Ex amigable');
    expect(t('ex', 20)).toBe('Ex');
  });

  it('familia: entrañable, cercano, distante, con mala onda, con amor y némesis', () => {
    expect(t('sibling', 85)).toBe('Familiar entrañable');
    expect(t('mother', 60)).toBe('Familiar cercano');
    expect(t('father', 5)).toBe('Familiar distante');
    expect(t('sibling', -5)).toBe('Familiar con mala onda');
    expect(t('sibling', -90)).toBe('Némesis familiar');
    expect(t('sibling', 60, 30)).toBe('Familiar con tensión romántica');
    expect(t('child', 70, 70)).toBe('Familiar y amante');
  });
});

describe('el amante reacciona cuando se descubre el engaño', () => {
  it('findLover elige a la persona con más amor que no es la pareja, y solo adultos', () => {
    const { life, p } = adultWith('friend', { friendship: 70, romance: 50 });
    life.people.push({ id: 'pp', kind: 'partner', name: 'Julia Roca', gender: 'F', age: 30, alive: true, friendship: 70, romance: 99 });
    life.people.push({ id: 'y', kind: 'friend', name: 'Teo Ruiz', gender: 'M', age: 16, alive: true, friendship: 70, romance: 80 });
    expect(findLover(life)).toBe(p);
    p.alive = false;
    expect(findLover(life)).toBeUndefined();
  });

  it('las decisiones mueven las barras del amante sin ensuciar los chips del resultado', () => {
    const ev = BONDS.find((e) => e.id === 'love.cheat_discovered')!;
    let moved = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const { life, p } = adultWith('friend', { friendship: 70, romance: 60 });
      const partner: Person = {
        id: 'pp',
        kind: 'partner',
        name: 'Julia Roca',
        gender: 'F',
        age: 30,
        alive: true,
        friendship: 70,
        romance: 70,
      };
      life.people.push(partner);
      life.rng = seed * 977;
      life.pending.push({ kind: 'choice', eventId: ev.id, title: ev.title, text: ev.text, targetId: partner.id });
      const before = [p.friendship, p.romance];
      resolveChoice(life, seed % 3);
      if (p.friendship !== before[0] || p.romance !== before[1]) moved++;
      const result = life.pending[0];
      expect(result.kind).toBe('result');
      if (result.kind === 'result') {
        expect(result.text).toContain('Marcos'.slice(0, 0) + p.name.split(' ')[0]);
      }
      expect(checkLife(life)).toEqual([]);
    }
    expect(moved).toBe(30);
  });

  it('sin amante el texto no deja huecos ({lover} → "la otra persona")', () => {
    const ev = BONDS.find((e) => e.id === 'love.cheat_discovered')!;
    const { life } = adultWith('friend');
    const partner: Person = {
      id: 'pp',
      kind: 'partner',
      name: 'Julia Roca',
      gender: 'F',
      age: 30,
      alive: true,
      friendship: 70,
      romance: 70,
    };
    life.people.push(partner);
    life.pending.push({ kind: 'choice', eventId: ev.id, title: ev.title, text: ev.text, targetId: partner.id });
    resolveChoice(life, 1);
    expect(life.log[life.log.length - 1].text).not.toMatch(/\{\w+\}/);
  });
});
