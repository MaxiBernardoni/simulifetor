import type { Cond, Effect, GameEvent, Choice } from '../../engine/types';
import { c, fx } from '../dsl';

// ── Eventos históricos por época (país y mundo genéricos, sin nombres reales) ──
// Se disparan una sola vez cuando el personaje vive el rango de años. Los efectos "de todos"
// usan porcentajes moderados sobre el dinero (la inflación ya está en las eras: content/eras.ts).

const H = (
  id: string,
  title: string,
  from: number,
  to: number,
  text: string,
  effects: Effect[],
  extra: { cond?: Cond[]; choices?: Choice[]; age?: [number, number] } = {},
): GameEvent => ({
  id: `hist.${id}`,
  title,
  tags: ['historical'],
  weight: 1000,
  once: true,
  conditions: [c.year(from, to), ...(extra.age ? [c.age(extra.age[0], extra.age[1])] : []), ...(extra.cond ?? [])],
  text,
  ...(extra.choices ? { choices: extra.choices } : { effects }),
});

export const HISTORY: GameEvent[] = [
  // ── Años 50 y 60 ──
  H('guerra_frontera', 'Guerra en la frontera', 1951, 1954, 'Estalló una guerra en la frontera. Los diarios hablan de héroes; las radios, de listas de ausentes.', [fx.hap(-4), fx.moneyPct(-0.03)]),
  H('tv_llega', 'Llega la televisión', 1953, 1957, 'En tu barrio aparece el primer televisor. Medio pueblo se junta a mirar una pantalla del tamaño de una ventana chica.', [fx.hap(3), fx.sma(-1)], { cond: [c.tech('tv')] }),
  H('boom_posguerra', 'Boom de posguerra', 1957, 1960, 'La economía crece como nunca. Hay trabajo, hay heladeras y hay optimismo. Nadie sospecha lo que viene.', [fx.moneyPct(0.05), fx.hap(3)]),
  H('rock_nace', 'Nace el rock', 1960, 1965, 'Un ritmo nuevo enloquece a los jóvenes y espanta a sus padres. Tu casa se divide en dos bandos.', [fx.hap(4), fx.close('mother', -2)], { age: [10, 35] }),
  H('carrera_espacial', 'Carrera espacial', 1961, 1963, 'Dos potencias compiten por llegar al espacio. En la escuela todos quieren ser astronautas, aunque no sepan sumar.', [fx.sma(2), fx.hap(2)], { age: [4, 60] }),
  H('terremoto_1964', 'Gran terremoto', 1964, 1965, 'Un terremoto destruyó media ciudad. Vos perdiste cosas, pero conservaste lo importante.', [fx.hap(-5), fx.money(-600), fx.hea(-2)]),
  H('juventud_rebelde', 'Juventud en las calles', 1967, 1969, 'Estudiantes de todo el mundo salen a protestar. Tu generación quiere cambiarlo todo y hasta prepara los carteles.', [], {
    age: [15, 35],
    choices: [
      { label: 'Sumarte a las marchas', outcomes: [
        { weight: 6, text: 'Marchaste, cantaste, te enamoraste de alguien que odia lo mismo que vos. Fue el mejor año de tu vida.', effects: [fx.hap(8), fx.hea(-1)] },
        { weight: 3, text: 'La policía cargó contra la multitud. Terminaste con un ojo morado y una historia para siempre.', effects: [fx.hap(2), fx.hea(-6)] },
        { weight: 1, text: 'Te detuvieron una noche. Quedó anotado en tu legajo.', effects: [fx.hap(-3), fx.flag('criminal_record')] },
      ] },
      { label: 'Quedarte en casa', outcomes: [{ weight: 1, text: 'Te quedaste estudiando. Alguna vez vas a contar que "no era lo tuyo".', effects: [fx.sma(2), fx.hap(-1)] }] },
    ],
  }),
  H('hombre_luna', 'El hombre llega a la Luna', 1969, 1969, 'Medio planeta mira por televisión a un señor caminando sobre la Luna. Por un rato, todo parece posible.', [fx.hap(4), fx.sma(1)]),

  // ── Años 70 ──
  H('reforma_divorcio', 'Se aprueba el divorcio', 1972, 1973, 'Una nueva ley permite divorciarse. Los que estaban atrapados en casamientos tristes empiezan a hacer cuentas.', [fx.hap(1)], { age: [18, 90] }),
  H('crisis_petroleo', 'Crisis del petróleo', 1973, 1975, 'El precio del combustible se disparó. Hay colas en las estaciones y los aumentos llegan más rápido que los sueldos.', [fx.moneyPct(-0.08), fx.hap(-3)]),
  H('mundial_78', 'Mundial de fútbol', 1978, 1978, 'Tu país está en el mundial. Por un mes se olvida todo: la inflación, los problemas, el vecino.', [fx.hap(6)]),
  H('disco', 'Fiebre de la disco', 1977, 1980, 'Salir a bailar con camisa abierta y pantalones acampanados es ahora un deber cívico.', [fx.hap(3), fx.loo(1)], { age: [15, 45] }),

  // ── Años 80 ──
  H('pc_llega', 'Llegan las computadoras personales', 1983, 1986, 'Aparecen las computadoras en casas y oficinas. Nadie sabe bien para qué sirven, pero todos quieren una.', [fx.sma(2), fx.hap(1)], { cond: [c.tech('computadora')] }),
  H('epidemia_86', 'Epidemia desconocida', 1985, 1987, 'Un virus nuevo asusta al mundo. Los rumores circulan más rápido que la información.', [fx.hea(-3), fx.hap(-3)]),
  H('accidente_industrial', 'Accidente industrial', 1986, 1986, 'Una explosión en una planta química cubre la región de humo. Hay evacuaciones, miedo y explicaciones poco claras.', [fx.hap(-3), fx.hea(-3)]),
  H('fin_guerra_fria', 'Se cae el muro', 1989, 1991, 'Se derrumba el muro que dividía dos bloques del mundo. Todos festejan; muy pocos entienden qué sigue.', [fx.hap(4)]),

  // ── Años 90 ──
  H('privatizaciones', 'Privatizaciones', 1991, 1993, 'El gobierno vende las empresas públicas. Muchos se quedan sin trabajo, algunos se hacen ricos.', [], {
    cond: [c.job(), c.age(25, 62)],
    choices: [
      { label: 'Aceptar el retiro voluntario', outcomes: [
        { weight: 6, text: 'Te dieron una indemnización decente. La gastaste en un kiosco que funcionó a medias.', effects: [fx.money(9000), fx.fired(), fx.hap(-2)] },
        { weight: 4, text: 'Te dieron mucho menos de lo prometido y te quedaste sin trabajo.', effects: [fx.money(3000), fx.fired(), fx.hap(-6)] },
      ] },
      { label: 'Quedarte y aguantar', outcomes: [
        { weight: 6, text: 'Sobreviviste al recorte. Tu sueldo no.', effects: [fx.raise(0.9), fx.hap(-3)] },
        { weight: 3, text: 'Te dejaron a cargo de un sector nuevo con el mismo sueldo.', effects: [fx.hap(-2), fx.perf(6)] },
      ] },
    ],
  }),
  H('celular_llega', 'Los primeros celulares', 1994, 1997, 'Un señor en el semáforo habla por un teléfono sin cable. Al año, todos tienen uno y nadie sabe apagarlo.', [fx.hap(2)], { cond: [c.tech('celular')] }),
  H('reforma_jubilatoria_90', 'Reforma jubilatoria', 1996, 1997, 'Cambian las reglas de la jubilación. Los que están cerca de retirarse hacen cuentas con cara de velorio.', [fx.moneyPct(-0.03), fx.hap(-3)], { age: [45, 90] }),
  H('burbuja_puntocom', 'Fiebre de las puntocom', 1999, 2000, 'Cualquier empresa con "punto com" en el nombre vale millones, aunque no venda nada. Un amigo te ofrece invertir.', [], {
    cond: [c.age(20, 70), c.moneyGte(1500)],
    choices: [
      { label: 'Invertir en la "nueva economía"', outcomes: [
        { weight: 4, text: 'Vendiste justo antes de la caída. Sos un genio, o tuviste suerte. Igual da lo mismo.', effects: [fx.money(6000), fx.hap(5)] },
        { weight: 6, text: 'Te quedaste con acciones de una empresa que vendía mascotas por internet. Ya no existe.', effects: [fx.moneyPct(-0.3), fx.hap(-6)] },
      ] },
      { label: 'Desconfiar', outcomes: [{ weight: 1, text: 'No entendías nada, así que no invertiste. Fue tu mejor decisión financiera.', effects: [fx.hap(1)] }] },
    ],
  }),
  H('efecto_2000', 'El fin del mundo digital', 2000, 2000, 'Se suponía que a la medianoche fallarían todas las computadoras del planeta. No pasó nada, salvo una fiesta.', [fx.hap(2)]),

  // ── Años 2000 ──
  H('burbuja_inmobiliaria', 'Boom inmobiliario', 2005, 2007, 'Los precios de las casas suben cada mes. Todos se sienten ricos, sobre todo los que ya tenían una.', [fx.moneyPct(0.06), fx.hap(3)], { cond: [c.asset('house')] }),
  H('redes_explotan', 'Explotan las redes sociales', 2006, 2009, 'Todo el mundo se abre un perfil. En un año sabés lo que almorzó cada persona que conociste.', [fx.hap(2), fx.close('friend', 2)], { age: [12, 55], cond: [c.tech('redes')] }),
  H('crisis_subprime', 'Estalla la burbuja', 2009, 2010, 'La burbuja financiera explotó. Bancos que parecían eternos se cayeron y con ellos, los ahorros de mucha gente.', [fx.moneyPct(-0.08), fx.hap(-4)]),
  H('gripe_global', 'Gripe global', 2009, 2010, 'Una gripe nueva se extendió por el mundo. Lavado de manos, barbijos y colegios cerrados por una semana.', [fx.hea(-4), fx.hap(-2)]),

  // ── Años 2010 ──
  H('mundial_2010', 'Mundial de fútbol', 2010, 2011, 'Otro mundial. Te descubrís gritando por un equipo del que no conocés a nadie.', [fx.hap(5)]),
  H('marchas_2011', 'Ola de protestas', 2011, 2012, 'Plazas llenas de gente indignada. Nadie está de acuerdo en qué exigir, pero todos están de acuerdo en exigir.', [fx.hap(-2)]),
  H('streaming_llega', 'Llega el streaming', 2013, 2015, 'Cancelás la televisión por cable y te suscribís a tres plataformas. Pagás más y no encontrás nada para ver.', [fx.money(-100), fx.hap(2)], { cond: [c.tech('streaming')] }),
  H('mundial_2014', 'Mundial de fútbol', 2014, 2014, 'Cuatro años después, el mismo delirio: banderas en los balcones y jefes que te dejan salir antes.', [fx.hap(4)]),
  H('boom_cripto', 'Fiebre cripto', 2017, 2018, 'Un primo te explica cómo hacerte millonario con monedas que no existen físicamente. Suena a estafa. Suena a oportunidad.', [], {
    cond: [c.age(18, 70), c.moneyGte(1500)],
    choices: [
      { label: 'Comprar unas monedas', outcomes: [
        { weight: 3, text: 'Compraste en el momento justo y vendiste en el pico. Ahora sos experto.', effects: [fx.moneyPct(0.25), fx.hap(6)] },
        { weight: 7, text: 'Compraste caro, vendiste barato. Ahora sos un experto en la palabra "corrección".', effects: [fx.moneyPct(-0.12), fx.hap(-4)] },
      ] },
      { label: 'No pasa nada', outcomes: [{ weight: 1, text: 'Ignoraste el asunto. En la cena familiar todos te lo van a recordar igual.', effects: [fx.hap(-1)] }] },
    ],
  }),
  H('movimientos_2018', 'Movimientos sociales', 2018, 2019, 'Marchas enormes por derechos y contra la injusticia. Cada uno saca sus propias conclusiones y las publica en las redes.', [fx.hap(2)], { cond: [c.tech('redes')] }),

  // ── Años 2020 ──
  H('trabajo_remoto', 'Se instala el trabajo remoto', 2021, 2022, 'Tu jefe descubre que podés trabajar en pantuflas. Vos descubrís que tu casa es más chica de lo que pensabas.', [fx.hap(3), fx.money(200)], { cond: [c.job()] }),
  H('inflacion_2022', 'Inflación mundial', 2022, 2023, 'Los precios suben en todo el mundo a la vez. La comida, el alquiler, hasta el café que no era caro.', [fx.moneyPct(-0.06), fx.hap(-3)]),
  H('guerra_regional', 'Guerra regional', 2022, 2023, 'Una guerra lejana golpea los precios de la energía. Las noticias se vuelven insoportables y necesarias.', [fx.hap(-3), fx.moneyPct(-0.03)]),
  H('ia_despidos', 'La IA llegó a la oficina', 2024, 2026, 'Tu empresa "optimiza procesos con inteligencia artificial", que en criollo significa que alguien va a quedar sin silla.', [], {
    cond: [c.job(), c.age(22, 62), c.tech('ia')],
    choices: [
      { label: 'Aprender a usarla', outcomes: [
        { weight: 6, text: 'Te volviste el que "sabe de IA". Te subieron el sueldo y las expectativas.', effects: [fx.raise(1.1), fx.perf(8), fx.sma(2)] },
        { weight: 3, text: 'Aprendiste, pero igual te reemplazó una herramienta con tu mismo nombre de usuario.', effects: [fx.fired(), fx.hap(-6)] },
      ] },
      { label: 'Ignorarla', outcomes: [
        { weight: 5, text: 'Todo siguió igual hasta que alguien más barato hizo lo tuyo.', effects: [fx.perf(-10), fx.hap(-3)] },
        { weight: 4, text: 'Nadie notó tu resistencia. Sos un residuo analógico y a la vez un sobreviviente.', effects: [fx.hap(1)] },
      ] },
    ],
  }),
  H('ola_calor', 'Verano récord', 2024, 2027, 'La temperatura pasa los 45 grados durante semanas. Hay cortes de luz y una discusión eterna sobre el aire acondicionado.', [fx.hea(-3), fx.hap(-2), fx.money(-200)]),

  // ── Futuro (especulativo) ──
  H('crisis_climatica', 'Crisis climática', 2031, 2034, 'Inundaciones y sequías se alternan cada año. Los seguros dejaron de cubrir casi todo.', [fx.moneyPct(-0.05), fx.hap(-3)]),
  H('paz_global', 'Tratado de paz global', 2035, 2037, 'Las grandes potencias firman un tratado que promete décadas de calma. Por primera vez en años, las noticias no dan miedo.', [fx.hap(5)]),
  H('vr_masiva', 'La realidad virtual se vuelve masiva', 2036, 2039, 'Todos tienen un casco. Hay reuniones, bodas y velorios virtuales. Tu mundo real tiene menos gente.', [fx.hap(2), fx.close('friend', -2)], { cond: [c.tech('realidad_virtual')] }),
  H('colonia_lunar', 'Primera colonia lunar', 2038, 2040, 'Las primeras personas viven de forma permanente en la Luna. Vos seguís sin poder pagar el alquiler en la Tierra.', [fx.hap(2), fx.sma(1)]),
  H('autos_autonomos', 'Los autos se manejan solos', 2041, 2043, 'Los vehículos autónomos reemplazan a casi todos los choferes. El tránsito mejora; los conductores, no tanto.', [], {
    cond: [c.sector('transporte'), c.job(), c.tech('autos_autonomos')],
    choices: [
      { label: 'Reconvertirte', outcomes: [
        { weight: 6, text: 'Te capacitaste en mantenimiento de flotas. Volvés a tener trabajo y a sentirte útil.', effects: [fx.money(-500), fx.perf(6), fx.hap(1)] },
        { weight: 4, text: 'El curso era una estafa. Perdiste plata y tiempo.', effects: [fx.money(-800), fx.hap(-4)] },
      ] },
      { label: 'Resistir con los taxis', outcomes: [{ weight: 1, text: 'Hiciste un piquete de cuatro horas. Lo levantaron con un sándwich.', effects: [fx.fired(), fx.hap(-5)] }] },
    ],
  }),
  H('semana_4_dias', 'Semana laboral de cuatro días', 2041, 2044, 'Una ley reduce la jornada laboral. Tu jefe amenaza con descontarte "la actitud".', [fx.hap(5), fx.perf(3)], { cond: [c.job(), c.law('jornada_reducida')] }),
  H('crisis_energetica', 'Crisis energética', 2050, 2052, 'La energía barata se acabó. Racionamientos, filas y un mercado negro de baterías.', [fx.moneyPct(-0.07), fx.hap(-4)]),
  H('reforma_jubilatoria_50', 'Reforma jubilatoria', 2055, 2057, 'Se sube la edad jubilatoria y se recorta el haber. Los mayores marchan con carteles hechos a mano.', [fx.moneyPct(-0.04), fx.hap(-3)], { age: [45, 95] }),
  H('longevidad', 'La terapia de longevidad', 2066, 2069, 'Una terapia génica frena el envejecimiento… para quien pueda pagarla. Vos llegaste a una versión reducida.', [fx.hea(6), fx.hap(3), fx.money(-800)], { age: [40, 99], cond: [c.tech('longevidad')] }),
  H('senal_espacio', 'Una señal del espacio', 2076, 2078, 'Un observatorio recibe una señal repetitiva desde otra estrella. Nadie sabe qué significa; todos tienen una teoría.', [fx.hap(2), fx.sma(1)]),
  H('apagon_digital', 'Apagón digital global', 2086, 2088, 'Durante una semana falla todo lo conectado. Descubrís que no sabés el teléfono de nadie de memoria.', [fx.hap(-3), fx.money(-400)]),
  H('nueva_moneda', 'Cambio de moneda', 2093, 2094, 'Reemplazan la moneda por otra "más moderna". Los precios te siguen pareciendo un chiste, pero con menos ceros.', [fx.moneyPct(-0.02), fx.hap(-1)]),
];

// ── Ley de época: servicio militar ──
export const HISTORY_LAWS: GameEvent[] = [
  { id: 'law.conscripcion', title: 'Sorteo del servicio militar', tags: ['random'], weight: 14, once: true,
    conditions: [c.age(18, 19), c.law('servicio_militar')],
    text: 'Te llegó la citación para el sorteo del servicio militar. Te toca un número.',
    choices: [
      { label: 'Cumplir', outcomes: [
        { weight: 6, text: 'Un año de obediencia, guardias y comida imposible. Salís más disciplinado y con ganas de no ver una fila nunca más.', effects: [fx.hea(3), fx.hap(-3), fx.perf(3)] },
        { weight: 3, text: 'Te tocó una unidad dura. Volviste más callado, más fuerte y con una historia que no vas a contar.', effects: [fx.hea(-2), fx.hap(-6), fx.sma(1)] },
      ] },
      { label: 'Conseguir una excepción', outcomes: [
        { weight: 6, text: 'Un certificado médico "casualmente" oportuno te salvó. Le debés un favor a alguien.', effects: [fx.money(-400), fx.hap(2)] },
        { weight: 3, text: 'El certificado era trucho. Te descubrieron y te hicieron cumplir igual, con mala fama.', effects: [fx.hap(-6), fx.money(-300)] },
      ] },
    ] },
];
