import type { Life } from './types';
import { rngFromState } from './rng';
import { createLife } from './life';
import { ageUp } from './ageUp';
import { dismissPrompt, resolveChoice, choiceAvailable } from './events';
import { getEvent } from './registry';
import { activityStatus, personActionStatus, runActivity, runPersonAction, searchJobs, takeJob, canEnrollUniversity, enrollUniversity } from './actions';
import { allActivities, allPersonActions } from './registry';
import { buyAsset, canBuy, investMoney, loanCapacity, sellAsset, takeLoan, withdrawInvestments } from './assets';
import { CATALOG } from '../content/assets';

/** Juega una vida entera con decisiones al azar. Sirve para tests de humo y balance. */
export function simulateLife(seed: number, opts: { activityChance?: number } = {}): Life {
  const life = createLife(seed);
  let safety = 0;
  // RNG independiente del de la vida, para que el bot no altere el azar del juego.
  let botState = seed ^ 0x5bd1e995;
  const bot = rngFromState(
    () => botState,
    (s) => {
      botState = s;
    },
  );
  const drain = () => {
    while (life.pending.length && safety++ < 100000) {
      const p = life.pending[0];
      if (p.kind === 'result') dismissPrompt(life);
      else {
        const ev = getEvent(p.eventId)!;
        const target = life.people.find((x) => x.id === p.targetId);
        const opts2 = ev.choices!.map((c, i) => ({ c, i })).filter(({ c }) => choiceAvailable(life, c, target));
        resolveChoice(life, opts2.length ? bot.pick(opts2).i : 0);
      }
    }
  };
  const chance = opts.activityChance ?? 0.5;
  while (life.alive && safety++ < 100000) {
    drain();
    if (!life.alive) break;
    if (bot.chance(chance)) {
      if (!life.job && bot.chance(0.5)) {
        searchJobs(life);
        if (life.offers.length) takeJob(life, life.offers[0]);
      }
      if (canEnrollUniversity(life) && bot.chance(0.3)) enrollUniversity(life);
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
        // El bot evita el crimen el 92% de las veces, como haría un jugador "normal".
        if (a.category === 'crimen' && !a.inJail && bot.chance(0.92)) return false;
        return s.visible && !s.reason;
      });
      if (acts.length) runActivity(life, bot.pick(acts).id);
      drain();
      if (life.alive) {
        const p = life.people.filter((x) => x.alive);
        if (p.length) {
          const person = bot.pick(p);
          const pa = allPersonActions().filter((a) => {
            const s = personActionStatus(life, a, person);
            return s.visible && !s.reason;
          });
          if (pa.length) runPersonAction(life, bot.pick(pa).id, person.id);
          drain();
        }
      }
    }
    if (!life.alive) break;
    ageUp(life);
  }
  drain();
  return life;
}
