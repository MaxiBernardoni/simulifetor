import type { GameEvent } from '../../engine/types';
import { c, fx } from '../dsl';

export const LOVE: GameEvent[] = [
  { id: 'love.meet_stranger', title: 'Un encuentro casual', tags: ['love'], weight: 14,
    conditions: [c.age(18, 70), c.hasNot('partner')],
    text: 'En una fila del banco, alguien te sonríe y te dice algo gracioso. Hay onda.',
    choices: [
      { label: 'Pedirle el número', outcomes: [
        { weight: 5, text: 'Empezaron a salir. Quizás esta vez funcione.', effects: [fx.add('partner'), fx.hap(7)] },
        { weight: 5, text: 'Te dio un número falso. Qué carajo.', effects: [fx.hap(-3)] },
      ] },
      { label: 'Ignorarlo/a', outcomes: [{ weight: 1, text: 'Te quedaste mirando el piso. El amor pasó de largo.', effects: [fx.hap(-1)] }] },
    ] },
  { id: 'love.proposal', title: 'Una propuesta', tags: ['love'], weight: 12,
    conditions: [c.has('partner'), c.single(), c.age(20, 60)],
    text: '{partner} se arrodilla en el medio de un restaurante y te propone casamiento. Todos miran.',
    choices: [
      { label: 'Decir que sí', outcomes: [
        { weight: 1, text: 'Dijiste que sí. Hubo aplausos y lágrimas. Se casaron unos meses después.', effects: [fx.marry(), fx.hap(10), fx.money(-3000)] },
      ] },
      { label: 'Decir que no', outcomes: [
        { weight: 1, text: 'Dijiste que no. {partner} se fue llorando. Fin de la historia.', effects: [fx.becomes('partner', 'ex'), fx.hap(-8)] },
      ] },
      { label: 'Pedir tiempo', outcomes: [
        { weight: 1, text: 'Pediste tiempo. {partner} lo tomó a mal.', effects: [fx.bond('partner', -15, -15), fx.hap(-3)] },
      ] },
    ] },
  { id: 'love.partner_cheats', title: 'Infidelidad', tags: ['love'], weight: 7,
    conditions: [c.has('partner'), c.age(18, 70)],
    text: 'Encontraste mensajes sospechosos en el celular de {partner}. La cosa está clara.',
    choices: [
      { label: 'Perdonar', outcomes: [
        { weight: 5, text: 'Lo/a perdonaste. Ya nada es lo mismo.', effects: [fx.bond('partner', -20, -20), fx.hap(-6)] },
        { weight: 5, text: 'Lo/a perdonaste y se lo tomó en serio. Quizás salga algo bueno.', effects: [fx.bond('partner', 5, 5), fx.hap(-2)] },
      ] },
      { label: 'Terminar la relación', outcomes: [
        { weight: 1, text: 'Cortaste todo. Dolió, pero más doloroso hubiera sido quedarte.', effects: [fx.becomes('partner', 'ex'), fx.hap(-9)] },
      ] },
      { label: 'Vengarte con otra persona', outcomes: [
        { weight: 1, text: 'Ojo por ojo. Ahora los dos quedaron mal parados.', effects: [fx.bond('partner', -30, -30), fx.hap(-2)] },
      ] },
    ] },
  { id: 'love.temptation', title: 'Tentación', tags: ['love'], weight: 8,
    conditions: [c.has('partner'), c.age(20, 65), c.stat('looks', '>=', 40)],
    text: 'Alguien muy atractivo/a se te insinúa en una reunión. {partner} está en casa.',
    choices: [
      { label: 'Ceder', outcomes: [
        { weight: 5, text: 'Cediste. Lo pasaste genial y te sentís mal.', effects: [fx.hap(2), fx.suspect(18)] },
        { weight: 5, text: '{partner} se enteró. Se armó un escándalo.', effects: [fx.bond('partner', -40, -40), fx.hap(-8)] },
      ] },
      { label: 'Rechazar', outcomes: [{ weight: 1, text: 'Dijiste que no. Te sentiste un santo/a por dos minutos.', effects: [fx.hap(1), fx.bond('partner', 2, 2)] }] },
    ] },
  { id: 'love.breakup', title: 'Se acabó', tags: ['love'], weight: 8,
    conditions: [c.has('partner'), c.single()],
    text: '{partner} te dijo que ya no funciona. Se fue con su cepillo de dientes.',
    effects: [fx.becomes('partner', 'ex'), fx.hap(-9)] },
  { id: 'love.pregnancy', title: '¡Vas a ser padre/madre!', tags: ['love', 'family'], weight: 8,
    conditions: [c.has('partner'), c.age(20, 42)],
    text: '{partner} te mostró un test con dos rayitas. Van a tener un bebé.',
    effects: [fx.add('child', 'baby'), fx.hap(9), fx.money(-1500)] },
  { id: 'love.divorce', title: 'Divorcio', tags: ['love'], weight: 8,
    conditions: [c.has('partner'), c.married(), c.age(25, 80)],
    text: 'Tras años de cenas silenciosas, {partner} pidió el divorcio. El abogado ya está en camino.',
    effects: [fx.becomes('partner', 'ex'), fx.money(-4000), fx.hap(-10)] },
  { id: 'love.date_disaster', title: 'Cita desastrosa', tags: ['love'], weight: 9,
    conditions: [c.age(18, 70), c.hasNot('partner')],
    text: 'Tu cita habló de su ex durante tres horas. Y encima te tocó pagar la cuenta.',
    effects: [fx.hap(-3), fx.money(-150)] },
  { id: 'love.ex_returns', title: 'Vuelve tu ex', tags: ['love'], weight: 8,
    conditions: [c.has('ex'), c.hasNot('partner'), c.age(20, 80)],
    text: '{ex} te escribió a las 3 de la mañana: "¿estás despierto/a?".',
    choices: [
      { label: 'Responder', outcomes: [
        { weight: 4, text: 'Hablaron por horas. Hay algo todavía.', effects: [fx.becomes('ex', 'partner'), fx.bond('partner', 8, 12), fx.hap(5)] },
        { weight: 6, text: 'Terminó en un desastre emocional. Te arrepentís.', effects: [fx.hap(-5)] },
      ] },
      { label: 'Bloquearlo/a', outcomes: [{ weight: 1, text: 'Lo/a bloqueaste. Ahora dormís mejor.', effects: [fx.hap(2), fx.bond('ex', -50, -50)] }] },
    ] },
  { id: 'love.midlife', title: 'Crisis de los 40', tags: ['love'], weight: 8,
    conditions: [c.age(40, 55), c.stat('happiness', '<=', 60)],
    text: 'Te miraste al espejo y te preguntaste en qué momento te volviste esto.',
    choices: [
      { label: 'Comprarte un auto deportivo', outcomes: [
        { weight: 1, text: 'Gastaste una fortuna en un auto que casi nunca usás. Igual te encanta.', effects: [fx.money(-7000), fx.hap(6)] },
      ] },
      { label: 'Ir a terapia', outcomes: [
        { weight: 1, text: 'Empezaste terapia. Duele, pero funciona.', effects: [fx.money(-800), fx.hap(6)] },
      ] },
      { label: 'Dejarlo todo y viajar', outcomes: [
        { weight: 1, text: 'Te fuiste tres meses de mochilero/a. Volviste con otra mirada y sin plata.', effects: [fx.money(-4000), fx.hap(9)] },
      ] },
    ] },
  { id: 'love.date_success', title: 'Química', tags: ['love'], weight: 8,
    conditions: [c.hasNot('partner'), c.age(18, 75)],
    text: 'Una amiga te presentó a alguien. Hay muy buena onda.',
    effects: [fx.add('partner'), fx.hap(6)] },
  { id: 'love.anniversary', title: 'Aniversario', tags: ['love'], weight: 10,
    conditions: [c.has('partner'), c.age(20, 90)],
    text: 'Cumplieron un año más juntos. Cenaron a la luz de las velas.',
    effects: [fx.bond('partner', 6, 6), fx.hap(4), fx.money(-200)] },
];
