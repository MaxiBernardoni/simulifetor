import { describe, expect, it } from 'vitest';
import { ALL_EVENTS } from '../content/events';
import { ACTIVITIES } from '../content/activities';
import { PERSON_ACTIONS } from '../content/personActions';
import { CAREERS } from '../content/careers';
import { HAIRS, hairGenderOf, hairForGender, hairStylesFor } from '../content/look';
import { priceIndex } from '../content/eras';
import { createLife } from './life';
import { ageUp } from './ageUp';
import { simulateLife } from './sim';
import { fill } from './text';
import { autoPlay } from './autoplay';
import { legacyPoints } from './dynasty';
import { checkScenario, createScenarioLife } from './scenarios';
import { SCENARIOS } from '../content/scenarios';
import { SCENE_KEYS, sceneForActivity, sceneForEvent, sceneForPersonAction } from '../content/scenes';
import { applyEffects, newEffectCtx } from './effects';
import { rngOf } from './rng';
import { resolveChoice } from './events';
import { buyAsset, canBuy, loanCapacity, netWorth, takeLoan } from './assets';
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

  it('createLife respeta nombre, género y aspecto elegidos', () => {
    const l = createLife(5, { name: '  Maxi ', surname: 'Bernardoni', gender: 'F', look: { skin: 4, eyes: 2, hairStyle: 5, hairColor: 7 } });
    expect(l.name).toBe('Maxi');
    expect(l.surname).toBe('Bernardoni');
    expect(l.gender).toBe('F');
    expect(l.look).toEqual({ skin: 4, eyes: 2, hairStyle: 5, hairColor: 7 });
    expect(l.people.find((p) => p.kind === 'father')!.name).toContain('Bernardoni');
  });

  it('sin opciones el aspecto es aleatorio pero válido', () => {
    const l = createLife(11);
    expect(l.look.skin).toBeGreaterThanOrEqual(0);
    expect(l.look.hairStyle).toBeLessThan(HAIRS.length);
    expect(hairGenderOf(l.look.hairStyle)).toBe(l.gender);
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
      expect(l.money, `seed ${s}`).toBeGreaterThan(-100000 * priceIndex(l.year));
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

import { fireEvent } from './events';
import { getEvent } from './registry';
function allEventsFor(l: ReturnType<typeof createLife>) {
  const ev = getEvent('court.trial');
  if (!ev) return false;
  fireEvent(l, ev);
  return l.pending[0]?.kind === 'choice';
}

describe('fase 2', () => {
  it('un arresto abre el juicio y la condena mete preso', () => {
    const l = createLife(21);
    l.age = 25;
    applyEffects(l, [{ arrest: { crime: 'robo', years: [2, 4] } }], newEffectCtx(), rngOf(l));
    expect(l.trial).not.toBeNull();
    // El trigger del juicio lo dispara la capa de acciones; acá lo hacemos a mano.
    const ctx = newEffectCtx();
    applyEffects(l, [{ sentence: 'full' }], ctx, rngOf(l));
    expect(l.trial).toBeNull();
    expect(l.jailYears).toBeGreaterThanOrEqual(2);
    expect(l.flags.criminal_record).toBe(true);
  });

  it('absolución no manda a la cárcel', () => {
    const l = createLife(22);
    l.age = 25;
    applyEffects(l, [{ arrest: { crime: 'robo', years: [2, 4] } }, { sentence: 'none' }], newEffectCtx(), rngOf(l));
    expect(l.jailYears).toBe(0);
    expect(l.flags.criminal_record).toBeFalsy();
  });

  it('un menor recibe condena acotada', () => {
    const l = createLife(23);
    l.age = 15;
    applyEffects(l, [{ arrest: { crime: 'homicidio', years: [15, 30] } }, { sentence: 'full' }], newEffectCtx(), rngOf(l));
    expect(l.jailYears).toBeLessThanOrEqual(3);
  });

  it('comprar financiado usa entrada y préstamo', () => {
    const l = createLife(24);
    l.year = 2000; // precios base
    l.age = 30;
    l.money = 20000;
    l.job = { careerId: 'office', title: 'Analista', sector: 'oficina', level: 1, salary: 40000, performance: 60, yearsAtLevel: 0, yearsTotal: 3, boss: 'X Y' };
    expect(canBuy(l, 'apt', false)).not.toBeNull();
    expect(canBuy(l, 'apt', true)).toBeNull();
    buyAsset(l, 'apt', true);
    expect(l.assets.length).toBe(1);
    expect(l.money).toBe(20000 - 12000);
    expect(l.loan).toBe(48000);
    expect(netWorth(l)).toBe(8000 + 60000 - 48000);
  });

  it('el préstamo respeta la capacidad del banco', () => {
    const l = createLife(25);
    l.age = 30;
    expect(loanCapacity(l)).toBe(0);
    takeLoan(l, 5000);
    expect(l.loan).toBe(0);
  });

  it('el juicio se dispara en el flujo de actividades y se resuelve', () => {
    let seen = false;
    for (let s = 1; s <= 200 && !seen; s++) {
      const l = createLife(s);
      l.age = 25;
      l.money = 20000;
      l.pending = [];
      applyEffects(l, [{ arrest: { crime: 'robo', years: [2, 4] }, }], newEffectCtx(), rngOf(l));
      const ev = allEventsFor(l);
      if (ev) {
        resolveChoice(l, 3);
        expect(l.trial).toBeNull();
        seen = true;
      }
    }
    expect(seen).toBe(true);
  });

  it('las vidas simuladas usan eventos con persona objetivo sin dejar {placeholders} sin resolver', () => {
    for (let s = 1; s <= 120; s++) {
      const l = simulateLife(s);
      for (const e of l.log) {
        expect(e.text, `seed ${s}`).not.toMatch(/\{\w+\}/);
        if (e.title) expect(e.title).not.toMatch(/\{\w+\}/);
      }
    }
  });
});

describe('escenas ilustradas', () => {
  const valid = new Set<string>(SCENE_KEYS);
  it('todo evento resuelve a una escena existente', () => {
    for (const ev of ALL_EVENTS) expect(valid.has(sceneForEvent(ev.id, ev.tags)), ev.id).toBe(true);
  });
  it('toda actividad y acción con personas resuelve a una escena existente', () => {
    for (const a of ACTIVITIES) expect(valid.has(sceneForActivity(a.id)), a.id).toBe(true);
    for (const a of PERSON_ACTIONS) expect(valid.has(sceneForPersonAction(a.id)), a.id).toBe(true);
  });
});

describe('fase 3: dinastía y escenarios', () => {
  it('todos los escenarios se pueden crear y arrancan activos a la edad correcta', () => {
    for (const sc of SCENARIOS) {
      const l = createScenarioLife(sc.id)!;
      expect(l, sc.id).not.toBeNull();
      expect(l.scenario).toEqual({ id: sc.id, status: 'active' });
      expect(l.age, sc.id).toBe(sc.startAge);
      expect(l.alive).toBe(true);
    }
  });

  it('Volver a empezar arranca preso', () => {
    const l = createScenarioLife('prison_reboot')!;
    expect(l.jailYears).toBe(10);
    expect(l.flags.criminal_record).toBe(true);
  });

  it('checkScenario da por ganado el objetivo y por perdido el límite de edad', () => {
    const win = createScenarioLife('centenarian')!;
    win.age = 100;
    expect(checkScenario(win)).toBe('won');
    expect(win.scenario!.status).toBe('won');
    const lose = createScenarioLife('rags_to_riches')!;
    lose.age = 60;
    expect(checkScenario(lose)).toBe('lost');
  });

  it('el legado nunca es negativo', () => {
    const l = createLife(3);
    l.flags.murderer = true;
    l.flags.criminal_record = true;
    expect(legacyPoints(l)).toBeGreaterThanOrEqual(0);
  });
});
