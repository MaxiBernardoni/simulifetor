import type { GameEvent } from '../../engine/types';
import { c, fx } from '../dsl';

// Eventos de dinastía: solo aparecen en vidas de herederos.
export const DYNASTY: GameEvent[] = [
  { id: 'dyn.parents_letter', title: 'Una carta de quien te crió', tags: ['dynasty'], once: true, weight: 30,
    conditions: [c.flag('heir'), c.age(14, 60)],
    text: 'Ordenando la casa familiar encontraste una carta que te dejó quien te crió. No pudiste terminar de leerla sin llorar.',
    effects: [fx.hap(3), fx.sma(1)] },
  { id: 'dyn.heirloom', title: 'La herencia sentimental', tags: ['dynasty'], once: true, weight: 24,
    conditions: [c.flag('heir'), c.age(16, 70)],
    text: 'Entre las cosas de la familia hay un reloj antiguo que pasó por tres generaciones. Un anticuario te ofrece $8.000.',
    choices: [
      { label: 'Conservarlo', outcomes: [
        { weight: 1, text: 'Lo guardaste. Cada vez que lo mirás te acordás de quién viniste.', effects: [fx.hap(5)] },
      ] },
      { label: 'Venderlo', outcomes: [
        { weight: 1, text: 'Lo vendiste. La plata vino bien, aunque a veces lo extrañás.', effects: [fx.money(8000), fx.hap(-2)] },
      ] },
    ] },
  { id: 'dyn.family_business', title: 'El negocio familiar', tags: ['dynasty'], weight: 14, once: true,
    conditions: [c.flag('heir'), c.age(22, 55), c.moneyGte(5000)],
    text: 'La familia dejó un pequeño negocio que hoy anda a media máquina. Depende de vos qué pasa con él.',
    choices: [
      { label: 'Hacerte cargo', outcomes: [
        { weight: 5, text: 'Lo levantaste con mucho esfuerzo y hoy es rentable. Tu apellido vuelve a tener peso.', effects: [fx.money(18000), fx.hap(6)] },
        { weight: 5, text: 'No era tu mundo. Perdiste tiempo y plata antes de cerrarlo.', effects: [fx.money(-6000), fx.hap(-4)] },
      ] },
      { label: 'Venderlo', outcomes: [
        { weight: 1, text: 'Lo vendiste y cerraste ese capítulo. Sin culpa… casi.', effects: [fx.money(9000), fx.hap(-1)] },
      ] },
    ] },
  { id: 'dyn.scandal', title: 'El pasado de tu familia', tags: ['dynasty'], weight: 18,
    conditions: [c.flag('infamous_family'), c.age(15, 60)],
    text: 'Un periodista vuelve sobre la historia de tu familia. Tu apellido en los titulares, otra vez.',
    choices: [
      { label: 'Dar la cara', outcomes: [
        { weight: 5, text: 'Hablaste con honestidad y la gente lo valoró. Mejor que esconderte.', effects: [fx.hap(3), fx.sma(1)] },
        { weight: 5, text: 'Todo salió peor: te cortaron y hablaron mal de vos.', effects: [fx.hap(-6), fx.perf(-8)] },
      ] },
      { label: 'Ignorarlo', outcomes: [{ weight: 1, text: 'No dijiste nada. La historia se enfrió sola con el tiempo.', effects: [fx.hap(-2)] }] },
    ] },
  { id: 'dyn.pressure', title: 'El peso del apellido', tags: ['dynasty'], weight: 16,
    conditions: [c.flag('famous_family'), c.age(15, 55)],
    text: 'Todos esperan que estés a la altura del apellido. Cualquier error es noticia de barrio.',
    effects: [fx.hap(-4), fx.sma(1)] },
  { id: 'dyn.name_opens_doors', title: 'Un apellido que abre puertas', tags: ['dynasty'], weight: 14,
    conditions: [c.flag('famous_family'), c.age(18, 60)],
    text: 'Alguien reconoció tu apellido y te dio una mano que otros no conseguirían ni en diez años.',
    effects: [fx.money(3000), fx.hap(4)] },
  { id: 'dyn.sibling_dispute', title: 'Pelea por la herencia', tags: ['dynasty'], target: 'sibling', weight: 14, once: true,
    conditions: [c.flag('heir'), c.age(18, 60)],
    text: '{target} cree que la herencia se repartió mal y te lo dijo en la cara.',
    choices: [
      { label: 'Compartir algo de plata', conditions: [c.moneyGte(3000)], outcomes: [
        { weight: 1, text: 'Le diste $3.000. {target} lloró y se disculpó. La familia sigue unida.', effects: [fx.money(-3000), fx.close('target', 25), fx.hap(2)] },
      ] },
      { label: 'Defender tu parte', outcomes: [
        { weight: 1, text: 'Te quedaste firme. {target} dejó de hablarte por años.', effects: [fx.close('target', -40), fx.hap(-4)] },
      ] },
    ] },
];
