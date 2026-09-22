import type { Life } from './types';
import { rngFromState } from './rng';
import { ageUp } from './ageUp';
import { dismissPrompt, resolveChoice, choiceAvailable } from './events';
import { allActivities, allPersonActions, getEvent } from './registry';
import {
  activityStatus,
  canEnrollUniversity,
  enrollUniversity,
  offeredActions,
  personActionStatus,
  runActivity,
  runPersonAction,
  searchJobs,
  takeJob,
} from './actions';
import { buyAsset, canBuy, investMoney, loanCapacity, sellAsset, takeLoan, withdrawInvestments } from './assets';
import { ACTION_CATEGORY } from '../content/personActions';
import { CATALOG } from '../content/assets';

/**
 * El bot solo elige acciones amistosas: en conflicto, plata y humor se queda con las de siempre; bloquear a alguien
 * tampoco. Lo demás (peleas, bromas, préstamos…) son decisiones del jugador.
 */
const BOT_OK = new Set(['argue', 'ask_money', 'give_money', 'joke']);
const BOT_CATEGORIES = new Set(['conflicto', 'plata', 'humor']);
const botSkips = (id: string): boolean => id === 'block' || (BOT_CATEGORIES.has(ACTION_CATEGORY[id]) && !BOT_OK.has(id));

export interface AutoOpts {
  /** Edad hasta la que juega (por defecto, hasta la muerte). */
  untilAge?: number;
  seed: number;
  /** Probabilidad de hacer una actividad cada año. */
  activityChance?: number;
  /** Probabilidad de ELEGIR una actividad criminal cuando podría (0.08 = casi nunca). */
  crimeChance?: number;
  /** Empuja a formar pareja, casarse y tener hijos (para herederos y escenarios). */
  familyBias?: boolean;
  /** Se detiene si la vida pasa a ser esta (usado para no hacer trampa con la cárcel). */
  stopWhenJailed?: boolean;
}

/**
 * Juega una vida automáticamente con decisiones al azar (con sesgos configurables).
 * Sirve para tests de balance, para generar el pasado de un heredero y para arrancar escenarios.
 */
export function autoPlay(life: Life, opts: AutoOpts): void {
  let safety = 0;
  // RNG independiente del de la vida, para que el bot no altere el azar del juego.
  let botState = opts.seed ^ 0x5bd1e995;
  const bot = rngFromState(
    () => botState,
    (s) => {
      botState = s;
    },
  );
  const crimeChance = opts.crimeChance ?? 0.08;
  const chance = opts.activityChance ?? 0.5;
  const until = opts.untilAge ?? Infinity;

  const drain = () => {
    while (life.pending.length && safety++ < 100000) {
      const p = life.pending[0];
      if (p.kind === 'result') dismissPrompt(life);
      else {
        const ev = getEvent(p.eventId)!;
        const target = life.people.find((x) => x.id === p.targetId);
        const options = ev.choices!.map((c, i) => ({ c, i })).filter(({ c }) => choiceAvailable(life, c, target));
        // Las opciones que terminan en arresto se eligen con la probabilidad de crimen del perfil (como las actividades).
        const clean = options.filter(({ c }) => !JSON.stringify(c.outcomes).includes('"arrest"'));
        const pool = clean.length && clean.length < options.length && !bot.chance(crimeChance) ? clean : options;
        resolveChoice(life, pool.length ? bot.pick(pool).i : 0);
      }
    }
  };

  const familyStep = () => {
    if (!opts.familyBias || life.age < 20) return;
    const partner = life.people.find((p) => p.alive && p.kind === 'partner');
    let partnerOffered: Set<string> | undefined;
    const run = (id: string) => {
      const a = allPersonActions().find((x) => x.id === id);
      if (!a || !partner) return;
      partnerOffered ??= offeredActions(life, partner);
      const st = personActionStatus(life, a, partner, partnerOffered);
      if (st.visible && !st.reason) runPersonAction(life, id, partner.id, partnerOffered);
    };
    if (!partner && life.age < 45 && bot.chance(0.35)) {
      const a = allActivities().find((x) => x.id === 'find_partner');
      if (a) {
        const st = activityStatus(life, a);
        if (st.visible && !st.reason) runActivity(life, 'find_partner');
      }
    } else if (partner && !partner.married && bot.chance(0.3)) run('propose');
    else if (partner && life.age < 42 && bot.chance(0.3)) run('have_baby');
  };

  while (life.alive && life.age < until && safety++ < 100000) {
    drain();
    if (!life.alive) break;
    // Casi todas las personas buscan trabajo cuando no lo tienen (aunque no hagan otras actividades ese año).
    if (!life.job && life.age >= 16 && life.age < 65 && bot.chance(0.6)) {
      searchJobs(life);
      if (life.offers.length) takeJob(life, life.offers[0]);
    }
    if (bot.chance(chance)) {
      if (canEnrollUniversity(life) && bot.chance(0.1)) enrollUniversity(life);
      // Finanzas: compra, préstamo e inversión al azar.
      if (bot.chance(0.15)) {
        const it = bot.pick(CATALOG);
        const financed = bot.chance(0.5);
        if (!canBuy(life, it.id, financed)) buyAsset(life, it.id, financed);
      }
      if (bot.chance(0.1) && loanCapacity(life) >= 5000) takeLoan(life, 5000);
      if (bot.chance(0.1)) investMoney(life, 2000);
      if (bot.chance(0.05)) withdrawInvestments(life);
      if (life.assets.length && bot.chance(0.05)) sellAsset(life, life.assets[0].id);
      const acts = allActivities().filter((a) => {
        const s = activityStatus(life, a);
        if (a.category === 'crimen' && !a.inJail && !bot.chance(crimeChance)) return false;
        return s.visible && !s.reason;
      });
      if (acts.length) runActivity(life, bot.pick(acts).id);
      drain();
      if (life.alive) {
        const p = life.people.filter((x) => x.alive);
        if (p.length) {
          const person = bot.pick(p);
          const offered = offeredActions(life, person);
          const pa = allPersonActions().filter((a) => {
            // El bot no molesta ni coquetea con terceros: esas acciones son decisiones del jugador.
            if (botSkips(a.id) || (a.risk && person.kind !== 'partner')) return false;
            const s = personActionStatus(life, a, person, offered);
            return s.visible && !s.reason;
          });
          if (pa.length) runPersonAction(life, bot.pick(pa).id, person.id, offered);
          drain();
        }
      }
      familyStep();
      drain();
    }
    if (!life.alive) break;
    if (life.age + 1 > until) break;
    ageUp(life);
  }
  drain();
}

/** Deja limpio el estado de una vida recién generada por simulación (sin deudas ni restos de la simulación). */
export function tidyAfterSimulation(life: Life): void {
  life.money = Math.max(0, life.money);
  life.loan = 0;
  life.lastDelta = [];
  life.stats.happiness = Math.max(life.stats.happiness, 35);
  life.stats.health = Math.max(life.stats.health, 40);
  life.usedThisYear = [];
  life.offers = [];
}
