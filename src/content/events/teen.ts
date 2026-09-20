import type { GameEvent } from '../../engine/types';
import { c, fx } from '../dsl';

export const TEEN: GameEvent[] = [
  { id: 'teen.first_kiss', title: 'Primer beso', tags: ['teen', 'love'], once: true, weight: 18,
    conditions: [c.age(12, 17)],
    text: 'Te diste tu primer beso. Fue torpe, mojado y perfecto.',
    effects: [fx.hap(6)] },
  { id: 'teen.smoke_offer', title: 'Un cigarrillo', tags: ['teen'], weight: 12,
    conditions: [c.age(12, 17)],
    text: 'Unos chicos más grandes te ofrecen un cigarrillo en la esquina de la escuela.',
    choices: [
      { label: 'Probar', outcomes: [
        { weight: 5, text: 'Tosiste hasta ver estrellas. Te sentiste más adulto/a igual.', effects: [fx.hea(-2), fx.hap(2)] },
        { weight: 3, text: 'Te gustó. Ese fue el principio de un hábito caro.', effects: [fx.hea(-3), fx.flag('smoker')] },
      ] },
      { label: 'Rechazar', outcomes: [
        { weight: 1, text: 'Dijiste que no. Te sentiste un poco aburrido/a, pero con la conciencia limpia.', effects: [fx.hap(1)] },
      ] },
    ] },
  { id: 'teen.alcohol_party', title: 'Fiesta en una casa', tags: ['teen'], weight: 14,
    conditions: [c.age(14, 17)],
    text: 'Te invitaron a una fiesta en una casa sin adultos. Hay alcohol por todos lados.',
    choices: [
      { label: 'Ir y tomar', outcomes: [
        { weight: 5, text: 'La pasaste espectacular. Al otro día, el peor dolor de cabeza de tu vida.', effects: [fx.hap(5), fx.hea(-3)] },
        { weight: 3, text: 'Vomitaste sobre el sillón de la dueña de casa. Nunca más te invitaron.', effects: [fx.hap(-4), fx.hea(-3)] },
        { weight: 2, text: 'Te fuiste con alguien de la fiesta. Una historia que no vas a contar.', effects: [fx.hap(5), fx.hea(-2)] },
      ] },
      { label: 'Ir sin tomar', outcomes: [
        { weight: 1, text: 'Fuiste de niñero/a de tus amigos borrachos. Te agradecen (a veces).', effects: [fx.hap(2)] },
      ] },
      { label: 'Quedarte en casa', outcomes: [
        { weight: 1, text: 'Te quedaste viendo series. Al otro día todos hablaban de la fiesta.', effects: [fx.hap(-2)] },
      ] },
    ] },
  { id: 'teen.skip_class', title: 'Hacerse la rata', tags: ['teen', 'school'], weight: 14,
    conditions: [c.age(12, 17), c.enrolled()],
    text: 'Tus amigos te proponen faltar a clase y pasar la mañana en la plaza.',
    choices: [
      { label: 'Faltar', outcomes: [
        { weight: 6, text: 'Pasaste una mañana genial. Nadie se enteró.', effects: [fx.hap(4), fx.gpa(-3)] },
        { weight: 4, text: 'Te vio un vecino y llamó a tus padres. Castigo ejemplar.', effects: [fx.hap(-4), fx.gpa(-5), fx.close('mother', -4)] },
      ] },
      { label: 'Ir a clase', outcomes: [
        { weight: 1, text: 'Fuiste a clase como buen/a alumno/a. Te sentís aburrido/a pero responsable.', effects: [fx.gpa(2), fx.hap(-1)] },
      ] },
    ] },
  { id: 'teen.cheat_exam', title: 'Examen difícil', tags: ['teen', 'school'], weight: 16,
    conditions: [c.age(12, 18), c.enrolled()],
    text: 'Mañana tenés un examen y no estudiaste nada. Un compañero te ofrece una torta.',
    choices: [
      { label: 'Copiarte', outcomes: [
        { weight: 6, text: 'Sacaste un 9. Nadie se enteró.', effects: [fx.gpa(5), fx.sma(-1)] },
        { weight: 4, text: 'Te cazaron. Llamaron a tus padres.', effects: [fx.hap(-8), fx.gpa(-6), fx.flag('cheater')] },
      ] },
      { label: 'Hacerte el enfermo', outcomes: [
        { weight: 1, text: 'Zafaste, por ahora. El examen te espera igual.', effects: [fx.hap(1)] },
      ] },
      { label: 'Estudiar toda la noche', outcomes: [
        { weight: 7, text: 'Estudiaste como loco/a y lo aprobaste. Te sentís un/a genio.', effects: [fx.gpa(6), fx.sma(2), fx.hap(2)] },
        { weight: 3, text: 'Te quedaste dormido/a en el examen.', effects: [fx.gpa(-3), fx.hap(-3)] },
      ] },
    ] },
  { id: 'teen.acne', title: 'Pubertad, esa hermosura', tags: ['teen'], weight: 10, once: true,
    conditions: [c.age(12, 15)],
    text: 'Tu cara decidió convertirse en un campo minado. Ningún espejo te trata bien.',
    effects: [fx.loo(-4), fx.hap(-3)] },
  { id: 'teen.growth_spurt', title: 'Pegaste el estirón', tags: ['teen'], weight: 8, once: true,
    conditions: [c.age(12, 16), c.stat('looks', '>=', 40)],
    text: 'De un día para el otro dejaste de ser el/la más bajo/a. La gente empezó a mirarte distinto.',
    effects: [fx.loo(4), fx.hap(3)] },
  { id: 'teen.first_job', title: 'Primer laburo', tags: ['teen', 'work'], weight: 10, once: true,
    conditions: [c.age(15, 17), c.noJob()],
    text: 'Un conocido de la familia te ofrece un trabajo de medio tiempo los fines de semana.',
    choices: [
      { label: 'Aceptar', outcomes: [
        { weight: 1, text: 'Laburaste todo el verano. Te dolieron los pies, pero juntaste unos pesos.', effects: [fx.money(1800), fx.hap(1), fx.hea(-1)] },
      ] },
      { label: 'Rechazar', outcomes: [
        { weight: 1, text: 'Preferiste dormir hasta el mediodía. Decisión sabia.', effects: [fx.hap(2)] },
      ] },
    ] },
  { id: 'teen.fight', title: 'Pelea en la escuela', tags: ['teen', 'school'], weight: 12,
    conditions: [c.age(12, 17), c.enrolled()],
    text: 'Alguien insultó a un amigo tuyo en el pasillo. Todos miran esperando qué hacés.',
    choices: [
      { label: 'Meterte a pelear', outcomes: [
        { weight: 5, text: 'Ganaste la pelea. Te suspendieron un día, pero saliste como leyenda.', effects: [fx.hap(3), fx.hea(-3), fx.gpa(-3)] },
        { weight: 5, text: 'Perdiste feo. Ojo morado, orgullo herido y suspensión.', effects: [fx.hap(-5), fx.hea(-6), fx.loo(-2), fx.gpa(-3)] },
      ] },
      { label: 'Calmar las cosas', outcomes: [
        { weight: 7, text: 'Lograste que todo quedara en un intercambio de insultos.', effects: [fx.hap(2), fx.sma(1)] },
        { weight: 3, text: 'Te trataron de cobarde por semanas.', effects: [fx.hap(-3)] },
      ] },
    ] },
  { id: 'teen.parents_divorce', title: 'Divorcio de tus padres', tags: ['teen', 'family'], weight: 8, once: true,
    conditions: [c.age(9, 17), c.has('mother'), c.has('father')],
    text: 'Tus padres te sentaron en el living y te dijeron que se separan. "No es tu culpa". Claro que no.',
    effects: [fx.hap(-9), fx.close('father', -10), fx.flag('parents_divorced')] },
  { id: 'teen.first_love', title: 'Un flechazo', tags: ['teen', 'love'], weight: 16,
    conditions: [c.age(14, 17), c.hasNot('partner')],
    text: 'Te gusta alguien de tu curso. Te late el corazón cada vez que lo/a ves.',
    choices: [
      { label: 'Declararte', outcomes: [
        { weight: 5, text: '¡Le gustaste también! Empezaron a salir.', effects: [fx.add('partner'), fx.hap(10)] },
        { weight: 5, text: 'Te dijo que solo eran amigos. Lloraste una semana.', effects: [fx.hap(-8)] },
      ] },
      { label: 'Guardarlo en secreto', outcomes: [
        { weight: 1, text: 'Nunca dijiste nada. Se puso de novio/a con otra persona.', effects: [fx.hap(-4)] },
      ] },
    ] },
  { id: 'teen.tattoo_fake_id', title: 'Un tatuaje a escondidas', tags: ['teen'], weight: 6, once: true,
    conditions: [c.age(16, 17), c.noFlag('tattoo')],
    text: 'Un amigo conoce a un tatuador que no pregunta la edad. Tenés la plata justa.',
    choices: [
      { label: 'Hacértelo', outcomes: [
        { weight: 5, text: 'Te hiciste un tatuaje que va a ser un dolor de cabeza en 10 años.', effects: [fx.hap(4), fx.money(-400), fx.flag('tattoo')] },
        { weight: 3, text: 'Se infectó. Además tus padres se enteraron.', effects: [fx.hea(-5), fx.hap(-5), fx.money(-400), fx.flag('tattoo')] },
      ] },
      { label: 'No', outcomes: [{ weight: 1, text: 'Te ahorraste una anécdota y la plata.', effects: [] }] },
    ] },
  { id: 'teen.social_media', title: 'Adicto/a a las redes', tags: ['teen', 'tech'], weight: 14,
    conditions: [c.age(12, 17), c.year(2008, 2200)],
    text: 'Pasás más horas en el celular que durmiendo. Tu autoestima depende de los likes.',
    effects: [fx.hap(-4), fx.sma(-1)] },
  { id: 'teen.friend_betray', title: 'Traición', tags: ['teen'], weight: 10,
    conditions: [c.age(12, 18), c.has('friend')],
    text: 'Tu mejor amigo/a le contó a todo el mundo un secreto tuyo.',
    effects: [fx.hap(-7), fx.close('friend', -30)] },
  { id: 'teen.new_friend', title: 'Una amistad', tags: ['teen'], weight: 14,
    conditions: [c.age(12, 17)],
    text: 'Conociste a alguien en un recital. Se hicieron amigos enseguida.',
    effects: [fx.add('friend', 'peer'), fx.hap(4)] },
  { id: 'teen.driving', title: 'Registro de conducir', tags: ['teen'], weight: 20, once: true,
    conditions: [c.age(17, 18)],
    text: 'Aprobaste el examen de manejo a la primera. Tu instructor se persignó al bajarse.',
    effects: [fx.hap(4), fx.flag('driver')] },
  { id: 'teen.gang', title: 'Una banda', tags: ['teen', 'crime'], weight: 8, once: true,
    conditions: [c.age(13, 17)],
    text: 'Unos pibes del barrio te invitan a su grupo. Dicen que "se cuidan entre todos". Y que hay negocios.',
    choices: [
      { label: 'Unirte', outcomes: [
        { weight: 5, text: 'Ahora tenés respeto en la calle. También te metieron en problemas.', effects: [fx.hap(3), fx.money(600), fx.flag('gang')] },
        { weight: 3, text: 'Una noche todo salió mal y te dieron una golpiza.', effects: [fx.hap(-6), fx.hea(-9), fx.flag('gang')] },
      ] },
      { label: 'Decir que no', outcomes: [{ weight: 1, text: 'Te miraron mal, pero te dejaron tranquilo/a.', effects: [fx.hap(-1)] }] },
    ] },
  { id: 'teen.expelled', title: 'Amenaza de expulsión', tags: ['teen', 'school'], weight: 6,
    conditions: [c.age(14, 17), c.enrolled(), { flag: 'cheater' }],
    text: 'Con tu historial de trampas, el director te llamó a su oficina.',
    choices: [
      { label: 'Prometer que cambiás', outcomes: [
        { weight: 6, text: 'Te dieron una última oportunidad. Más te vale.', effects: [fx.hap(-2)] },
        { weight: 4, text: 'No te creyó. Te echaron de la escuela.', effects: [fx.flag('dropout'), fx.hap(-8)] },
      ] },
      { label: 'Mandarlo a cagar', outcomes: [
        { weight: 1, text: 'Te fuiste de la escuela dando un portazo. Tus padres no están contentos.', effects: [fx.flag('dropout'), fx.hap(-2), fx.close('mother', -8)] },
      ] },
    ] },
  { id: 'teen.dropout_offer', title: '¿Seguir estudiando?', tags: ['teen', 'school'], weight: 6, once: true,
    conditions: [c.age(15, 17), c.enrolled(), c.stat('happiness', '<=', 40)],
    text: 'Estás harto/a de la escuela. Un amigo te dice que dejes todo y arranques a laburar.',
    choices: [
      { label: 'Dejar la escuela', outcomes: [
        { weight: 1, text: 'Dejaste la secundaria. La libertad se siente increíble... por ahora.', effects: [fx.flag('dropout'), fx.hap(4)] },
      ] },
      { label: 'Seguir', outcomes: [{ weight: 1, text: 'Aguantaste. Te sentís resignado/a, pero orgulloso/a.', effects: [fx.hap(1)] }] },
    ] },
];
