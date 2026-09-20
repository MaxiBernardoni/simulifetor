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
];
