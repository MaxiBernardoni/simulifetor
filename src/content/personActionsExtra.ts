import type { Cond, Effect, Outcome, PersonAction, PersonKind } from '../engine/types';
import type { ActionCategory } from './personActions';
import { c, fx } from './dsl';

// Catálogo ampliado de acciones con personas: cada categoría tiene 12 o más, y la ficha muestra hasta 6 por año
// (ver `offeredActions` en engine/actions.ts). Cada resultado suma o resta distintas cantidades de amistad / amor.

const ALL: PersonKind[] = ['mother', 'father', 'sibling', 'friend', 'partner', 'child', 'ex'];
const PEERS: PersonKind[] = ['friend', 'sibling', 'ex'];
const ADULTS: Cond[] = [c.age(18, 99), c.tAge(18)];

const o = (weight: number, text: string, ...effects: Effect[]): Outcome => ({ weight, text, effects });

export const EXTRA_CATEGORY: Record<string, ActionCategory> = {};

/** Registra las acciones de una categoría. */
function group(category: ActionCategory, list: PersonAction[]): PersonAction[] {
  for (const a of list) EXTRA_CATEGORY[a.id] = category;
  return list;
}

const AMISTAD = group('amistad', [
  { id: 'walk', label: 'Salir a caminar', icon: 'Footprints', kinds: ALL, conditions: [c.age(6, 99), c.tAge(4), c.tClose(0)],
    outcomes: [
      o(6, 'Caminaron sin rumbo con {target} y hablaron de todo un poco.', fx.close('target', 5), fx.hap(2)),
      o(3, 'Empezó a llover y volvieron corriendo con {target}, empapados y riéndose.', fx.close('target', 7), fx.hap(2), fx.hea(-1)),
      o(1, 'Caminaron en silencio con {target}. Un poco incómodo.', fx.close('target', 1)),
    ] },
  { id: 'movie', label: 'Ver una película juntos', icon: 'Film', kinds: ALL, conditions: [c.age(6, 99), c.tAge(4), c.tClose(10)],
    outcomes: [
      o(5, 'La película que eligió {target} era buenísima. Se pasaron el resto de la noche comentándola.', fx.close('target', 6), fx.hap(2)),
      o(3, 'Se durmieron a los veinte minutos con {target}. Igual estuvo lindo.', fx.close('target', 3)),
      o(2, 'Discutieron con {target} sobre qué ver y no vieron nada.', fx.close('target', -3), fx.hap(-1)),
    ] },
  { id: 'compliment', label: 'Hacerle un halago sincero', icon: 'Star', kinds: ALL, conditions: [c.tAge(6), c.tClose(0)],
    outcomes: [
      o(6, 'Le dijiste algo lindo de verdad a {target}. Se quedó un segundo sin palabras.', fx.close('target', 6), fx.hap(1)),
      o(3, '{target} pensó que le estabas por pedir algo. Con razón.', fx.close('target', 1)),
    ] },
]);

const HUMOR = group('humor', [
  { id: 'meme', label: 'Mandarle un meme', icon: 'Phone', kinds: ALL, conditions: [c.age(10, 99), c.tAge(10), c.tClose(0)],
    outcomes: [
      o(6, '{target} respondió con tres emojis llorando de risa.', fx.close('target', 3), fx.hap(1)),
      o(3, '{target} lo dejó en visto. El meme era malo, tenés que aceptarlo.', fx.close('target', 0)),
      o(1, 'Era el meme equivocado y {target} lo tomó a mal.', fx.close('target', -4), fx.hap(-1)),
    ] },
  { id: 'imitate', label: 'Hacerle una imitación', icon: 'Drama', kinds: ALL, conditions: [c.tAge(6), c.tClose(20)],
    outcomes: [
      o(5, 'Imitaste a {target} y salió idéntico. Se rió hasta las lágrimas.', fx.close('target', 6), fx.hap(2)),
      o(3, '{target} dijo que no se parece en nada. Se ofendió un poquito.', fx.close('target', -3)),
    ] },
  { id: 'nickname', label: 'Ponerle un apodo ridículo', icon: 'Tag', kinds: PEERS.concat(['child']), conditions: [c.tAge(4), c.tClose(20)],
    outcomes: [
      o(5, 'El apodo que le pusiste a {target} pegó. Ya lo usa todo el mundo.', fx.close('target', 6), fx.hap(2)),
      o(4, '{target} odió el apodo y te prohibió repetirlo.', fx.close('target', -6), fx.hap(-1)),
    ] },
  { id: 'silly_dance', label: 'Bailar haciendo el ridículo', icon: 'Music', kinds: ALL, conditions: [c.age(8, 99), c.tAge(6), c.tClose(30)],
    outcomes: [
      o(6, 'Bailaron con {target} como si nadie mirara. Nadie miró, por suerte.', fx.close('target', 7), fx.hap(3)),
      o(2, 'Alguien los filmó bailando con {target}. Ya circula el video.', fx.close('target', 4), fx.hap(-1)),
    ] },
  { id: 'embarrass_story', label: 'Contar una anécdota vergonzosa suya', icon: 'Megaphone', kinds: PEERS.concat(['child']), conditions: [c.tAge(8), c.tClose(10)],
    outcomes: [
      o(5, 'Contaste la historia más vergonzosa de {target}. Todos lloraban de risa, hasta {target}.', fx.close('target', 4), fx.hap(2)),
      o(4, '{target} se puso rojo de furia. Nunca más le contás nada gracioso.', fx.close('target', -9), fx.hap(-1)),
    ] },
  { id: 'karaoke', label: 'Cantar karaoke juntos', icon: 'Mic', kinds: ALL, cost: 50, conditions: [c.age(12, 99), c.tAge(12), c.tClose(25)],
    outcomes: [
      o(5, 'Cantaron a los gritos con {target}. Desafinaron, pero con pasión.', fx.close('target', 8), fx.hap(4)),
      o(3, 'Te tocó cantar solo/a y {target} filmó todo. Ya te lo va a cobrar.', fx.close('target', 3), fx.hap(1)),
    ] },
  { id: 'dark_joke', label: 'Hacer un chiste de humor negro', icon: 'Skull', kinds: ALL, conditions: [c.age(16, 99), c.tAge(16), c.tClose(35)],
    outcomes: [
      o(5, 'El chiste negro le encantó a {target}. Tienen el mismo sentido del humor enfermo.', fx.close('target', 7), fx.hap(2)),
      o(3, '{target} se quedó helado/a. Hay chistes que todavía no tocaban.', fx.close('target', -7), fx.hap(-1)),
    ] },
  { id: 'game_night', label: 'Armar una noche de juegos', icon: 'Gamepad2', kinds: ALL, conditions: [c.tAge(6), c.tClose(25)],
    outcomes: [
      o(6, 'La noche de juegos con {target} terminó con gritos, trampas y risas.', fx.close('target', 8), fx.hap(3)),
      o(2, 'Se pelearon por las reglas con {target} y nadie terminó la partida.', fx.close('target', -4), fx.hap(-1)),
    ] },
  { id: 'tall_tale', label: 'Contarle una mentira exagerada', icon: 'VenetianMask', kinds: ALL, conditions: [c.tAge(8), c.tClose(0)],
    outcomes: [
      o(5, '{target} se creyó tu mentira al principio y después no te lo perdonó de tanto reírse.', fx.close('target', 5), fx.hap(2)),
      o(3, '{target} te descubrió a los dos minutos. Ni un poco convincente.', fx.close('target', 0)),
      o(1, '{target} se lo tomó en serio y armó un lío enorme.', fx.close('target', -6), fx.hap(-2)),
    ] },
]);

const AMOR = group('amor', [
  { id: 'compliment_love', label: 'Piropearlo/a', icon: 'Star', kinds: ALL, risk: 5, conditions: [c.tClose(50), ...ADULTS],
    outcomes: [
      o(5, 'Le tiraste un piropo a {target} y se puso colorado/a.', fx.bond('target', 2, 7), fx.hap(2)),
      o(3, '{target} se rió y te dijo que estás loco/a.', fx.bond('target', 1, 2)),
      o(2, '{target} puso cara de asco y cambió de tema.', fx.bond('target', -7, -3), fx.hap(-2)),
    ] },
  { id: 'hold_hands', label: 'Tomarle la mano', icon: 'Hand', kinds: ALL, risk: 8, conditions: [c.tLove(10), ...ADULTS],
    outcomes: [
      o(6, 'Le tomaste la mano a {target} y no la soltó. Se miraron sin decir nada.', fx.bond('target', 2, 8), fx.hap(3)),
      o(2, '{target} retiró la mano despacio. El silencio dolió.', fx.bond('target', -4, -6), fx.hap(-2)),
    ] },
  { id: 'slow_dance', label: 'Bailar pegados', icon: 'Music', kinds: ALL, risk: 10, conditions: [c.tLove(15), ...ADULTS],
    outcomes: [
      o(5, 'Bailaron pegados con {target}. Por un rato el resto del mundo no existió.', fx.bond('target', 3, 9), fx.hap(4)),
      o(3, 'Le pisaste los pies a {target} tres veces. Se rieron igual.', fx.bond('target', 2, 3), fx.hap(1)),
      o(1, '{target} se sintió incómodo/a y se fue a sentar.', fx.bond('target', -6, -6), fx.hap(-2)),
    ] },
  { id: 'sunset_walk', label: 'Caminata al atardecer', icon: 'Sunset', kinds: ALL, risk: 8, conditions: [c.tLove(20), ...ADULTS],
    outcomes: [
      o(6, 'Caminaron con {target} mientras el cielo se ponía naranja. Fue casi de película.', fx.bond('target', 3, 8), fx.hap(3)),
      o(2, 'Se largó a llover con {target} a diez cuadras de todo. Igual fue lindo.', fx.bond('target', 4, 5), fx.hea(-1)),
    ] },
  { id: 'stargaze', label: 'Mirar las estrellas juntos', icon: 'Star', kinds: ALL, risk: 8, conditions: [c.tLove(20), ...ADULTS],
    outcomes: [
      o(6, 'Se acostaron a mirar las estrellas con {target}. Hablaron bajito hasta muy tarde.', fx.bond('target', 3, 9), fx.hap(3)),
      o(2, 'Los picaron los mosquitos toda la noche. {target} lo tomó con humor.', fx.bond('target', 2, 2), fx.hea(-1)),
    ] },
  { id: 'love_song', label: 'Dedicarle una canción', icon: 'Music', kinds: ALL, risk: 10, conditions: [c.tLove(30), ...ADULTS],
    outcomes: [
      o(5, '{target} escuchó la canción que le dedicaste con los ojos brillantes.', fx.bond('target', 3, 10), fx.hap(3)),
      o(3, '{target} dijo que la letra es medio cursi, pero sonrió.', fx.bond('target', 1, 4)),
      o(2, 'Elegiste la canción equivocada, la de su ex. Silencio total.', fx.bond('target', -6, -9), fx.hap(-3)),
    ] },
  { id: 'massage', label: 'Hacerle un masaje', icon: 'HandHeart', kinds: ALL, risk: 14, conditions: [c.tLove(40), ...ADULTS],
    outcomes: [
      o(6, 'El masaje a {target} terminó en algo más que un masaje.', fx.bond('target', 3, 10), fx.hap(5)),
      o(3, '{target} se durmió a la mitad. Tomalo como un elogio.', fx.bond('target', 2, 3), fx.hap(1)),
      o(1, 'Le apretaste mal un nervio y {target} gritó de dolor.', fx.bond('target', -4, -5), fx.hap(-2)),
    ] },
]);

const PAREJA = group('pareja', [
  { id: 'move_in', label: 'Proponerle mudarse juntos', icon: 'House', kinds: ['partner'], conditions: [c.tClose(55), c.tLove(55), ...ADULTS],
    outcomes: [
      o(5, '{target} aceptó mudarse con vos. Las cajas, la mudanza y las primeras peleas por el orden.', fx.bond('target', 4, 6), fx.hap(5), fx.money(-300)),
      o(3, '{target} dijo que todavía no está listo/a. Te quedaste pensando.', fx.bond('target', -2, -5), fx.hap(-2)),
    ] },
  { id: 'plan_future', label: 'Planear el futuro juntos', icon: 'Lightbulb', kinds: ['partner'], conditions: [c.tClose(40), c.tLove(30), ...ADULTS],
    outcomes: [
      o(6, 'Se pasaron la noche haciendo planes con {target}: casa, viajes, hijos, un perro.', fx.bond('target', 5, 7), fx.hap(4)),
      o(3, 'Descubrieron con {target} que quieren cosas bastante distintas.', fx.bond('target', -3, -6), fx.hap(-2)),
    ] },
  { id: 'couple_trip', label: 'Hacer un viaje de pareja', icon: 'Plane', kinds: ['partner'], cost: 1200, conditions: [c.tClose(45), c.tLove(40), ...ADULTS],
    outcomes: [
      o(6, 'El viaje con {target} fue un sueño: playa, fotos y cero problemas.', fx.bond('target', 6, 10), fx.hap(6)),
      o(3, 'Perdieron la valija pero se rieron de todo con {target}.', fx.bond('target', 4, 5), fx.hap(2)),
      o(2, 'Se pelearon con {target} cada día del viaje. Volvieron peor que cuando se fueron.', fx.bond('target', -8, -9), fx.hap(-4)),
    ] },
  { id: 'meet_family', label: 'Presentarle a tu familia', icon: 'Users', kinds: ['partner'], conditions: [c.tClose(40), c.tLove(35), ...ADULTS],
    outcomes: [
      o(5, 'Tu familia adoró a {target}. Sobre todo tu madre, que no para de hablar.', fx.bond('target', 4, 6), fx.hap(4)),
      o(3, 'La cena fue tensa: tu padre hizo preguntas incómodas a {target}.', fx.bond('target', -2, -1), fx.hap(-1)),
      o(2, 'Tu familia dijo que {target} no les gustó. Justo delante de {target}.', fx.bond('target', -8, -8), fx.hap(-3)),
    ] },
  { id: 'couple_therapy', label: 'Ir a terapia de pareja', icon: 'Heart', kinds: ['partner'], cost: 400, conditions: [c.tClose(0, 60), ...ADULTS],
    outcomes: [
      o(5, 'La terapia con {target} los ayudó a hablar en vez de gritar. Salieron mejor.', fx.bond('target', 8, 7), fx.hap(3)),
      o(3, 'Fueron a terapia con {target} pero se pasaron la sesión discutiendo.', fx.bond('target', -2, -3), fx.hap(-1)),
    ] },
  { id: 'renew_vows', label: 'Renovar los votos', icon: 'Gem', kinds: ['partner'], cost: 800, conditions: [c.married(), c.tClose(50), c.tLove(40), ...ADULTS],
    outcomes: [
      o(7, 'Renovaron los votos con {target} rodeados de amigos. Lloraron los dos.', fx.bond('target', 6, 10), fx.hap(6)),
      o(2, 'Renovaron los votos y {target} se emocionó tanto que se desmayó. Un clásico.', fx.bond('target', 5, 6), fx.hap(3)),
    ] },
  { id: 'adopt_together', label: 'Adoptar una mascota juntos', icon: 'Dog', kinds: ['partner'], cost: 300, conditions: [c.tClose(45), c.tLove(35), ...ADULTS],
    outcomes: [
      o(6, 'Adoptaron un perro con {target}. Ya es el rey de la casa.', fx.bond('target', 5, 6), fx.hap(5)),
      o(2, 'El perro rompió el sillón y {target} y vos se pelean por quién lo saca a pasear.', fx.bond('target', -2, -1), fx.hap(1)),
    ] },
]);

const CONFLICTO = group('conflicto', [
  { id: 'insult', label: 'Insultarlo/a', icon: 'Megaphone', kinds: ALL, conditions: [c.age(8, 99), c.tAge(6)],
    outcomes: [
      o(5, 'Le dijiste de todo a {target}. Se quedó helado/a.', fx.close('target', -12), fx.hap(-1)),
      o(3, '{target} te insultó peor. Perdiste feo.', fx.close('target', -10), fx.hap(-3)),
      o(1, 'Te pasaste tanto que {target} lloró. Y ahora el malo sos vos.', fx.close('target', -18), fx.hap(-4)),
    ] },
  { id: 'silent_treatment', label: 'Hacerle la ley del hielo', icon: 'Snowflake', kinds: ALL, conditions: [c.age(8, 99), c.tAge(6)],
    outcomes: [
      o(5, 'No le hablaste a {target} en una semana. Se preguntó qué hizo mal.', fx.close('target', -6), fx.hap(-1)),
      o(3, '{target} ni se dio cuenta de que no le hablabas. Auch.', fx.close('target', -2), fx.hap(-2)),
    ] },
  { id: 'gossip', label: 'Hablar mal a sus espaldas', icon: 'MessageCircle', kinds: PEERS, conditions: [c.age(12, 99), c.tAge(10)],
    outcomes: [
      o(5, 'Le hiciste el cuento a medio barrio sobre {target}. Por ahora nadie lo sabe.', fx.close('target', -3), fx.hap(1)),
      o(4, '{target} se enteró de todo lo que dijiste. Explotó.', fx.close('target', -18), fx.hap(-3)),
    ] },
  { id: 'blame', label: 'Echarle la culpa', icon: 'ShieldAlert', kinds: ALL, conditions: [c.age(8, 99), c.tAge(6)],
    outcomes: [
      o(5, 'Le echaste la culpa a {target} de algo que hiciste vos. Se lo tragó.', fx.close('target', -5), fx.hap(1)),
      o(4, '{target} sabía la verdad y te la restregó en la cara.', fx.close('target', -11), fx.hap(-3)),
    ] },
  { id: 'ghost', label: 'Ignorar sus mensajes', icon: 'PhoneOff', kinds: PEERS.concat(['partner']), conditions: [c.age(12, 99), c.tAge(10)],
    outcomes: [
      o(6, 'Dejaste a {target} en visto tres días. Le llegó el mensaje.', fx.close('target', -6), fx.hap(0)),
      o(2, '{target} se cansó de esperarte y se lo tomó a pecho.', fx.close('target', -13), fx.hap(-2)),
    ] },
  { id: 'revenge', label: 'Vengarte', icon: 'Swords', kinds: PEERS, conditions: [c.age(12, 99), c.tAge(10), c.tClose(undefined, 10)],
    outcomes: [
      o(4, 'Te vengaste de {target} con una jugada perfecta. Se sintió increíble, un rato.', fx.close('target', -14), fx.hap(3)),
      o(4, 'La venganza contra {target} salió mal y te dejó peor parado/a.', fx.close('target', -12), fx.hap(-4)),
    ] },
  { id: 'reproach', label: 'Reprocharle algo viejo', icon: 'Hourglass', kinds: ALL, conditions: [c.age(10, 99), c.tAge(8)],
    outcomes: [
      o(5, 'Le sacaste en cara a {target} algo de hace diez años. Nadie ganó.', fx.close('target', -8), fx.hap(-2)),
      o(3, '{target} escuchó y admitió que tenías razón. Raro, pero pasó.', fx.close('target', 5), fx.hap(1)),
    ] },
  { id: 'sabotage', label: 'Hacerle una zancadilla', icon: 'Zap', kinds: PEERS, conditions: [c.age(14, 90), c.tAge(12), c.tClose(undefined, 15)],
    outcomes: [
      o(4, 'Le pusiste un palo en la rueda a {target}. Nadie sospechó de vos.', fx.close('target', -10), fx.hap(2)),
      o(4, '{target} descubrió que fuiste vos. Se armó bien grande.', fx.close('target', -20), fx.hap(-4)),
    ] },
  { id: 'threaten', label: 'Amenazarlo/a', icon: 'ShieldAlert', kinds: PEERS, conditions: [c.age(16, 90), c.tAge(14), c.tClose(undefined, -10)],
    outcomes: [
      o(4, '{target} se asustó con tu amenaza y se mantuvo lejos por un tiempo.', fx.close('target', -6), fx.hap(1)),
      o(5, '{target} no se achicó: se rió en tu cara y ahora está más furioso/a.', fx.close('target', -15), fx.hap(-3)),
    ] },
]);

const PLATA = group('plata', [
  { id: 'lend_money', label: 'Prestarle plata', icon: 'Banknote', kinds: ALL, cost: 600, conditions: [c.tClose(20), ...ADULTS],
    outcomes: [
      o(5, '{target} te devolvió la plata en fecha y con un regalito.', fx.close('target', 9), fx.money(700)),
      o(4, '{target} nunca devolvió el préstamo, pero te lo agradeció una vez.', fx.close('target', 3)),
      o(2, '{target} desapareció con tu plata y dejó de contestarte.', fx.close('target', -20), fx.hap(-3)),
    ] },
  { id: 'pay_dinner', label: 'Invitarlo/a a cenar', icon: 'UtensilsCrossed', kinds: ALL, cost: 120, conditions: [c.tClose(10), c.age(12, 99), c.tAge(6)],
    outcomes: [
      o(6, 'La cena con {target} salió redonda. Pagaste feliz.', fx.close('target', 7), fx.hap(2)),
      o(2, '{target} pidió lo más caro del menú. Vaya con {target}.', fx.close('target', 4), fx.hap(-1)),
    ] },
  { id: 'expensive_gift', label: 'Regalarle algo carísimo', icon: 'Gem', kinds: ALL, cost: 900, conditions: [c.tClose(30), ...ADULTS],
    outcomes: [
      o(6, '{target} no podía creer tu regalo. Se le llenaron los ojos de lágrimas.', fx.bond('target', 12, 4), fx.hap(3)),
      o(2, '{target} sospechó que querías algo a cambio y se lo tomó mal.', fx.close('target', -4), fx.hap(-1)),
    ] },
  { id: 'business', label: 'Proponerle un negocio', icon: 'Briefcase', kinds: ['friend', 'sibling', 'father', 'mother', 'child'], cost: 500, conditions: [c.tClose(45), ...ADULTS],
    outcomes: [
      o(4, 'El negocio con {target} despegó. Les entra plata cada mes.', fx.close('target', 8), fx.money(1500), fx.hap(3)),
      o(4, 'El negocio con {target} fue un fracaso. Se quedaron con las deudas.', fx.close('target', -10), fx.hap(-4)),
      o(2, 'El negocio con {target} se hundió, pero la amistad sobrevivió.', fx.close('target', 3), fx.hap(-1)),
    ] },
  { id: 'pay_debt', label: 'Devolverle lo que le debés', icon: 'Receipt', kinds: ALL, cost: 400, conditions: [c.tClose(0), ...ADULTS],
    outcomes: [
      o(7, 'Le devolviste la plata a {target}. Se sorprendió de que te acordaras.', fx.close('target', 10), fx.hap(2)),
      o(2, '{target} ni se acordaba de la deuda. Qué alivio, qué vergüenza.', fx.close('target', 6)),
    ] },
  { id: 'collect_debt', label: 'Cobrarle una deuda', icon: 'Coins', kinds: PEERS.concat(['child']), conditions: [c.tAge(18), c.age(18, 99)],
    outcomes: [
      o(4, '{target} pagó lo que debía, con cara de pocos amigos.', fx.close('target', -4), fx.money(600)),
      o(4, '{target} puso mil excusas y no pagó un peso.', fx.close('target', -8), fx.hap(-2)),
      o(2, '{target} se ofendió tanto que dejó de hablarte, pero pagó.', fx.close('target', -14), fx.money(600)),
    ] },
  { id: 'chip_in', label: 'Hacer una vaquita', icon: 'PiggyBank', kinds: ALL, cost: 100, conditions: [c.tClose(20), c.age(12, 99), c.tAge(8)],
    outcomes: [
      o(6, 'Juntaron la plata entre todos con {target} y salió un festejo espectacular.', fx.close('target', 6), fx.hap(3)),
      o(3, 'Alguien no puso su parte y hubo drama con {target}.', fx.close('target', -3), fx.hap(-1)),
    ] },
  { id: 'job_contact', label: 'Pedirle un contacto laboral', icon: 'Briefcase', kinds: ALL, conditions: [c.tClose(30), ...ADULTS],
    outcomes: [
      o(4, '{target} te pasó un contacto que te consiguió unas changas bien pagas.', fx.close('target', 4), fx.money(900), fx.hap(2)),
      o(4, '{target} prometió ayudarte y nunca hizo nada.', fx.close('target', -4), fx.hap(-1)),
    ] },
  { id: 'sell_stuff', label: 'Vender cosas usadas juntos', icon: 'Store', kinds: ALL, conditions: [c.tClose(20), c.age(14, 99), c.tAge(12)],
    outcomes: [
      o(5, 'Vendieron todo lo que sobraba con {target} y se repartieron la ganancia.', fx.close('target', 5), fx.money(250), fx.hap(1)),
      o(3, 'Nadie compró nada. Terminaron con {target} tomando algo con la plata que no ganaron.', fx.close('target', 3), fx.money(-30)),
    ] },
  { id: 'inheritance_talk', label: 'Hablar de la herencia', icon: 'FileText', kinds: ['mother', 'father', 'sibling'], conditions: [c.tClose(0), ...ADULTS],
    outcomes: [
      o(5, 'Hablaron de la herencia con {target} con calma y todo quedó claro.', fx.close('target', 5)),
      o(3, 'Terminaron peleados por la herencia con {target}. Como en las películas.', fx.close('target', -12), fx.hap(-3)),
    ] },
  { id: 'borrow_car', label: 'Pedirle el auto prestado', icon: 'Car', kinds: ALL, conditions: [c.tClose(35), ...ADULTS],
    outcomes: [
      o(5, '{target} te prestó el auto sin problemas. Lo devolviste con tanque lleno.', fx.close('target', 5), fx.hap(2)),
      o(3, 'Le rayaste el auto a {target}. Silencio de radio por semanas.', fx.close('target', -14), fx.hap(-3), fx.money(-200)),
    ] },
]);

const PAZ = group('paz', [
  { id: 'peace_letter', label: 'Escribirle una carta de disculpas', icon: 'Mail', kinds: ALL, conditions: [c.tClose(undefined, 60), c.tAge(6), c.age(8, 99)],
    outcomes: [
      o(5, '{target} leyó tu carta y te llamó llorando. Hicieron las paces.', fx.close('target', 16), fx.hap(3)),
      o(3, '{target} leyó tu carta y no contestó. Todavía duele, pero te escuchó.', fx.close('target', 5)),
      o(2, '{target} rompió la carta sin leerla.', fx.close('target', -4), fx.hap(-2)),
    ] },
  { id: 'peace_gift', label: 'Llevarle un regalo de paz', icon: 'Gift', kinds: ALL, cost: 100, conditions: [c.tClose(undefined, 40), c.tAge(6), c.age(8, 99)],
    outcomes: [
      o(5, '{target} aceptó tu regalo y bajó la guardia. Es un buen comienzo.', fx.close('target', 12), fx.hap(2)),
      o(4, '{target} devolvió el regalo sin abrirlo. Mensaje recibido.', fx.close('target', -3), fx.hap(-1)),
    ] },
  { id: 'forgive', label: 'Perdonarlo/a', icon: 'HandHeart', kinds: ALL, conditions: [c.tClose(undefined, 30), c.tAge(6), c.age(8, 99)],
    outcomes: [
      o(6, 'Decidiste perdonar a {target}. Sentiste que te sacabas un peso de encima.', fx.close('target', 14), fx.hap(4)),
      o(3, 'Perdonaste a {target}, pero algo se rompió y no vuelve.', fx.close('target', 5), fx.hap(1)),
    ] },
  { id: 'mutual_friend', label: 'Pedirle ayuda a un amigo en común', icon: 'Users', kinds: PEERS.concat(['partner']), conditions: [c.tClose(undefined, 30), c.age(12, 99), c.tAge(10)],
    outcomes: [
      o(5, 'Un amigo en común habló con {target} y logró calmar las aguas.', fx.close('target', 11), fx.hap(2)),
      o(3, 'El amigo en común se metió de más y empeoró todo con {target}.', fx.close('target', -6), fx.hap(-2)),
    ] },
  { id: 'clear_air', label: 'Aclarar un malentendido', icon: 'MessageCircle', kinds: ALL, conditions: [c.tClose(undefined, 50), c.tAge(6), c.age(8, 99)],
    outcomes: [
      o(6, 'Se sentaron a hablar con {target} y descubrieron que todo era un malentendido.', fx.close('target', 13), fx.hap(3)),
      o(3, 'Hablaron con {target} pero cada uno se quedó con su versión.', fx.close('target', 2)),
      o(1, 'La charla con {target} terminó en pelea.', fx.close('target', -8), fx.hap(-3)),
    ] },
  { id: 'give_space', label: 'Darle espacio', icon: 'Hourglass', kinds: ALL, conditions: [c.tClose(undefined, 45), c.tAge(6), c.age(8, 99)],
    outcomes: [
      o(5, 'Le diste espacio a {target}. Con el tiempo, las cosas se calmaron.', fx.close('target', 8), fx.hap(1)),
      o(3, 'Pasó el tiempo y {target} se olvidó de vos.', fx.close('target', -4)),
    ] },
  { id: 'block', label: 'Bloquearlo/a', icon: 'Ban', kinds: PEERS.concat(['partner']), conditions: [c.tClose(undefined, 10), c.age(12, 99), c.tAge(10)],
    outcomes: [
      o(7, 'Bloqueaste a {target} en todos lados. Silencio y paz mental.', fx.close('target', -10), fx.hap(2)),
      o(2, 'Bloqueaste a {target} y se apareció en tu casa. Peor.', fx.close('target', -16), fx.hap(-3)),
    ] },
  { id: 'fresh_start', label: 'Proponer empezar de cero', icon: 'RefreshCcw', kinds: ALL, conditions: [c.tClose(undefined, 30), c.tAge(6), c.age(8, 99)],
    outcomes: [
      o(5, '{target} aceptó empezar de cero. Fue raro, pero se sintió bien.', fx.close('target', 15), fx.hap(3)),
      o(3, '{target} dijo que no se puede empezar de cero con tanto pasado.', fx.close('target', -3), fx.hap(-1)),
    ] },
]);

export const EXTRA_ACTIONS: PersonAction[] = [...AMISTAD, ...HUMOR, ...AMOR, ...PAREJA, ...CONFLICTO, ...PLATA, ...PAZ];
