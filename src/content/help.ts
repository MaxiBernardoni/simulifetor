import type { Life } from '../engine/types';

// Textos de ayuda: cortos, en voseo y con humor seco.

export interface CoachStep {
  /** Id del `CoachTarget` que se resalta en la pantalla de vida. */
  target: string;
  icon: string;
  text: string;
}

/** Guía de la primera vida (globos sobre la pantalla principal). */
export const COACH_STEPS: CoachStep[] = [
  { target: 'info', icon: 'Sparkles', text: '¡Empezó tu nueva vida! Acá ves quién sos, qué hacés y cuánta plata tenés en el banco.' },
  { target: 'age', icon: 'ChevronsRight', text: 'Tocá Envejecer para pasar un año a la vez. Cada tanto vas a tener que decidir algo.' },
  { target: 'stats', icon: 'HeartPulse', text: 'Felicidad, salud, inteligencia y aspecto. Si la salud llega a cero, se acabó el juego.' },
  { target: 'nav', icon: 'LayoutGrid', text: 'Desde acá trabajás, manejás la plata, mirás a tu gente y hacés actividades (una vez por año cada una).' },
  { target: 'menu', icon: 'Menu', text: 'En el menú tenés tus partidas, el árbol genealógico, la ayuda y los logros. Buena suerte.' },
];

export interface HelpSection {
  id: string;
  title: string;
  icon: string;
  body: string[];
}

export const HELP: HelpSection[] = [
  {
    id: 'stats',
    title: 'Stats y qué los mueve',
    icon: 'HeartPulse',
    body: [
      'Felicidad (0–100): sube con amigos, pareja, logros y diversión; baja con deudas, duelos y malas noticias. Por debajo de 20 todo se pone feo.',
      'Salud: sube con gimnasio y médico, baja con vicios, accidentes y la edad. Con la salud en 0 morís.',
      'Inteligencia: sube estudiando y leyendo. Abre carreras y ascensos.',
      'Aspecto: influye en el amor y en algunos trabajos. Con los años, pierde valor. Qué injusto.',
      'Bandas: 0–25 crítico · 26–50 flojo · 51–75 bien · 76–100 excelente. Las salud y felicidad extremas cambian los eventos que te tocan.',
    ],
  },
  {
    id: 'age',
    title: 'Envejecer',
    icon: 'Cake',
    body: ['Cada toque a "Envejecer" avanza un año: cobrás, pagás gastos, aparecen eventos y el mundo sigue.', 'Si tenés una decisión pendiente, primero resolvela.'],
  },
  {
    id: 'act',
    title: 'Actividades y personas',
    icon: 'LayoutGrid',
    body: ['Una vez por año por actividad. Algunas cuestan plata y algunas son ilegales.', 'En Relaciones elegís a alguien y hacés algo con esa persona. Tu pareja, tus hijos y tus amigos cuentan.'],
  },
  {
    id: 'work',
    title: 'Trabajo y estudio',
    icon: 'BriefcaseBusiness',
    body: ['Buscá trabajo una vez por año y aceptá una oferta. Si rendís bien, te ascienden.', 'La universidad tarda años y cuesta plata, pero abre las mejores carreras.', 'A los 65 te jubilás con una pensión.'],
  },
  {
    id: 'money',
    title: 'Dinero, bienes y deudas',
    icon: 'Banknote',
    body: ['Podés comprar casa y auto (contado o financiado con el 20 % de entrada), pedir préstamos e invertir.', 'Las deudas crecen 8 % por año: no las dejes. Si te hundís demasiado, quebrás y perdés todo.', 'Los precios y sueldos dependen de la época en que vivís.'],
  },
  {
    id: 'crime',
    title: 'Crimen y justicia',
    icon: 'Gavel',
    body: ['Algunos delitos dan plata rápida. También dan juicio, abogado (o no), condena y antecedentes.', 'Tener antecedentes te cierra trabajos. En la cárcel el tiempo pasa pero no trabajás ni estudiás.'],
  },
  {
    id: 'scen',
    title: 'Escenarios',
    icon: 'Target',
    body: ['Desafíos con un objetivo y un tiempo límite: ganar plata, ser famoso, sobrevivir. Se eligen al crear una vida.', 'No podés cambiar de personaje mientras un escenario está en curso.'],
  },
  {
    id: 'slots',
    title: 'Partidas y copia de seguridad',
    icon: 'Library',
    body: ['Tenés 3 ranuras de partida. En Menú → Copia de seguridad exportás todo a un texto y lo importás donde quieras.', 'Hacé una copia de vez en cuando: si desinstalás la app, se pierde todo.'],
  },
  {
    id: 'tree',
    title: 'Árbol y cambio de personaje',
    icon: 'Users',
    body: ['Tu familia vive aunque no la juegues. Podés vivir la vida de un pariente de sangre a hasta 2 generaciones (padres, abuelos, hermanos, hijos, nietos, tíos, sobrinos, primos).', 'Entre un cambio y otro hay que esperar años, y hay un tope por generación. Cuando tu personaje muere, elegís con quién seguir.'],
  },
  {
    id: 'ach',
    title: 'Logros',
    icon: 'Trophy',
    body: ['Se desbloquean solos al hacer cosas. Están en el Menú.'],
  },
];

export const GLOSSARY: { term: string; def: string }[] = [
  { term: 'Patrimonio neto', def: 'Lo que tenés (plata, bienes, inversiones) menos lo que debés.' },
  { term: 'Legado', def: 'Puntaje de tu vida: años vividos, patrimonio, hijos, logros y reputación.' },
  { term: 'Antecedentes', def: 'Registro de condenas. Te cierra trabajos y pesa en los juicios.' },
  { term: 'Libertad condicional', def: 'Salís antes de cumplir toda la pena, pero cualquier problema te devuelve adentro.' },
  { term: 'Prófugo', def: 'Escapaste de la justicia. Vivís con miedo y sin poder trabajar tranquilo.' },
  { term: 'Quiebra', def: 'Deudas impagables: te embargan los bienes y arrancás de nuevo con deuda chica.' },
  { term: 'Pariente de sangre', def: 'Familia con la que compartís antepasados. Solo a ellos podés jugar.' },
  { term: 'Familia política', def: 'Parejas y su familia. Aparecen en el árbol, pero no se juegan.' },
];

// ── Consejos para la pantalla de muerte ──

export interface Tip {
  id: string;
  text: string;
  /** Devuelve true si el jugador ya probó eso (entonces el consejo no se muestra). */
  done: (life: Life, achievements: string[]) => boolean;
}

const BACKUP_TIP: Tip = { id: 'backup', text: 'Hacé una copia de seguridad de vez en cuando (Menú → Copia de seguridad).', done: () => false };

export const TIPS: Tip[] = [
  { id: 'house', text: 'Probá comprar una casa financiada: el alquiler se come el sueldo.', done: (l) => l.log.some((e) => e.title === 'Compra') || l.assets.length > 0 },
  { id: 'invest', text: 'Invertir tiene riesgo, pero la plata quieta pierde contra la inflación.', done: (l) => l.invested > 0 || l.log.some((e) => e.title === 'Inversiones') },
  { id: 'univ', text: 'Estudiar en la universidad abre las carreras que mejor pagan.', done: (l) => l.edu.level >= 3 },
  { id: 'love', text: 'Probá casarte y tener hijos: la familia es la mitad del juego.', done: (l) => l.people.some((p) => p.kind === 'child') },
  { id: 'tree', text: 'Mirá el árbol genealógico: seguro tenés un pariente al que podés jugar.', done: (l) => (l.generation ?? 1) > 1 },
  { id: 'crime', text: 'Alguna vez probá el lado oscuro. Solo por ver qué pasa. Después no digas que no te avisamos.', done: (l) => !!l.flags.criminal_record || !!l.flags.ex_convict },
  { id: 'scenario', text: 'Los escenarios son desafíos con objetivo: elegilos al crear una vida.', done: (l) => !!l.scenario },
];

/** Elige un consejo sobre algo que el jugador todavía no probó (determinístico con `pick` de 0 a 1). */
export function tipFor(life: Life, achievements: string[], pick = Math.random()): Tip {
  const pending = TIPS.filter((t) => !t.done(life, achievements));
  if (!pending.length) return BACKUP_TIP;
  return pending[Math.min(pending.length - 1, Math.floor(pick * pending.length))];
}
