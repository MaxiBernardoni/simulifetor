import type { GameEvent } from '../../engine/types';
import { c, fx } from '../dsl';

// Eventos de amistad, amor y enemistad con una persona concreta ({target}).
// Mueven las barras de amistad (`close`) y de amor (`love` / `bond`); el amor solo cambia entre adultos.
export const BONDS: GameEvent[] = [
  // ───────── Amistad ─────────
  { id: 'bond.friend_birthday', title: 'Cumpleaños de un amigo', tags: ['rel'], target: 'friend', weight: 8, cooldown: 5,
    conditions: [c.age(12, 90), c.tClose(35)],
    text: '{target} cumple años y armó un festejo. Te invitó a vos primero.',
    choices: [
      { label: 'Ir con un buen regalo', outcomes: [
        { weight: 6, text: '{target} se emocionó con tu regalo. La pasaron increíble.', effects: [fx.money(-100), fx.close('target', 9), fx.hap(3)] },
        { weight: 3, text: 'El regalo fue un fracaso, pero la fiesta salvó la noche.', effects: [fx.money(-100), fx.close('target', 4), fx.hap(1)] },
      ] },
      { label: 'Ir con las manos vacías', outcomes: [
        { weight: 6, text: 'Nadie dijo nada, pero se notó. Te sentiste un poco mezquino/a.', effects: [fx.close('target', 2), fx.hap(1)] },
        { weight: 4, text: '{target} te preguntó por el regalo delante de todos. Qué papelón.', effects: [fx.close('target', -6), fx.hap(-2)] },
      ] },
      { label: 'Faltar sin avisar', outcomes: [{ weight: 1, text: '{target} esperó tu llamada toda la noche. Lo tomó muy a mal.', effects: [fx.close('target', -14), fx.hap(-2)] }] },
    ] },
  { id: 'bond.friend_secret_leak', title: 'Se fue de boca', tags: ['rel'], target: 'friend', weight: 7, cooldown: 6,
    conditions: [c.age(14, 90), c.tClose(30)],
    text: 'Te enterás de que {target} le contó a otra persona algo que le habías confiado.',
    choices: [
      { label: 'Enfrentarlo/a', outcomes: [
        { weight: 5, text: '{target} se disculpó llorando. Fue un error y lo sabe.', effects: [fx.close('target', 6), fx.hap(1)] },
        { weight: 5, text: 'Terminaron a los gritos. {target} dijo cosas que no se pueden borrar.', effects: [fx.close('target', -18), fx.hap(-4)] },
      ] },
      { label: 'Hacerte el/la desentendido/a', outcomes: [{ weight: 1, text: 'Te lo guardaste. Ya nada es igual con {target}, aunque no lo digas.', effects: [fx.close('target', -6), fx.hap(-2)] }] },
      { label: 'Cortar la amistad', outcomes: [{ weight: 1, text: 'Le cerraste la puerta a {target} para siempre. Te sentiste traicionado/a y liberado/a.', effects: [fx.close('target', -45), fx.hap(-3)] }] },
    ] },
  { id: 'bond.friend_crisis', title: 'Un amigo la está pasando mal', tags: ['rel'], target: 'friend', weight: 8, cooldown: 5,
    conditions: [c.age(14, 90), c.tClose(40)],
    text: '{target} está hecho/a pedazos: mala racha, mala plata y peores decisiones. Te necesita.',
    choices: [
      { label: 'Quedarte a su lado toda la noche', outcomes: [
        { weight: 7, text: 'Hablaron hasta el amanecer. {target} nunca se va a olvidar de esa noche.', effects: [fx.close('target', 13), fx.hap(1), fx.hea(-1)] },
        { weight: 2, text: '{target} no quiso hablar, pero agradeció la compañía.', effects: [fx.close('target', 5)] },
      ] },
      { label: 'Mandarle un mensaje de ánimo', outcomes: [{ weight: 1, text: 'Un mensaje lindo. Suficiente para que {target} sepa que existís.', effects: [fx.close('target', 3)] }] },
      { label: 'Dejarlo pasar', outcomes: [{ weight: 1, text: 'No hiciste nada. {target} se acuerda de quién estuvo y quién no.', effects: [fx.close('target', -11), fx.hap(-1)] }] },
    ] },
  { id: 'bond.friend_new_group', title: 'Nuevos amigos', tags: ['rel'], target: 'friend', weight: 6, cooldown: 6,
    conditions: [c.age(14, 60)],
    text: '{target} empezó a juntarse con gente nueva y cada vez responde menos tus mensajes.',
    effects: [fx.close('target', -7), fx.hap(-2)] },
  { id: 'bond.friend_dare', title: 'Una locura entre amigos', tags: ['rel'], target: 'friend', weight: 7, cooldown: 5,
    conditions: [c.age(14, 45), c.tClose(45)],
    text: '{target} te propone algo insensato: "Hacemos esto y lo contamos toda la vida".',
    choices: [
      { label: 'Aceptar', outcomes: [
        { weight: 5, text: 'Salió épico. Es la anécdota que van a contar en todas las reuniones.', effects: [fx.close('target', 10), fx.hap(4)] },
        { weight: 3, text: 'Salió mal, muy mal. Pero se rieron de camino a la guardia.', effects: [fx.close('target', 7), fx.hea(-4), fx.hap(1)] },
      ] },
      { label: 'Rajar a último momento', outcomes: [{ weight: 1, text: '{target} te cargó durante semanas. Un poco de razón tiene.', effects: [fx.close('target', -4), fx.hap(-1)] }] },
    ] },

  // ───────── Amor ─────────
  { id: 'bond.slow_burn', title: 'Una mirada distinta', tags: ['love'], target: 'friend', weight: 8, cooldown: 6,
    conditions: [c.age(18, 75), c.tAge(18), c.tClose(50)],
    text: 'Últimamente {target} te mira distinto. O vos lo/la mirás distinto. Cuesta saberlo.',
    choices: [
      { label: 'Tirar onda', outcomes: [
        { weight: 5, text: '{target} sonrió y te siguió el juego. Algo empezó a cambiar.', effects: [fx.bond('target', 2, 9), fx.hap(3)] },
        { weight: 3, text: '{target} se rió y cambió de tema. Sin drama.', effects: [fx.bond('target', 0, 2)] },
        { weight: 2, text: '{target} se incomodó. Ahora hay un silencio raro entre los dos.', effects: [fx.bond('target', -9, -3), fx.hap(-2)] },
      ] },
      { label: 'Dejarlo pasar', outcomes: [{ weight: 1, text: 'Lo dejaste pasar. Quizás era mejor así, quizás no.', effects: [] }] },
    ] },
  { id: 'bond.lover_jealous', title: 'Celos', tags: ['love'], target: 'friend', weight: 7, cooldown: 6,
    conditions: [c.age(18, 75), c.tAge(18), c.tLove(35)],
    text: '{target} te vio con otra persona y armó una escena de celos en plena calle.',
    choices: [
      { label: 'Explicar que no es lo que parece', outcomes: [
        { weight: 5, text: '{target} te creyó, o al menos fingió creerte. Hubo reconciliación.', effects: [fx.bond('target', 2, 5)] },
        { weight: 5, text: '{target} no compró la excusa. Se fue dando un portazo.', effects: [fx.bond('target', -8, -10), fx.hap(-3)] },
      ] },
      { label: 'Discutir a los gritos', outcomes: [{ weight: 1, text: 'Los gritos se escucharon en toda la cuadra. Ninguno salió bien parado.', effects: [fx.bond('target', -10, -12), fx.hap(-4)] }] },
      { label: 'Hacer como si nada', outcomes: [{ weight: 1, text: 'Te hiciste el/la distraído/a. {target} lo tomó como una confesión.', effects: [fx.bond('target', -4, -8), fx.hap(-2)] }] },
    ] },
  { id: 'bond.partner_anniversary', title: 'Aniversario', tags: ['love'], target: 'partner', weight: 8, cooldown: 5,
    conditions: [c.age(18, 99), c.tClose(20)],
    text: 'Se cumple otro año juntos con {target}. Ya sabés lo que se espera de vos.',
    choices: [
      { label: 'Una cena de lujo', outcomes: [
        { weight: 6, text: 'La cena fue perfecta. {target} lloró un poquito.', effects: [fx.money(-400), fx.bond('target', 5, 10), fx.hap(4)] },
        { weight: 3, text: 'La comida era carísima y horrible, pero la compañía salvó la noche.', effects: [fx.money(-400), fx.bond('target', 2, 4), fx.hap(1)] },
      ] },
      { label: 'Un regalo simple', outcomes: [{ weight: 1, text: '{target} sonrió. Sin fuegos artificiales, pero con cariño.', effects: [fx.money(-60), fx.bond('target', 2, 4), fx.hap(1)] }] },
      { label: 'Olvidarte de la fecha', outcomes: [
        { weight: 6, text: 'Te acordaste a las once de la noche. {target} ya estaba durmiendo, o fingiendo.', effects: [fx.bond('target', -8, -12), fx.hap(-3)] },
        { weight: 4, text: '{target} se olvidó también. Empate técnico.', effects: [fx.bond('target', 0, -1)] },
      ] },
    ] },
  { id: 'bond.partner_stress', title: 'La rutina los está comiendo', tags: ['love'], target: 'partner', weight: 7, cooldown: 6,
    conditions: [c.age(20, 90), c.tClose(15)],
    text: 'Con {target} vienen discutiendo por todo: los platos, la plata, el celular. La chispa se apagó.',
    choices: [
      { label: 'Ir a terapia de pareja', outcomes: [
        { weight: 6, text: 'La terapeuta los ayudó a hablar en vez de gritar. Algo mejoró.', effects: [fx.money(-300), fx.bond('target', 8, 8), fx.hap(2)] },
        { weight: 4, text: 'Fueron dos sesiones y la mitad se la pasaron peleando por quién pagaba.', effects: [fx.money(-300), fx.bond('target', 1, 0)] },
      ] },
      { label: 'Escapada de fin de semana', outcomes: [
        { weight: 6, text: 'Volvieron a reírse juntos. Hacía tiempo que no pasaba.', effects: [fx.money(-500), fx.bond('target', 6, 9), fx.hap(4)] },
        { weight: 4, text: 'Se pelearon en el hotel, en el restaurante y en el viaje de vuelta.', effects: [fx.money(-500), fx.bond('target', -6, -6), fx.hap(-3)] },
      ] },
      { label: 'Dejarlo pasar', outcomes: [{ weight: 1, text: 'Nadie dijo nada. El silencio pesa más que las peleas.', effects: [fx.bond('target', -5, -6), fx.hap(-2)] }] },
    ] },
  { id: 'bond.ex_texts', title: 'Un mensaje de madrugada', tags: ['love'], target: 'ex', weight: 7, cooldown: 6,
    conditions: [c.age(18, 80), c.tAge(18)],
    text: '{target} te escribe a las 3 de la mañana: "¿Estás despierto/a?". Ya sabés cómo termina esto.',
    choices: [
      { label: 'Contestar', outcomes: [
        { weight: 5, text: 'Hablaron horas. Se dijeron cosas que hacía años que no se decían.', effects: [fx.bond('target', 6, 8), fx.hap(2)] },
        { weight: 3, text: '{target} solo quería desahogarse. Te dejó peor que antes.', effects: [fx.bond('target', 1, -2), fx.hap(-3)] },
      ] },
      { label: 'Bloquearlo/a', outcomes: [{ weight: 1, text: 'Lo/a bloqueaste. Dormiste mal, pero con la conciencia limpia.', effects: [fx.bond('target', -15, -15), fx.hap(1)] }] },
      { label: 'Dejarlo en visto', outcomes: [{ weight: 1, text: 'No contestaste. A la mañana ya no había mensajes.', effects: [fx.close('target', -3)] }] },
    ] },

  // ───────── Enemistad ─────────
  { id: 'bond.enemy_rumors', title: 'Chismes', tags: ['rel'], target: 'friend', weight: 9, cooldown: 4,
    conditions: [c.age(14, 90), c.tClose(undefined, -1)],
    text: '{target} anda diciendo cosas horribles de vos. Todos lo saben y nadie te lo dice a la cara.',
    choices: [
      { label: 'Ignorarlo', outcomes: [{ weight: 1, text: 'Hiciste como si nada. Adentro, hervías.', effects: [fx.hap(-2)] }] },
      { label: 'Contraatacar con otro chisme', outcomes: [
        { weight: 5, text: 'Tu chisme fue mejor que el suyo. Por ahora ganaste.', effects: [fx.close('target', -8), fx.hap(2)] },
        { weight: 5, text: 'Se te volvió en contra y quedaste peor parado/a.', effects: [fx.close('target', -15), fx.hap(-4)] },
      ] },
      { label: 'Confrontarlo/a', outcomes: [
        { weight: 4, text: '{target} se avergonzó y admitió que se pasó. Aflojó la tensión.', effects: [fx.close('target', 14), fx.hap(2)] },
        { weight: 6, text: 'Terminaron a los empujones. Todo el mundo miró.', effects: [fx.close('target', -10), fx.hea(-1), fx.hap(-2)] },
      ] },
    ] },
  { id: 'bond.enemy_street', title: 'Cruce incómodo', tags: ['rel'], target: 'friend', weight: 8, cooldown: 4,
    conditions: [c.age(14, 90), c.tClose(undefined, -1)],
    text: 'Te cruzás con {target} en la calle. Se miran con odio y ninguno baja la vista.',
    choices: [
      { label: 'Saludar como si nada', outcomes: [
        { weight: 3, text: '{target} quedó descolocado/a y devolvió el saludo. Algo se aflojó.', effects: [fx.close('target', 12), fx.hap(2)] },
        { weight: 7, text: '{target} te clavó la mirada y siguió de largo. Te dejó un gusto amargo.', effects: [fx.close('target', -2), fx.hap(-1)] },
      ] },
      { label: 'Cruzar de vereda', outcomes: [{ weight: 1, text: 'Cambiaste de vereda. Ganó la cobardía, o la prudencia.', effects: [fx.hap(-1)] }] },
      { label: 'Insultarlo/a', outcomes: [{ weight: 1, text: 'Le dijiste de todo. Te sentiste bien un minuto y mal el resto del día.', effects: [fx.close('target', -10), fx.hap(-2)] }] },
    ] },
  { id: 'bond.enemy_truce', title: 'Una tregua', tags: ['rel'], target: 'friend', weight: 6, cooldown: 6,
    conditions: [c.age(14, 90), c.tClose(undefined, -1)],
    text: '{target} te manda un mensaje: quiere hablar y dejar todo atrás.',
    choices: [
      { label: 'Aceptar la tregua', outcomes: [
        { weight: 6, text: 'Se dijeron todo lo que tenían que decirse. Salieron con la cabeza más liviana.', effects: [fx.close('target', 30), fx.hap(4)] },
        { weight: 4, text: 'Era una trampa: solo quería reírse de vos otra vez.', effects: [fx.close('target', -10), fx.hap(-3)] },
      ] },
      { label: 'Rechazarla', outcomes: [{ weight: 1, text: 'Lo/a dejaste en visto. Algunos rencores se cuidan como plantas.', effects: [fx.close('target', -5), fx.hap(1)] }] },
    ] },
  { id: 'bond.enemy_sabotage', title: 'Zancadilla', tags: ['rel'], target: 'friend', weight: 6, cooldown: 6,
    conditions: [c.age(18, 70), c.tClose(undefined, -1)],
    text: 'Un negocio se te cayó de la nada. Todo apunta a {target}, que casualmente sabía todos los detalles.',
    effects: [fx.moneyPct(-0.04), fx.close('target', -8), fx.hap(-3)] },
  { id: 'bond.sibling_feud', title: 'Enemistad de hermanos', tags: ['family'], target: 'sibling', weight: 7, cooldown: 5,
    conditions: [c.age(14, 90), c.tClose(undefined, -1)],
    text: 'Con {target} vienen sin hablarse hace meses. En la mesa familiar, el aire se puede cortar con un cuchillo.',
    choices: [
      { label: 'Dar el primer paso', outcomes: [
        { weight: 5, text: 'Rompiste el hielo. {target} respondió mejor de lo que esperabas.', effects: [fx.close('target', 18), fx.hap(3)] },
        { weight: 5, text: '{target} te contestó con un portazo verbal. Ni así.', effects: [fx.close('target', -6), fx.hap(-2)] },
      ] },
      { label: 'Esperar a que sea el otro', outcomes: [{ weight: 1, text: 'Pasó otro año de silencio. El orgullo sigue ganando.', effects: [fx.hap(-2)] }] },
    ] },

  // ───────── Infidelidad ─────────
  // Lo dispara el motor (ageUp) cuando la pareja se entera de un amorío: nunca sale solo (flag imposible).
  { id: 'love.cheat_discovered', title: 'Te descubrieron', tags: ['love'], target: 'partner', weight: 1,
    conditions: [c.flag('nunca_al_azar')],
    text: '{target} se enteró de que andás con otra persona. Te esperó despierto/a, con el celular en la mano.',
    choices: [
      { label: 'Negarlo todo', outcomes: [
        { weight: 3, text: '{target} te creyó a medias. Quedó una duda que no se va a ir. {lover} te escribió asustado/a y no contestaste.', effects: [fx.bond('target', -6, -8), fx.bond('lover', -6, -8), fx.hap(-2)] },
        { weight: 7, text: '{target} tenía capturas de pantalla. Fue una escena que nadie olvida, y {lover} se enteró del escándalo y se alejó.', effects: [fx.bond('target', -25, -30), fx.bond('lover', -10, -14), fx.hap(-6)] },
        { weight: 4, conditions: [c.single()], text: '{target} juntó sus cosas y se fue esa misma noche. Se terminó. Al día siguiente {lover} te escribió: "¿Ahora sí?".', effects: [fx.becomes('target', 'ex'), fx.bond('lover', 3, 8), fx.hap(-10)] },
        { weight: 4, conditions: [c.married()], text: '{target} pidió el divorcio con un abogado ya contratado. Salió caro. {lover} apareció con flores, como si nada.', effects: [fx.becomes('target', 'ex'), fx.flag('divorced'), fx.moneyPct(-0.25), fx.bond('lover', 3, 8), fx.hap(-10)] },
      ] },
      { label: 'Pedir perdón de rodillas', outcomes: [
        { weight: 5, text: '{target} lloró, gritó y te perdonó. Con condiciones: cortaste todo contacto con {lover}.', effects: [fx.bond('target', -10, -15), fx.bond('lover', -15, -20), fx.hap(-3)] },
        { weight: 3, text: '{target} te dio una última oportunidad. La palabra es "última". {lover} entendió que elegiste a otra persona.', effects: [fx.bond('target', -18, -20), fx.bond('lover', -12, -18), fx.hap(-4)] },
        { weight: 2, conditions: [c.single()], text: '{target} escuchó todo y aun así se fue. Se terminó. {lover} quedó libre para vos, aunque ya no era lo mismo.', effects: [fx.becomes('target', 'ex'), fx.bond('lover', 2, 6), fx.hap(-9)] },
        { weight: 2, conditions: [c.married()], text: '{target} escuchó todo y aun así pidió el divorcio. {lover} quedó libre para vos, aunque ya no era lo mismo.', effects: [fx.becomes('target', 'ex'), fx.flag('divorced'), fx.moneyPct(-0.25), fx.bond('lover', 2, 6), fx.hap(-9)] },
      ] },
      { label: 'Admitirlo y decir que no es para tanto', outcomes: [
        { weight: 3, text: '{target} te pegó un portazo que hizo temblar las paredes. Todavía no se fue. Terminaste peleado/a también con {lover}.', effects: [fx.bond('target', -30, -35), fx.bond('lover', -8, -10), fx.hap(-5)] },
        { weight: 7, conditions: [c.single()], text: '{target} se rió con amargura y se fue para siempre. Ahora {lover} te quiere todo/a para sí.', effects: [fx.becomes('target', 'ex'), fx.bond('lover', 4, 8), fx.hap(-8)] },
        { weight: 7, conditions: [c.married()], text: '{target} pidió el divorcio y se quedó con la mitad de todo. Ahora {lover} te quiere todo/a para sí.', effects: [fx.becomes('target', 'ex'), fx.flag('divorced'), fx.moneyPct(-0.25), fx.bond('lover', 4, 8), fx.hap(-8)] },
      ] },
    ] },
];
