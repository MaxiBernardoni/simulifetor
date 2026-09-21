import type { PersonAction } from '../engine/types';
import { c, fx } from './dsl';

const ALL = ['mother', 'father', 'sibling', 'friend', 'partner', 'child', 'ex'] as const;

export const PERSON_ACTIONS: PersonAction[] = [
  {
    id: 'talk', label: 'Conversar', icon: 'MessageCircle', kinds: [...ALL],
    conditions: [c.tAge(3)],
    outcomes: [
      { weight: 6, text: 'Charlaste un buen rato con {target}. Se acercaron un poco.', effects: [fx.close('target', 5), fx.hap(2)] },
      { weight: 3, text: 'La charla con {target} fue de compromiso, pero algo es algo.', effects: [fx.close('target', 2)] },
      { weight: 1, text: 'Terminaron discutiendo por una tontería.', effects: [fx.close('target', -6), fx.hap(-2)] },
    ],
  },
  {
    id: 'spend_time', label: 'Pasar tiempo juntos', icon: 'Clock', kinds: [...ALL],
    outcomes: [
      { weight: 7, text: 'Pasaste un día genial con {target}.', effects: [fx.close('target', 8), fx.hap(4)] },
      { weight: 2, text: 'El plan con {target} fue un fiasco, pero se rieron igual.', effects: [fx.close('target', 3), fx.hap(1)] },
    ],
  },
  {
    id: 'gift', label: 'Hacer un regalo', icon: 'Gift', kinds: [...ALL], cost: 200,
    conditions: [c.age(8, 99)],
    outcomes: [
      { weight: 7, text: '{target} amó tu regalo.', effects: [fx.close('target', 10), fx.hap(2)] },
      { weight: 3, text: '{target} sonrió con cortesía. Claramente no le gustó.', effects: [fx.close('target', 2)] },
    ],
  },
  {
    id: 'argue', label: 'Pelear', icon: 'Flame', kinds: [...ALL],
    conditions: [c.age(6, 99), c.tAge(6)],
    outcomes: [
      { weight: 1, text: 'Te agarraste a gritos con {target}. Te dijeron cosas que duelen.', effects: [fx.close('target', -15), fx.hap(-3)] },
    ],
  },
  {
    id: 'ask_money', label: 'Pedir plata prestada', icon: 'Banknote', kinds: ['mother', 'father', 'sibling', 'friend', 'partner'],
    conditions: [c.tClose(35), c.tAge(18)],
    outcomes: [
      { weight: 5, text: '{target} te prestó $1.500 sin hacer preguntas.', effects: [fx.money(1500), fx.close('target', -3)] },
      { weight: 2, text: '{target} te dio $3.000 con un sermón incluido.', effects: [fx.money(3000), fx.close('target', -5), fx.hap(-1)] },
      { weight: 3, text: '{target} te dijo que no. Se vio incómodo.', effects: [fx.close('target', -6)] },
    ],
  },
  {
    id: 'night_together', label: 'Pasar la noche juntos', icon: 'Moon', kinds: ['partner'],
    conditions: [c.age(18, 99)],
    outcomes: [
      { weight: 6, text: 'Una noche apasionada con {target}.', effects: [fx.close('target', 6), fx.hap(6)] },
      { weight: 3, text: 'Se durmieron viendo una serie. Tan romántico como suena.', effects: [fx.close('target', 3), fx.hap(2)] },
    ],
  },
  {
    id: 'propose', label: 'Proponer casamiento', icon: 'Gem', kinds: ['partner'],
    conditions: [c.tClose(60), c.age(18, 99), c.single()],
    outcomes: [
      { weight: 7, text: '¡{target} dijo que sí! Se casaron en una ceremonia inolvidable.', effects: [fx.marry(), fx.hap(10), fx.money(-3000)] },
      { weight: 2, text: '{target} dijo que necesita más tiempo. Se cortó el clima.', effects: [fx.close('target', -15), fx.hap(-6)] },
      { weight: 1, text: '{target} se rió y te dejó. Qué papelón.', effects: [fx.becomes('target', 'ex'), fx.hap(-14)] },
    ],
  },
  {
    id: 'have_baby', label: 'Intentar tener un hijo', icon: 'Baby', kinds: ['partner'],
    conditions: [c.tClose(55), c.age(18, 45), c.tAge(18, 46)],
    outcomes: [
      { weight: 3, text: '¡{target} y vos van a ser padres! Nació un bebé sano.', effects: [fx.add('child', 'baby'), fx.hap(10), fx.money(-1500)] },
      { weight: 5, text: 'Este año no hubo suerte.', effects: [fx.hap(-1)] },
    ],
  },
  {
    id: 'break_up', label: 'Terminar la relación', icon: 'HeartCrack', kinds: ['partner'],
    outcomes: [
      { weight: 1, text: 'Terminaste con {target}. Lloraron los dos. Bueno, uno más que el otro.', effects: [fx.becomes('target', 'ex'), fx.hap(-8)] },
    ],
  },
  {
    id: 'reconnect', label: 'Reconectar', icon: 'RefreshCcw', kinds: ['ex'],
    outcomes: [
      { weight: 3, text: 'Volvieron a estar juntos con {target}. Ojalá esta vez sea distinto.', effects: [fx.becomes('target', 'partner'), fx.hap(6), fx.close('target', 20)] },
      { weight: 5, text: '{target} no quiso hablar con vos.', effects: [fx.hap(-3)] },
      { weight: 2, text: 'Se acostaron por los viejos tiempos. Un error hermoso.', effects: [fx.hap(4), fx.close('target', 5)] },
    ],
  },
  {
    id: 'party_friend', label: 'Salir de joda', icon: 'PartyPopper', kinds: ['friend', 'sibling'],
    conditions: [c.age(16, 80)], cost: 150,
    outcomes: [
      { weight: 7, text: 'Noche épica con {target}. Se van a acordar de esta salida para siempre.', effects: [fx.close('target', 10), fx.hap(5), fx.hea(-1)] },
      { weight: 2, text: '{target} se pasó de copas. Terminaste cuidándolo/a.', effects: [fx.close('target', 5), fx.hap(-1)] },
    ],
  },
  {
    id: 'play', label: 'Jugar juntos', icon: 'Blocks', kinds: ['child', 'sibling', 'friend'],
    conditions: [c.tAge(1, 12)],
    outcomes: [
      { weight: 1, text: 'Jugaste un rato con {target}. Te dieron ganas de volver a ser chico/a.', effects: [fx.close('target', 9), fx.hap(4)] },
    ],
  },
  {
    id: 'scold', label: 'Poner límites', icon: 'Megaphone', kinds: ['child'],
    conditions: [c.tAge(4, 17)],
    outcomes: [
      { weight: 6, text: '{target} entendió el mensaje… por ahora.', effects: [fx.close('target', -3), fx.hap(1)] },
      { weight: 3, text: '{target} te dijo "no te quiero" y se encerró en su cuarto.', effects: [fx.close('target', -10), fx.hap(-3)] },
    ],
  },
  {
    id: 'hug', label: 'Dar un abrazo', icon: 'Heart', kinds: ['mother', 'father', 'sibling', 'partner', 'child', 'friend'],
    conditions: [c.tAge(1)],
    outcomes: [
      { weight: 8, text: 'Le diste un abrazo enorme a {target}. Se quedaron así un rato.', effects: [fx.close('target', 6), fx.hap(3)] },
      { weight: 2, text: '{target} se sorprendió, pero terminó abrazándote fuerte.', effects: [fx.close('target', 9), fx.hap(4)] },
    ],
  },
  {
    id: 'apologize', label: 'Pedir perdón', icon: 'Megaphone', kinds: ['mother', 'father', 'sibling', 'friend', 'partner', 'child', 'ex'],
    conditions: [c.tClose(undefined, 60), c.tAge(6)],
    outcomes: [
      { weight: 6, text: '{target} aceptó tus disculpas. Se aliviaron los dos.', effects: [fx.close('target', 14), fx.hap(3)] },
      { weight: 3, text: '{target} escuchó pero no dijo nada. Ya se verá.', effects: [fx.close('target', 3)] },
      { weight: 1, text: '{target} te tiró la puerta en la cara.', effects: [fx.close('target', -5), fx.hap(-2)] },
    ],
  },
  {
    id: 'give_money', label: 'Darle plata', icon: 'Banknote', kinds: ['mother', 'father', 'sibling', 'friend', 'partner', 'child'], cost: 1000,
    conditions: [c.age(18, 99)],
    outcomes: [
      { weight: 1, text: 'Le diste $1.000 a {target}. Se emocionó y te lo agradeció.', effects: [fx.close('target', 12), fx.hap(2)] },
    ],
  },
  {
    id: 'advice', label: 'Pedir un consejo', icon: 'Lightbulb', kinds: ['mother', 'father'],
    conditions: [c.tAge(35)],
    outcomes: [
      { weight: 6, text: '{target} te dio un consejo sabio que no querías escuchar.', effects: [fx.close('target', 5), fx.sma(1), fx.hap(1)] },
      { weight: 4, text: '{target} te contó otra vez la historia de cómo era todo en su época.', effects: [fx.close('target', 3)] },
    ],
  },
  {
    id: 'cheat', label: 'Engañar a tu pareja', icon: 'VenetianMask', kinds: ['partner'],
    conditions: [c.age(18, 99)],
    outcomes: [
      { weight: 6, text: 'Tuviste una aventura a espaldas de {target}. Nadie se enteró, por ahora.', effects: [fx.hap(4), fx.close('target', -3)] },
      { weight: 4, text: '{target} se enteró de todo. Fue una escena que nadie olvida.', effects: [fx.close('target', -45), fx.hap(-8)] },
    ],
  },
  {
    id: 'divorce', label: 'Pedir el divorcio', icon: 'HeartCrack', kinds: ['partner'], cost: 3000,
    conditions: [c.married()],
    outcomes: [
      { weight: 1, text: 'Te divorciaste de {target}. Firmaron los papeles y se repartieron los muebles.', effects: [fx.becomes('target', 'ex'), fx.flag('divorced'), fx.hap(-6), fx.moneyPct(-0.25)] },
    ],
  },
  {
    id: 'cut_off', label: 'Cortar todo contacto', icon: 'X', kinds: ['friend', 'ex', 'sibling', 'father', 'mother'],
    conditions: [c.tClose(undefined, 40)],
    outcomes: [
      { weight: 1, text: 'Cortaste todo contacto con {target}. Es un alivio, con un poco de vacío.', effects: [fx.remove('target'), fx.hap(1)] },
    ],
  },
  {
    id: 'help_study', label: 'Ayudar con la tarea', icon: 'BookOpen', kinds: ['child', 'sibling'],
    conditions: [c.tAge(5, 17)],
    outcomes: [
      { weight: 8, text: 'Pasaron la tarde con la tarea de {target}. Aprendiste que ya no te acordás de nada.', effects: [fx.close('target', 8), fx.hap(2)] },
      { weight: 2, text: 'Terminaron discutiendo por una división.', effects: [fx.close('target', -3)] },
    ],
  },
];
