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
    conditions: [c.tClose(0)],
    outcomes: [
      { weight: 7, text: 'Pasaste un día genial con {target}.', effects: [fx.close('target', 8), fx.hap(4)] },
      { weight: 2, text: 'El plan con {target} fue un fiasco, pero se rieron igual.', effects: [fx.close('target', 3), fx.hap(1)] },
    ],
  },
  {
    id: 'gift', label: 'Hacer un regalo', icon: 'Gift', kinds: [...ALL], cost: 200,
    conditions: [c.age(8, 99), c.tClose(0)],
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
    conditions: [c.age(16, 80), c.tClose(0)], cost: 150,
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
    conditions: [c.tAge(1), c.tClose(0)],
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

  // ───────── Acciones que van apareciendo según amistad y amor (rotan cada año) ─────────
  // Amistosas: se desbloquean al subir la amistad. Cada resultado suma o resta una cantidad distinta.
  {
    id: 'deep_talk', label: 'Tener una charla profunda', icon: 'MessageCircle', kinds: [...ALL], rotate: true,
    conditions: [c.tClose(30), c.age(10, 99), c.tAge(10)],
    outcomes: [
      { weight: 5, text: 'Hablaron de todo hasta la madrugada con {target}. Salieron más cerca.', effects: [fx.close('target', 9), fx.hap(2)] },
      { weight: 3, text: 'La charla con {target} fue tibia, pero sincera.', effects: [fx.close('target', 3)] },
      { weight: 2, text: 'Dijiste algo de más y {target} se quedó callado/a un buen rato.', effects: [fx.close('target', -5), fx.hap(-1)] },
    ],
  },
  {
    id: 'share_secret', label: 'Contarle un secreto', icon: 'Lock', kinds: [...ALL], rotate: true,
    conditions: [c.tClose(45), c.age(10, 99), c.tAge(10)],
    outcomes: [
      { weight: 5, text: '{target} guardó tu secreto y te lo agradeció. Se sintieron unidos.', effects: [fx.close('target', 12), fx.hap(2)] },
      { weight: 3, text: '{target} escuchó en silencio y no supo qué decir.', effects: [fx.close('target', 4)] },
      { weight: 2, text: '{target} no aguantó y se lo contó a otra persona. Qué traición.', effects: [fx.close('target', -14), fx.hap(-4)] },
    ],
  },
  {
    id: 'cook_dinner', label: 'Cocinarle una cena', icon: 'UtensilsCrossed', kinds: [...ALL], rotate: true,
    conditions: [c.tClose(35), c.age(12, 99), c.tAge(12)],
    outcomes: [
      { weight: 6, text: 'La cena para {target} salió riquísima. Repitieron dos veces.', effects: [fx.close('target', 8), fx.hap(2)] },
      { weight: 3, text: 'Se te quemó todo, pero pidieron pizza y se rieron un buen rato con {target}.', effects: [fx.close('target', 4), fx.hap(1)] },
      { weight: 1, text: '{target} terminó con una descompostura. Tu cocina es un arma.', effects: [fx.close('target', -4), fx.hea(-1)] },
    ],
  },
  {
    id: 'roast', label: 'Cargarlo/a con humor negro', icon: 'Drama', kinds: ['friend', 'sibling', 'partner', 'ex'], rotate: true,
    conditions: [c.tClose(40), c.age(14, 99), c.tAge(14)],
    outcomes: [
      { weight: 5, text: 'Le tiraste una humorada cruel a {target} y se cagó de risa.', effects: [fx.close('target', 6), fx.hap(2)] },
      { weight: 3, text: '{target} se ofendió de verdad. Se acabó la gracia.', effects: [fx.close('target', -8), fx.hap(-1)] },
    ],
  },
  {
    id: 'defend', label: 'Defenderlo/a de un desconocido', icon: 'Shield', kinds: [...ALL], rotate: true,
    conditions: [c.tClose(50), c.age(14, 90), c.tAge(8)],
    outcomes: [
      { weight: 6, text: 'Te plantaste por {target} frente a un desconocido. Lo va a recordar siempre.', effects: [fx.close('target', 11), fx.hap(2)] },
      { weight: 2, text: 'Te metiste en una pelea por {target} y saliste con un ojo morado.', effects: [fx.close('target', 15), fx.hea(-3)] },
      { weight: 1, text: '{target} te dijo que no hacía falta que hagas el papelón.', effects: [fx.close('target', -3)] },
    ],
  },
  {
    id: 'trip', label: 'Hacer un viaje juntos', icon: 'Plane', kinds: [...ALL], rotate: true, cost: 800,
    conditions: [c.tClose(55), c.age(16, 90), c.tAge(12)],
    outcomes: [
      { weight: 6, text: 'El viaje con {target} fue inolvidable. Volvieron con mil anécdotas.', effects: [fx.close('target', 14), fx.hap(6)] },
      { weight: 2, text: 'Se perdieron el vuelo, pero {target} y vos se rieron de todo.', effects: [fx.close('target', 6), fx.hap(2)] },
      { weight: 2, text: 'Discutieron cada día del viaje con {target}. Volvieron sin hablarse.', effects: [fx.close('target', -9), fx.hap(-3)] },
    ],
  },

  // Románticas: aparecen con amistad de 50 para arriba entre adultos (también en la familia) y suben con el amor.
  // La otra persona reacciona bien o mal: cada reacción mueve las barras de amistad y de amor una cantidad distinta.
  {
    id: 'flirt', label: 'Coquetear', icon: 'Sparkles', kinds: [...ALL], rotate: true, risk: 6,
    conditions: [c.tClose(50), c.age(18, 99), c.tAge(18)],
    outcomes: [
      { weight: 4, text: 'Le tiraste onda a {target} y te siguió el juego. Hay algo en el aire.', effects: [fx.bond('target', 2, 8), fx.hap(2)] },
      { weight: 3, text: '{target} lo tomó como una broma y siguió con lo suyo.', effects: [fx.bond('target', 0, 2)] },
      { weight: 2, text: '{target} se incomodó bastante. Se puso raro el clima.', effects: [fx.bond('target', -10, -4), fx.hap(-2)] },
      { weight: 1, text: '{target} te frenó en seco y se lo contó a medio mundo.', effects: [fx.bond('target', -18, -8), fx.hap(-4)] },
    ],
  },
  {
    id: 'love_letter', label: 'Escribirle una carta de amor', icon: 'Mail', kinds: [...ALL], rotate: true, risk: 10,
    conditions: [c.tClose(55), c.age(18, 99), c.tAge(18)],
    outcomes: [
      { weight: 5, text: '{target} leyó tu carta dos veces y te miró distinto.', effects: [fx.bond('target', 3, 10), fx.hap(3)] },
      { weight: 3, text: '{target} sonrió, pero no contestó nada.', effects: [fx.love('target', 3)] },
      { weight: 2, text: '{target} se rió de las faltas de ortografía. Te dolió.', effects: [fx.bond('target', -6, -3), fx.hap(-2)] },
    ],
  },
  {
    id: 'confess', label: 'Confesarle lo que sentís', icon: 'Heart', kinds: [...ALL], rotate: true, risk: 12,
    conditions: [c.tClose(50), c.tLove(30), c.age(18, 99), c.tAge(18)],
    outcomes: [
      { weight: 4, text: '{target} te confesó que sentía lo mismo. Se quedaron abrazados un rato largo.', effects: [fx.bond('target', 6, 15), fx.hap(6)] },
      { weight: 3, text: '{target} dijo que prefiere que sigan como están. Doloroso, pero honesto.', effects: [fx.bond('target', 2, -5), fx.hap(-3)] },
      { weight: 2, text: '{target} se alejó sin decir nada. No volvió a escribirte.', effects: [fx.bond('target', -12, -12), fx.hap(-6)] },
    ],
  },
  {
    id: 'date', label: 'Invitarlo/a a una cita', icon: 'Wine', kinds: [...ALL], rotate: true, risk: 12, cost: 150,
    conditions: [c.tLove(10), c.age(18, 99), c.tAge(18)],
    outcomes: [
      { weight: 5, text: 'La cita con {target} salió mejor de lo esperado. Se despidieron sin ganas.', effects: [fx.bond('target', 3, 12), fx.hap(4)] },
      { weight: 3, text: 'Cenaron con {target}. Buena comida, charla a media máquina.', effects: [fx.bond('target', 1, 4), fx.hap(1)] },
      { weight: 2, text: '{target} se pasó la cita mirando el celular. Qué desperdicio de cena.', effects: [fx.bond('target', -5, -7), fx.hap(-2)] },
    ],
  },
  {
    id: 'romantic_surprise', label: 'Hacerle una sorpresa romántica', icon: 'Gift', kinds: [...ALL], rotate: true, risk: 10, cost: 300,
    conditions: [c.tLove(40), c.age(18, 99), c.tAge(18)],
    outcomes: [
      { weight: 6, text: '{target} se emocionó hasta las lágrimas con tu sorpresa.', effects: [fx.bond('target', 5, 13), fx.hap(5)] },
      { weight: 2, text: 'La sorpresa para {target} salió más o menos. Se agradece el esfuerzo.', effects: [fx.bond('target', 1, 3)] },
      { weight: 2, text: '{target} es alérgico/a a las flores. Terminaron en la guardia.', effects: [fx.bond('target', -2, -6), fx.hea(-1), fx.hap(-2)] },
    ],
  },
  {
    id: 'kiss', label: 'Darle un beso', icon: 'HeartHandshake', kinds: [...ALL], rotate: true, risk: 22,
    conditions: [c.tLove(25), c.age(18, 99), c.tAge(18)],
    outcomes: [
      { weight: 5, text: 'Besaste a {target} y el mundo se detuvo un segundo. Se acordarán de ese beso.', effects: [fx.bond('target', 4, 12), fx.hap(5)] },
      { weight: 2, text: 'El beso con {target} fue torpe, chocaron los dientes. Igual se rieron.', effects: [fx.bond('target', 1, 4), fx.hap(1)] },
      { weight: 2, text: '{target} esquivó el beso y se hizo un silencio incómodo.', effects: [fx.bond('target', -10, -9), fx.hap(-3)] },
      { weight: 1, text: '{target} te dio una cachetada y se fue. Merecido o no, quedó claro.', effects: [fx.bond('target', -20, -18), fx.hap(-6)] },
    ],
  },
  {
    id: 'jealous_scene', label: 'Hacer una escena de celos', icon: 'Flame', kinds: [...ALL], rotate: true,
    conditions: [c.tLove(30), c.age(18, 99), c.tAge(18)],
    outcomes: [
      { weight: 6, text: 'Le hiciste una escena de celos a {target} en plena calle. Todos miraron.', effects: [fx.bond('target', -8, -10), fx.hap(-3)] },
      { weight: 2, text: '{target} lo tomó como una muestra de cariño. Increíble.', effects: [fx.bond('target', 1, 5)] },
    ],
  },
  {
    id: 'lover_night', label: 'Pasar la noche con esta persona', icon: 'Moon', kinds: [...ALL], rotate: true, risk: 35,
    conditions: [c.tLove(45), c.age(18, 99), c.tAge(18)],
    outcomes: [
      { weight: 5, text: 'La noche con {target} fue intensa. Amanecieron enredados y sin ganas de salir de la cama.', effects: [fx.bond('target', 5, 10), fx.hap(6)] },
      { weight: 2, text: 'Con {target} fue un desastre torpe. Se rieron hasta las lágrimas.', effects: [fx.bond('target', 3, 3), fx.hap(2)] },
      { weight: 2, text: '{target} se fue a la madrugada sin dejar una nota.', effects: [fx.bond('target', -8, -7), fx.hap(-4)] },
    ],
  },

  // ───────── Humor, molestias, paces y pareja oficial ─────────
  {
    id: 'joke', label: 'Contarle un chiste', icon: 'Drama', kinds: [...ALL], rotate: true,
    conditions: [c.age(6, 99), c.tAge(6), c.tClose(0)],
    outcomes: [
      { weight: 5, text: 'Le contaste un chiste a {target} y se rió hasta llorar.', effects: [fx.close('target', 5), fx.hap(2)] },
      { weight: 3, text: '{target} sonrió por compromiso. El chiste era malo y lo sabés.', effects: [fx.close('target', 1)] },
      { weight: 2, text: 'El chiste cayó pésimo. {target} te miró con lástima.', effects: [fx.close('target', -3), fx.hap(-1)] },
    ],
  },
  {
    id: 'prank', label: 'Hacerle una broma pesada', icon: 'Drama', kinds: ['friend', 'sibling', 'ex', 'child'], rotate: true,
    conditions: [c.age(8, 70), c.tAge(6), c.tClose(-20)],
    outcomes: [
      { weight: 4, text: 'La broma a {target} salió perfecta. Se cagaron de risa los dos.', effects: [fx.close('target', 8), fx.hap(3)] },
      { weight: 3, text: '{target} se rió, pero te prometió venganza.', effects: [fx.close('target', 2), fx.hap(1)] },
      { weight: 3, text: 'A {target} no le causó ninguna gracia. Te lo hizo saber.', effects: [fx.close('target', -10), fx.hap(-2)] },
    ],
  },
  {
    id: 'annoy', label: 'Molestarlo/a a propósito', icon: 'Flame', kinds: ['friend', 'sibling', 'ex', 'child'], rotate: true,
    conditions: [c.age(8, 90), c.tAge(6)],
    outcomes: [
      { weight: 4, text: 'Le buscaste la pelea a {target} por pura maldad. Te divertiste más de lo que admitís.', effects: [fx.close('target', -6), fx.hap(2)] },
      { weight: 3, text: '{target} te ignoró olímpicamente. Te sentiste ridículo/a.', effects: [fx.close('target', -2), fx.hap(-1)] },
      { weight: 2, text: 'Te pasaste de la raya con {target}. Ahora hay un problema serio.', effects: [fx.close('target', -16), fx.hap(-3)] },
    ],
  },
  {
    id: 'make_peace', label: 'Proponer una tregua', icon: 'RefreshCcw', kinds: ['friend', 'sibling', 'ex', 'mother', 'father', 'child'],
    conditions: [c.tClose(undefined, -1), c.tAge(6)],
    outcomes: [
      { weight: 4, text: '{target} aceptó la tregua. Se dieron la mano, sin abrazos, pero es un comienzo.', effects: [fx.close('target', 30), fx.hap(3)] },
      { weight: 3, text: '{target} dijo que lo va a pensar. Quedó todo en suspenso.', effects: [fx.close('target', 8)] },
      { weight: 3, text: '{target} se rió de tu propuesta. Duele más así.', effects: [fx.close('target', -6), fx.hap(-2)] },
    ],
  },
  {
    id: 'make_official', label: 'Pedirle que sean pareja', icon: 'Gem', kinds: ['friend', 'ex'],
    conditions: [c.tLove(60), c.tClose(60), c.age(18, 99), c.tAge(18)],
    outcomes: [
      { weight: 6, text: '{target} dijo que sí. Desde hoy son pareja, con todo lo que eso implica.', effects: [fx.becomes('target', 'partner'), fx.bond('target', 6, 8), fx.hap(8)] },
      { weight: 3, text: '{target} necesita tiempo para pensarlo. Se hizo un silencio incómodo.', effects: [fx.bond('target', 0, -6), fx.hap(-2)] },
      { weight: 1, text: '{target} te dijo que prefiere seguir como están. Qué mal se siente.', effects: [fx.bond('target', -8, -14), fx.hap(-5)] },
    ],
  },
];

/** Categorías en las que se agrupan las acciones en la ficha de cada persona. */
export type ActionCategory = 'amistad' | 'humor' | 'amor' | 'pareja' | 'conflicto' | 'plata' | 'paz';

export const ACTION_CATEGORIES: { id: ActionCategory; label: string; icon: string; color: string }[] = [
  { id: 'amistad', label: 'Amistad', icon: 'Handshake', color: '#2A9D6F' },
  { id: 'humor', label: 'Humor y bromas', icon: 'Drama', color: '#E9A23B' },
  { id: 'amor', label: 'Amor y seducción', icon: 'Heart', color: '#E0517A' },
  { id: 'pareja', label: 'Pareja y compromiso', icon: 'Gem', color: '#B5548C' },
  { id: 'conflicto', label: 'Peleas y molestias', icon: 'Flame', color: '#D6453D' },
  { id: 'plata', label: 'Plata', icon: 'Banknote', color: '#3C8D5A' },
  { id: 'paz', label: 'Paces y distancia', icon: 'RefreshCcw', color: '#5B7DB1' },
];

/** A qué categoría pertenece cada acción (todas las de PERSON_ACTIONS tienen una: lo verifica un test). */
export const ACTION_CATEGORY: Record<string, ActionCategory> = {
  talk: 'amistad', spend_time: 'amistad', gift: 'amistad', party_friend: 'amistad', play: 'amistad', hug: 'amistad',
  help_study: 'amistad', advice: 'amistad', deep_talk: 'amistad', share_secret: 'amistad', cook_dinner: 'amistad',
  defend: 'amistad', trip: 'amistad',
  joke: 'humor', roast: 'humor', prank: 'humor',
  flirt: 'amor', love_letter: 'amor', confess: 'amor', date: 'amor', romantic_surprise: 'amor', kiss: 'amor',
  lover_night: 'amor', night_together: 'amor',
  propose: 'pareja', have_baby: 'pareja', break_up: 'pareja', divorce: 'pareja', cheat: 'pareja', make_official: 'pareja',
  argue: 'conflicto', scold: 'conflicto', jealous_scene: 'conflicto', annoy: 'conflicto',
  ask_money: 'plata', give_money: 'plata',
  apologize: 'paz', reconnect: 'paz', cut_off: 'paz', make_peace: 'paz',
};
