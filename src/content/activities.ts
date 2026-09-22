import type { Activity } from '../engine/types';
import { c, fx } from './dsl';

export const ACTIVITIES: Activity[] = [
  // ── Salud ──
  {
    id: 'gym', label: 'Ir al gimnasio', desc: 'Cuota anual: $500', icon: 'Dumbbell', category: 'salud', cost: 500,
    conditions: [c.age(14, 90)],
    outcomes: [
      { weight: 7, text: 'Entrenaste todo el año. Te sentís (y te ves) mejor.', effects: [fx.hea(4), fx.loo(3), fx.hap(2)] },
      { weight: 2, text: 'Fuiste tres veces en enero y después la cuota quedó de decoración.', effects: [fx.hea(1)] },
      { weight: 1, text: 'Te lesionaste levantando de más. Pura vanidad.', effects: [fx.hea(-5), fx.hap(-2)] },
    ],
  },
  {
    id: 'doctor', label: 'Ir al médico', desc: 'Consulta y estudios: $400', icon: 'Stethoscope', category: 'salud', cost: 400,
    outcomes: [
      { weight: 7, text: 'El médico te revisó de arriba abajo. Todo en orden, más o menos.', effects: [fx.hea(5)] },
      { weight: 2, text: 'Te dieron un tratamiento que funcionó de maravillas.', effects: [fx.hea(9), fx.hap(2)] },
      { weight: 1, text: 'Te dijo que tenés que dejar de googlear tus síntomas.', effects: [fx.hea(2), fx.hap(1)] },
    ],
  },
  {
    id: 'therapy', label: 'Terapia', desc: 'Sesiones: $800', icon: 'Brain', category: 'salud', cost: 800,
    conditions: [c.age(10, 95)],
    outcomes: [
      { weight: 6, text: 'Terapia todo el año. Descubriste que la culpa de todo la tiene tu mamá.', effects: [fx.hap(7)] },
      { weight: 3, text: 'Lloraste bastante, pero saliste más liviano.', effects: [fx.hap(5), fx.hea(1)] },
      { weight: 1, text: 'Tu terapeuta se pasó el año hablando de sí mismo.', effects: [fx.hap(-1)] },
    ],
  },
  {
    id: 'meditate', label: 'Meditar', desc: 'Gratis y aburrido', icon: 'Flower2', category: 'salud',
    conditions: [c.age(12, 99)],
    outcomes: [
      { weight: 5, text: 'Cerraste los ojos. Respiraste. Se te ocurrió lo que ibas a cenar.', effects: [fx.hap(3), fx.hea(1)] },
      { weight: 2, text: 'Lograste paz interior durante casi dos minutos.', effects: [fx.hap(5)] },
    ],
  },
  {
    id: 'cosmetic', label: 'Cirugía estética', desc: 'Costo: $8.000', icon: 'Sparkles', category: 'salud', cost: 8000,
    conditions: [c.age(18, 80)],
    outcomes: [
      { weight: 7, text: 'Salió bien. Te ves como recién salido/a de un filtro.', effects: [fx.loo(9), fx.hap(3)] },
      { weight: 2, text: 'Quedó… raro. La sonrisa no se apaga nunca.', effects: [fx.loo(-6), fx.hap(-6)] },
      { weight: 1, text: 'El cirujano se equivocó de paciente. Salvaste la vida de milagro.', effects: [fx.hea(-15), fx.loo(-4), fx.hap(-8)] },
    ],
  },
  // ── Ocio ──
  {
    id: 'party', label: 'Salir de fiesta', desc: 'Noche de excesos', icon: 'PartyPopper', category: 'ocio', cost: 200,
    conditions: [c.age(16, 70)],
    outcomes: [
      { weight: 5, text: 'Una noche legendaria. No recordás la mitad, pero sabés que estuvo buenísima.', effects: [fx.hap(6), fx.hea(-2)] },
      { weight: 2, text: 'Terminaste bailando arriba de una mesa. Hay video.', effects: [fx.hap(4), fx.hea(-1), fx.loo(-1)] },
      { weight: 2, text: 'Te fuiste temprano y te sentiste viejo/a.', effects: [fx.hap(-1)] },
      { weight: 1, text: 'Te despertaste en un lugar que no conocías, sin celular ni billetera.', effects: [fx.hap(-5), fx.money(-300), fx.hea(-2)] },
    ],
  },
  {
    id: 'drink', label: 'Salir a tomar', desc: 'Unas copas', icon: 'Beer', category: 'ocio', cost: 100,
    conditions: [c.age(18, 90)],
    outcomes: [
      { weight: 6, text: 'Unas copas con amigos. Se resolvió el mundo… otra vez.', effects: [fx.hap(4), fx.hea(-2)] },
      { weight: 2, text: 'Pasaste de "unas copas" a "no me acuerdo". Resaca de tres días.', effects: [fx.hap(1), fx.hea(-4), fx.flag('drinker')] },
      { weight: 1, text: 'Te peleaste con alguien en la puerta del bar.', effects: [fx.hap(-2), fx.hea(-4), fx.loo(-2)] },
    ],
  },
  {
    id: 'drugs', label: 'Probar drogas', desc: 'Mala idea, buena historia', icon: 'Pill', category: 'ocio', cost: 300,
    conditions: [c.age(18, 70)],
    outcomes: [
      { weight: 4, text: 'Fue una experiencia… interesante. Viste colores nuevos.', effects: [fx.hap(8), fx.hea(-6)] },
      { weight: 3, text: 'Te pegó mal. Pasaste la noche en la guardia.', effects: [fx.hap(-6), fx.hea(-10), fx.money(-800)] },
      { weight: 2, text: 'Te gustó demasiado. Ahora lo necesitás.', effects: [fx.hap(3), fx.hea(-6), fx.flag('substance')] },
      { weight: 1, text: 'Nada. Te reíste de todo un rato. Qué desperdicio de plata.', effects: [fx.hap(2)] },
    ],
  },
  {
    id: 'hookup', label: 'Buscar una aventura', desc: 'Sin compromiso', icon: 'Flame', category: 'social', cost: 100,
    conditions: [c.age(18, 75)],
    outcomes: [
      { weight: 5, text: 'Conociste a alguien. Fue una noche memorable y una mañana incómoda.', effects: [fx.hap(6), fx.loo(1), fx.suspect(15)] },
      { weight: 3, text: 'Rechazo tras rechazo. Pagaste tres tragos para nada.', effects: [fx.hap(-3), fx.money(-100)] },
      { weight: 1, text: 'Resultó que tu aventura tenía un regalito: una infección.', effects: [fx.hap(-2), fx.hea(-8), fx.money(-400)] },
      { weight: 1, text: 'La aventura se convirtió en algo más serio.', effects: [fx.hap(5), fx.add('partner')] },
    ],
  },
  {
    id: 'travel', label: 'Viajar', desc: 'Costo: $3.000', icon: 'Plane', category: 'ocio', cost: 3000,
    conditions: [c.age(16, 90)],
    outcomes: [
      { weight: 6, text: 'Viajaste, comiste raro, sacaste 400 fotos que nunca vas a mirar. Valió la pena.', effects: [fx.hap(9), fx.sma(1)] },
      { weight: 2, text: 'Te robaron el pasaporte en el primer día. Igual la pasaste bien.', effects: [fx.hap(2), fx.money(-800)] },
      { weight: 1, text: 'Intoxicación alimentaria. Conociste los baños de tres países.', effects: [fx.hap(-2), fx.hea(-6)] },
    ],
  },
  {
    id: 'casino', label: 'Ir al casino', desc: 'Apuesta: $500', icon: 'Dices', category: 'ocio', cost: 500,
    conditions: [c.age(18, 95)],
    outcomes: [
      { weight: 55, text: 'La casa siempre gana. Perdiste todo lo que apostaste.', effects: [fx.hap(-3)] },
      { weight: 30, text: 'Recuperaste tu plata y algo más.', effects: [fx.money(700), fx.hap(3)] },
      { weight: 13, text: 'Buena racha. Te llevaste un buen premio.', effects: [fx.money(2500), fx.hap(7)] },
      { weight: 2, text: '¡JACKPOT! No lo podés creer.', effects: [fx.money(25000), fx.hap(15)] },
    ],
  },
  {
    id: 'read', label: 'Leer libros', desc: 'Gratis, casi', icon: 'BookOpen', category: 'estudio',
    conditions: [c.age(6, 99)],
    outcomes: [
      { weight: 6, text: 'Te devoraste varios libros. Te sentís más inteligente (aunque insoportable).', effects: [fx.sma(3), fx.hap(1)] },
      { weight: 2, text: 'Leíste el mismo capítulo siete veces sin retener nada.', effects: [fx.sma(1)] },
    ],
  },
  {
    id: 'study', label: 'Estudiar más', desc: 'Mejor rendimiento escolar', icon: 'GraduationCap', category: 'estudio',
    conditions: [c.enrolled()],
    outcomes: [
      { weight: 6, text: 'Le pusiste ganas y se nota en las notas.', effects: [fx.gpa(10), fx.sma(2), fx.hap(-1)] },
      { weight: 3, text: 'Estudiaste toda la noche. Al día siguiente no recordabas nada.', effects: [fx.gpa(4), fx.hea(-1)] },
    ],
  },
  {
    id: 'tattoo', label: 'Hacerte un tatuaje', desc: 'Costo: $400', icon: 'PenTool', category: 'social', cost: 400,
    conditions: [c.age(18, 80), c.noFlag('tattoo')],
    outcomes: [
      { weight: 6, text: 'Te tatuaste algo que "significa mucho para vos". Ya veremos en 10 años.', effects: [fx.hap(4), fx.loo(2), fx.flag('tattoo')] },
      { weight: 2, text: 'Quedó torcido. Igual lo vas a llevar con orgullo.', effects: [fx.hap(1), fx.loo(-1), fx.flag('tattoo')] },
    ],
  },
  // ── Social ──
  {
    id: 'make_friends', label: 'Hacer amigos', desc: 'Salí y conocé gente', icon: 'Users', category: 'social',
    conditions: [c.age(5, 95)],
    outcomes: [
      { weight: 7, text: 'Conociste a alguien copado. Ya es tu amigo/a.', effects: [fx.add('friend'), fx.hap(3)] },
      { weight: 3, text: 'Nadie te prestó atención. La soledad pega fuerte.', effects: [fx.hap(-2)] },
    ],
  },
  {
    id: 'find_partner', label: 'Buscar pareja', desc: 'Apps, amigos, destino', icon: 'Heart', category: 'social',
    conditions: [c.age(16, 90), c.hasNot('partner')],
    outcomes: [
      { weight: 4, text: 'Conociste a alguien con quien hay química. Empezaron a salir.', effects: [fx.add('partner'), fx.hap(6)] },
      { weight: 5, text: 'Salidas incómodas y mensajes sin respuesta. Otro año de solteros.', effects: [fx.hap(-3)] },
      { weight: 1, text: 'La persona resultó ser un/a estafador/a. Te sacó plata.', effects: [fx.hap(-6), fx.money(-1500)] },
    ],
  },
  {
    id: 'adopt_pet', label: 'Adoptar una mascota', desc: 'Costo: $200', icon: 'PawPrint', category: 'social', cost: 200,
    conditions: [c.age(8, 99), c.noFlag('pet')],
    outcomes: [
      { weight: 1, text: 'Adoptaste una mascota. Ahora es la persona más importante de tu vida.', effects: [fx.hap(9), fx.flag('pet')] },
    ],
  },
  // ── Dinero / trabajo ──
  {
    id: 'odd_jobs', label: 'Hacer changas', desc: 'Trabajos informales', icon: 'Hammer', category: 'dinero',
    conditions: [c.age(14, 70)],
    outcomes: [
      { weight: 6, text: 'Juntaste unos pesos con changas.', effects: [fx.money(2800), fx.hea(-1)] },
      { weight: 3, text: 'Te pagaron una miseria por muchísimo laburo.', effects: [fx.money(900), fx.hap(-2), fx.hea(-1)] },
      { weight: 1, text: 'Un cliente muy generoso te dejó una buena propina.', effects: [fx.money(6000), fx.hap(3)] },
    ],
  },
  {
    id: 'work_hard', label: 'Trabajar duro', desc: 'Mejora tu rendimiento', icon: 'Briefcase', category: 'trabajo',
    conditions: [c.job()],
    outcomes: [
      { weight: 7, text: 'Te rompiste el lomo todo el año. Tu jefe {boss} lo notó.', effects: [fx.perf(12), fx.hap(-2), fx.hea(-1)] },
      { weight: 3, text: 'Hiciste horas extra. Tus compañeros te odian un poco.', effects: [fx.perf(8), fx.hap(-3)] },
    ],
  },
  {
    id: 'ask_raise', label: 'Pedir aumento', desc: 'Arriesgado', icon: 'TrendingUp', category: 'trabajo',
    conditions: [c.job()],
    outcomes: [
      { weight: 4, text: '{boss} aceptó darte un aumento.', effects: [fx.raise(1.12), fx.hap(4)] },
      { weight: 5, text: '{boss} te dijo que "no es el momento". Nunca es el momento.', effects: [fx.hap(-2)] },
      { weight: 1, text: '{boss} se ofendió tanto que te despidió.', effects: [fx.fired(), fx.hap(-8)] },
    ],
  },
  // ── Crimen ──
  {
    id: 'shoplift', label: 'Robar en un local', desc: 'Delito menor', icon: 'ShoppingBag', category: 'crimen',
    conditions: [c.age(10, 90)],
    outcomes: [
      { weight: 7, text: 'Te llevaste algo y nadie te vio. Lo vendiste después.', effects: [fx.money(500), fx.hap(2)] },
      { weight: 3, text: 'Te agarró el guardia. Llamaron a la policía, pero zafaste con una advertencia.', effects: [fx.hap(-5), fx.flag('shoplifted')] },
      { weight: 1, text: 'Te detuvieron y te dieron un año de prisión.', effects: [fx.hap(-8), fx.arrest('robo en un local', 1, 2)] },
    ],
  },
  {
    id: 'robbery', label: 'Robar a alguien', desc: 'Delito grave', icon: 'Skull', category: 'crimen',
    conditions: [c.age(16, 70)],
    outcomes: [
      { weight: 6, text: 'El golpe salió bien. Sacaste un buen botín.', effects: [fx.money(5500), fx.hap(3), fx.flag('thief')] },
      { weight: 2, text: 'La víctima se resistió. Te fuiste con las manos vacías.', effects: [fx.hap(-4), fx.hea(-4)] },
      { weight: 4, text: 'Te atrapó la policía y te llevaron detenido.', effects: [fx.hap(-10), fx.arrest('robo a mano armada', 2, 6)] },
    ],
  },
  {
    id: 'scam', label: 'Armar una estafa', desc: 'Requiere ingenio', icon: 'VenetianMask', category: 'crimen',
    conditions: [c.age(18, 80), c.stat('smarts', '>=', 45)],
    outcomes: [
      { weight: 6, text: 'La estafa funcionó a la perfección. Nadie sospecha nada.', effects: [fx.money(12000), fx.hap(4), fx.flag('scammer')] },
      { weight: 2, text: 'Se te cayó la estafa. Perdiste plata pero nadie te vinculó.', effects: [fx.money(-1000), fx.hap(-4)] },
      { weight: 3, text: 'Te descubrieron. Te imputan por fraude.', effects: [fx.hap(-10), fx.arrest('fraude', 2, 7)] },
    ],
  },
  {
    id: 'sell_drugs', label: 'Vender drogas', desc: 'Negocio de alto riesgo', icon: 'Package', category: 'crimen',
    conditions: [c.age(16, 60)],
    outcomes: [
      { weight: 6, text: 'Un año de buen negocio en la esquina correcta.', effects: [fx.money(8000), fx.hap(2), fx.flag('dealer')] },
      { weight: 2, text: 'Un rival te asaltó la mercadería y te dejó bastante golpeado.', effects: [fx.money(-2000), fx.hea(-10), fx.hap(-6)] },
      { weight: 3, text: 'Redada. Te encontraron con la mercadería.', effects: [fx.hap(-10), fx.arrest('narcotráfico', 2, 9)], conditions: [c.noLaw('drogas_blandas_legales')] },
      { weight: 3, text: 'Te multaron por vender sin habilitación. La ley cambió, pero la burocracia no.', effects: [fx.hap(-4), fx.money(-1500)], conditions: [c.law('drogas_blandas_legales')] },
    ],
  },
  {
    id: 'street_fight', label: 'Buscar pelea', desc: 'Violencia callejera', icon: 'Swords', category: 'crimen',
    conditions: [c.age(13, 60)],
    outcomes: [
      { weight: 5, text: 'Ganaste la pelea. Nadie se atreve a mirarte feo.', effects: [fx.hap(3), fx.hea(-4)] },
      { weight: 4, text: 'Te dieron una paliza.', effects: [fx.hap(-5), fx.hea(-10), fx.loo(-3)] },
      { weight: 1, text: 'Alguien llamó a la policía. Te detuvieron por lesiones.', effects: [fx.hap(-6), fx.arrest('lesiones', 1, 3)] },
    ],
  },
  {
    id: 'vandalism', label: 'Hacer destrozos', desc: 'Vandalismo', icon: 'Hammer', category: 'crimen',
    conditions: [c.age(12, 60)],
    outcomes: [
      { weight: 7, text: 'Rompiste unas cuantas cosas y te fuiste corriendo. Adrenalina pura.', effects: [fx.hap(4)] },
      { weight: 3, text: 'Una cámara de seguridad te grabó. Te detuvieron.', effects: [fx.hap(-5), fx.arrest('daños y vandalismo', 1, 2)] },
    ],
  },
  {
    id: 'hacking', label: 'Hackear cuentas', desc: 'Requiere inteligencia', icon: 'Brain', category: 'crimen',
    conditions: [c.age(15, 70), c.stat('smarts', '>=', 60), c.year(1995, 2300)],
    outcomes: [
      { weight: 6, text: 'Entraste a un sistema y desviaste plata sin dejar rastro.', effects: [fx.money(9000), fx.hap(4), fx.flag('hacker')] },
      { weight: 2, text: 'El sistema tenía buena seguridad. No sacaste nada.', effects: [fx.hap(-2)] },
      { weight: 2, text: 'Te rastrearon la IP. La policía golpeó tu puerta.', effects: [fx.hap(-10), fx.arrest('delito informático', 2, 6)] },
    ],
  },
  {
    id: 'bank_robbery', label: 'Asaltar un banco', desc: 'Todo o nada', icon: 'Landmark', category: 'crimen',
    conditions: [c.age(18, 60), c.flag('thief')],
    outcomes: [
      { weight: 3, text: 'El golpe del siglo. Salieron con las bolsas llenas y sin un rasguño.', effects: [fx.money(45000), fx.hap(10), fx.flag('bank_robber')] },
      { weight: 3, text: 'Se complicó: hubo tiros y saliste con las manos vacías.', effects: [fx.hea(-10), fx.hap(-6)] },
      { weight: 5, text: 'La policía los estaba esperando.', effects: [fx.hap(-12), fx.arrest('robo a un banco', 8, 20)] },
    ],
  },
  {
    id: 'murder', label: 'Matar a alguien', desc: 'El peor camino', icon: 'Skull', category: 'crimen',
    conditions: [c.age(16, 80)],
    outcomes: [
      { weight: 3, text: 'Lo hiciste. Nadie sabe. Vas a cargar con eso el resto de tu vida.', effects: [fx.hap(-25), fx.flag('murderer')] },
      { weight: 7, text: 'Te atraparon. Es el crimen más grave que existe.', effects: [fx.hap(-20), fx.flag('murderer'), fx.arrest('homicidio', 15, 30)] },
    ],
  },
  // ── Prisión ──
  {
    id: 'jail_work', label: 'Trabajar en la cárcel', desc: 'Prisión', icon: 'Hammer', category: 'dinero', inJail: true,
    outcomes: [
      { weight: 1, text: 'Pasaste el año en el taller de la prisión. Ganás unos pesos y buena conducta.', effects: [fx.money(700), fx.hap(1)] },
    ],
  },
  {
    id: 'jail_escape', label: 'Intentar escapar', desc: 'Prisión · muy arriesgado', icon: 'Zap', category: 'crimen', inJail: true,
    outcomes: [
      { weight: 1, text: 'Lo lograste. Te escapaste de la cárcel. Ahora sos prófugo.', effects: [fx.parole(99), fx.flag('fugitive'), fx.hap(6)] },
      { weight: 5, text: 'Te agarraron en el intento. Te agregaron años y te pusieron en aislamiento.', effects: [fx.hap(-10), fx.hea(-6), fx.jail(2, 5)] },
    ],
  },
  {
    id: 'jail_gym', label: 'Entrenar en el patio', desc: 'Prisión', icon: 'Dumbbell', category: 'salud', inJail: true,
    outcomes: [
      { weight: 1, text: 'Pasaste el año levantando pesas hechas con tachos. Estás en forma.', effects: [fx.hea(4), fx.hap(2)] },
    ],
  },
  {
    id: 'jail_read', label: 'Leer en la biblioteca', desc: 'Prisión', icon: 'BookOpen', category: 'estudio', inJail: true,
    outcomes: [
      { weight: 1, text: 'Leíste toda la biblioteca de la cárcel. Es más grande de lo que pensabas.', effects: [fx.sma(4), fx.hap(1)] },
    ],
  },
  {
    id: 'jail_riot', label: 'Provocar un motín', desc: 'Prisión', icon: 'Flame', category: 'crimen', inJail: true,
    outcomes: [
      { weight: 3, text: 'El motín se te fue de las manos. Te agregaron años a la condena.', effects: [fx.hap(-4), fx.hea(-8), fx.jail(1, 3)] },
      { weight: 2, text: 'Ganaste respeto entre los presos. Nadie se mete con vos.', effects: [fx.hap(4), fx.hea(-3)] },
    ],
  },
  // ── Según la época ──
  {
    id: 'tv_binge', label: 'Ver televisión', desc: 'El gran invento del siglo', icon: 'Clapperboard', category: 'ocio', tech: 'tv',
    conditions: [c.age(5, 99)],
    outcomes: [
      { weight: 5, text: 'Te pasaste el año frente a la tele. Sabés todos los jingles de memoria.', effects: [fx.hap(3), fx.hea(-1)] },
      { weight: 2, text: 'Una telenovela te tuvo llorando meses. Vale cada capítulo.', effects: [fx.hap(5)] },
    ],
  },
  {
    id: 'videogames', label: 'Videojuegos', desc: 'Una partida más y me voy a dormir', icon: 'Gamepad2', category: 'ocio', tech: 'computadora',
    conditions: [c.age(6, 70)],
    outcomes: [
      { weight: 5, text: 'Jugaste hasta las 4 de la mañana durante meses. Tu récord personal es lo único que creció.', effects: [fx.hap(5), fx.hea(-2)] },
      { weight: 2, text: 'Te volviste bueno de verdad. Un desconocido en línea te llama "leyenda".', effects: [fx.hap(6), fx.sma(1)] },
      { weight: 1, text: 'Te obsesionaste con un juego y perdiste el año entero. Ni te acordás de cómo fue.', effects: [fx.hap(-2), fx.hea(-3)] },
    ],
  },
  {
    id: 'socials', label: 'Vivir en redes sociales', desc: 'Scrolleo infinito', icon: 'Smartphone', category: 'social', tech: 'redes',
    conditions: [c.age(11, 85)],
    outcomes: [
      { weight: 4, text: 'Compartiste tu vida con desconocidos. Te dieron 200 "me gusta" y ninguna solución.', effects: [fx.hap(2)] },
      { weight: 3, text: 'Una discusión política te dejó sin dormir y sin dos amigos.', effects: [fx.hap(-5)] },
      { weight: 2, text: 'Un posteo tuyo se volvió viral. Tu cuarto de hora empezó y terminó en el mismo fin de semana.', effects: [fx.hap(6), fx.money(400)] },
      { weight: 1, text: 'Te comparaste con todo el mundo durante meses. Salís hecho pomada.', effects: [fx.hap(-7), fx.loo(-1)] },
    ],
  },
  {
    id: 'stream_series', label: 'Maratonear series', desc: 'Suscripción: $150', icon: 'Clapperboard', category: 'ocio', cost: 150, tech: 'streaming',
    conditions: [c.age(8, 99)],
    outcomes: [
      { weight: 5, text: 'Terminaste cuarenta series. Recordás una.', effects: [fx.hap(4), fx.hea(-1)] },
      { weight: 2, text: 'Te spoilearon el final de la mejor serie del año. Nunca lo perdonás.', effects: [fx.hap(-2)] },
    ],
  },
  {
    id: 'app_dating', label: 'Citas por app', desc: 'Deslizá a la derecha', icon: 'Heart', category: 'social', tech: 'smartphone',
    conditions: [c.age(18, 75), c.single()],
    outcomes: [
      { weight: 4, text: 'Tuviste seis citas: cuatro fueron un desastre, una un fantasma, una un milagro.', effects: [fx.hap(3), fx.add('partner', 'peer')] },
      { weight: 4, text: 'Te dejaron en visto todo el año. Igual tu autoestima sobrevive.', effects: [fx.hap(-3)] },
      { weight: 1, text: 'Te estafaron con una cita falsa. Perdiste plata y orgullo.', effects: [fx.money(-500), fx.hap(-5)] },
    ],
  },
  {
    id: 'chat_ai', label: 'Charlar con una IA', desc: 'Siempre tiene una respuesta', icon: 'Zap', category: 'estudio', tech: 'ia',
    conditions: [c.age(10, 99)],
    outcomes: [
      { weight: 5, text: 'Le preguntaste de todo. Aprendiste bastante y dejaste de pensar bastante también.', effects: [fx.sma(3), fx.hap(1)] },
      { weight: 2, text: 'Te pasaste el año hablándole. Es la relación más estable que tuviste.', effects: [fx.hap(3)] },
      { weight: 1, text: 'Te inventó un dato y lo repetiste con seguridad en una reunión. Duele todavía.', effects: [fx.hap(-4)] },
    ],
  },
  {
    id: 'vr_world', label: 'Mundos de realidad virtual', desc: 'Suscripción: $300', icon: 'Rocket', category: 'ocio', cost: 300, tech: 'realidad_virtual',
    conditions: [c.age(8, 99)],
    outcomes: [
      { weight: 5, text: 'Viviste medio año en un mundo virtual. Allá sos alguien.', effects: [fx.hap(6), fx.hea(-2)] },
      { weight: 2, text: 'Te mareaste y te fuiste contra la pared del living. El casco sobrevivió.', effects: [fx.hea(-3), fx.hap(1)] },
    ],
  },
];
