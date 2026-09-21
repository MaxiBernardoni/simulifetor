import type { GameEvent } from '../../engine/types';
import { c, fx } from '../dsl';

export const CRIME: GameEvent[] = [
  { id: 'crime.pickpocketed', title: 'Te robaron', tags: ['crime'], weight: 8,
    conditions: [c.age(12, 95), c.moneyGte(300)],
    text: 'Un motochorro te arrebató el celular en plena calle.',
    effects: [fx.money(-600), fx.hap(-5)] },
  { id: 'crime.witness', title: 'Testigo', tags: ['crime'], weight: 7,
    conditions: [c.age(18, 80)],
    text: 'Presenciaste un robo en la vía pública. El ladrón te vio.',
    choices: [
      { label: 'Denunciar', outcomes: [
        { weight: 6, text: 'Denunciaste. Atraparon al ladrón. La policía te felicitó.', effects: [fx.hap(3)] },
        { weight: 4, text: 'Te empezaron a amenazar por teléfono. Terminaste arrepentido/a.', effects: [fx.hap(-6)] },
      ] },
      { label: 'Hacerte el distraído/a', outcomes: [{ weight: 1, text: 'Seguiste caminando. No viste nada, no sabés nada.', effects: [fx.hap(-1)] }] },
    ] },
  { id: 'crime.dealer_offer', title: 'Oferta turbia', tags: ['crime'], weight: 7,
    conditions: [c.age(18, 45), c.moneyLte(5000)],
    text: 'Un conocido te ofrece plata fácil vendiendo "mercadería" en fiestas.',
    choices: [
      { label: 'Aceptar', outcomes: [
        { weight: 6, text: 'Ganaste bastante en unos meses. Lo dejaste antes de que te agarren.', effects: [fx.money(7000), fx.hap(2), fx.flag('dealer')] },
        { weight: 4, text: 'Te agarraron en una redada.', effects: [fx.hap(-10), fx.arrest('narcotráfico', 1, 4)] },
      ] },
      { label: 'Rechazar', outcomes: [{ weight: 1, text: 'Dijiste que no. Te miró raro, pero te dejó en paz.', effects: [] }] },
    ] },
  { id: 'crime.dui', title: 'Alcoholemia positiva', tags: ['crime'], weight: 9,
    conditions: [c.flag('driver'), c.flag('drinker'), c.age(18, 80)],
    text: 'Te frenaron en un control de tránsito. El alcoholímetro no te perdonó.',
    effects: [fx.money(-2500), fx.hap(-5)] },
  { id: 'crime.home_robbery', title: 'Entraron a tu casa', tags: ['crime'], weight: 6,
    conditions: [c.age(20, 95), c.moneyGte(3000)],
    text: 'Volviste a casa y encontraste la puerta rota. Se llevaron todo lo que tenía valor.',
    effects: [fx.money(-2500), fx.hap(-9)] },
  { id: 'crime.gang_debt', title: 'Deuda con la banda', tags: ['crime'], weight: 18,
    conditions: [c.flag('gang'), c.age(15, 40)],
    text: 'Tus "amigos" de la banda te exigen que pagues un favor. Y lo quieren ya.',
    choices: [
      { label: 'Cumplir', outcomes: [
        { weight: 5, text: 'Hiciste el trabajo. Te ganaste un poco de respeto y plata.', effects: [fx.money(1500), fx.hap(-2)] },
        { weight: 5, text: 'La policía te esperaba.', effects: [fx.hap(-10), fx.arrest('asociación ilícita', 1, 4)] },
      ] },
      { label: 'Negarte', outcomes: [
        { weight: 1, text: 'Te negaste. Te dieron una golpiza como advertencia.', effects: [fx.hea(-12), fx.hap(-6), fx.unflag('gang')] },
      ] },
    ] },
  { id: 'crime.cops_stop', title: 'Control policial', tags: ['crime'], weight: 8,
    conditions: [c.flag('thief'), c.age(16, 70)],
    text: 'La policía empezó a investigarte por el robo de hace un tiempo.',
    choices: [
      { label: 'Colaborar', outcomes: [
        { weight: 5, text: 'Colaboraste y los desviaste. Quedaste limpio.', effects: [fx.unflag('thief'), fx.hap(1)] },
        { weight: 5, text: 'Te tendieron una trampa.', effects: [fx.hap(-9), fx.arrest('robo', 1, 4)] },
      ] },
      { label: 'Huir', outcomes: [
        { weight: 3, text: 'Huiste. Por ahora te salvaste.', effects: [fx.hap(-2)] },
        { weight: 7, text: 'Te agarraron a las dos cuadras. Cargo agravado.', effects: [fx.hap(-10), fx.arrest('robo y resistencia a la autoridad', 2, 6)] },
      ] },
    ] },
  { id: 'crime.jail_fight', title: 'Pelea en la cárcel', tags: ['jail'], weight: 14,
    text: 'Un preso te desafió en el comedor. Todos miran.',
    choices: [
      { label: 'Pelear', outcomes: [
        { weight: 5, text: 'Ganaste la pelea. Ahora te respetan.', effects: [fx.hap(3), fx.hea(-4)] },
        { weight: 5, text: 'Te rompieron un par de costillas.', effects: [fx.hap(-5), fx.hea(-12)] },
      ] },
      { label: 'Ignorarlo', outcomes: [{ weight: 1, text: 'Te tildaron de débil, pero al menos seguís entero/a.', effects: [fx.hap(-3)] }] },
    ] },
  { id: 'crime.jail_visitor', title: 'Visita', tags: ['jail'], weight: 10,
    conditions: [c.has('mother')],
    text: '{mother} vino a visitarte y lloró todo el tiempo. Te dolió ver eso.',
    effects: [fx.close('mother', 6), fx.hap(-2)] },
  { id: 'crime.jail_gang', title: 'Bandas de la cárcel', tags: ['jail'], weight: 10,
    text: 'Una banda de la cárcel te ofrece protección a cambio de lealtad.',
    choices: [
      { label: 'Unirte', outcomes: [
        { weight: 6, text: 'Dentro estás más seguro/a, aunque hay cosas que hacés que no querés recordar.', effects: [fx.hap(-2), fx.hea(2)] },
        { weight: 4, text: 'Se volvieron en tu contra. Te apuñalaron en la ducha. Zafaste.', effects: [fx.hea(-15), fx.hap(-8)] },
      ] },
      { label: 'Rechazar', outcomes: [{ weight: 1, text: 'Los rechazaste. Pasaste el año mirando siempre hacia atrás.', effects: [fx.hap(-4)] }] },
    ] },
  { id: 'crime.jail_escape', title: 'Plan de fuga', tags: ['jail'], weight: 6,
    text: 'Un preso te ofrece participar de un plan para escapar. Es una locura.',
    choices: [
      { label: 'Intentarlo', outcomes: [
        { weight: 2, text: '¡Lograron escapar! Vivir prófugo/a no es fácil, pero es mejor que la celda.', effects: [fx.parole(99), fx.flag('fugitive'), fx.hap(6)] },
        { weight: 8, text: 'Los descubrieron. Te agregaron años a la condena.', effects: [fx.hap(-8), fx.jail(2, 4)] },
      ] },
      { label: 'Decir que no', outcomes: [{ weight: 1, text: 'No te metiste. Un año más tranquilo.', effects: [] }] },
    ] },
  { id: 'crime.jail_parole', title: 'Libertad condicional', tags: ['jail'], weight: 8,
    text: 'Por buena conducta, la junta redujo tu condena en un año.',
    effects: [fx.hap(6), fx.parole(1)] },
  { id: 'crime.jail_letters', title: 'Cartas', tags: ['jail'], weight: 8,
    text: 'Empezaste a escribir cartas a gente que no conocés. Una de ellas te contestó.',
    effects: [fx.hap(4), fx.add('friend')] },
];
