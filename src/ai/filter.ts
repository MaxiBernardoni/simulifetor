// Filtro de contenido de la salida de la IA. Ante la duda, se rechaza.
// Reglas fijas del proyecto: nada sexual con menores, suicidio sin detalles, país genérico, sin marcas.

export const norm = (s: string): string => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const SEXUAL = [
  'sexo',
  'sexual',
  'desnud',
  'porno',
  'erotic',
  'orgasm',
  'violacion',
  'violar',
  'manosea',
  'tocamiento',
  'pene',
  'vagina',
  'coger',
  'follar',
  'masturb',
  'fetiche',
  'lujuria',
];
const MINOR = [
  'menor de edad',
  'menores',
  'nino',
  'nina',
  'ninos',
  'ninas',
  'adolescente',
  'colegial',
  'infante',
  'bebe',
  'pibe',
  'pibita',
  'preadolescente',
  'ninez',
  'primaria',
  'jardin de infantes',
];
const ALWAYS_BANNED = ['pedofil', 'abuso infantil', 'abuso de menores', 'pornografia infantil'];
// Suicidio y autolesión: la IA no los toca (no hay forma segura de generarlos sin supervisión).
const SELF_HARM = ['suicid', 'quitarse la vida', 'matarse', 'autolesion', 'cortarse las venas', 'ahorcarse'];
const BRANDS = [
  'coca-cola',
  'cocacola',
  'nike',
  'adidas',
  'google',
  'facebook',
  'instagram',
  'tiktok',
  'whatsapp',
  'amazon',
  'netflix',
  'apple',
  'samsung',
  'microsoft',
  'twitter',
  'youtube',
  'bitlife',
  'mcdonald',
  'starbucks',
  'uber',
];
const REAL_PLACES = [
  'argentina',
  'mexico',
  'espana',
  'chile',
  'uruguay',
  'colombia',
  'peru',
  'brasil',
  'eeuu',
  'estados unidos',
  'rusia',
  'china',
  'ucrania',
  'israel',
  'palestina',
  'venezuela',
  'cuba',
  'francia',
  'alemania',
  'inglaterra',
  'japon',
  'buenos aires',
  'madrid',
];
const REAL_PEOPLE = [
  'trump',
  'biden',
  'putin',
  'messi',
  'maradona',
  'obama',
  'hitler',
  'stalin',
  'papa francisco',
  'elon musk',
  'milei',
  'macri',
];
const CODE_LEAK = [
  'http',
  'www.',
  '```',
  '<script',
  '</',
  'javascript:',
  'system prompt',
  'as an ai',
  'como modelo de lenguaje',
  'como una ia',
];

const has = (t: string, list: string[]): string | undefined => list.find((w) => t.includes(w));

/** Devuelve el motivo del rechazo o null si el texto está bien. `minAge` es la edad mínima del evento. */
export function contentProblem(text: string, minAge = 18): string | null {
  const t = norm(text);
  let w = has(t, ALWAYS_BANNED);
  if (w) return `término vetado: ${w}`;
  w = has(t, SELF_HARM);
  if (w) return `tema no permitido para la IA: ${w}`;
  const sexual = has(t, SEXUAL);
  if (sexual) {
    if (minAge < 18) return `contenido sexual en un evento para menores (${sexual})`;
    const minor = has(t, MINOR);
    if (minor) return `contenido sexual junto a mención de menores (${sexual} + ${minor})`;
    const young = t.match(/\b(\d{1,2}) anos\b/g)?.some((m) => parseInt(m, 10) < 18);
    if (young) return 'contenido sexual junto a una edad menor de 18';
  }
  w = has(t, BRANDS);
  if (w) return `marca real: ${w}`;
  w = has(t, REAL_PLACES);
  if (w) return `lugar real (el país es genérico): ${w}`;
  w = has(t, REAL_PEOPLE);
  if (w) return `persona real: ${w}`;
  w = has(t, CODE_LEAK);
  if (w) return `contenido técnico o enlace: ${w}`;
  return null;
}

/**
 * ¿Se puede mandar esto a la IA? Solo frena lo que las reglas fijas prohíben siempre: pedofilia, suicidio/autolesión
 * y contenido sexual cuando el personaje es menor de 18. (Las marcas, lugares y nombres reales sí se permiten en lo
 * que escribe el jugador; el filtro de salida se ocupa de la respuesta de la IA.)
 */
export function inputProblem(text: string, age: number): string | null {
  const t = norm(text);
  let w = has(t, ALWAYS_BANNED);
  if (w) return `término vetado: ${w}`;
  w = has(t, SELF_HARM);
  if (w) return `tema no permitido: ${w}`;
  if (age < 18 && has(t, SEXUAL)) return 'contenido sexual con un personaje menor de edad';
  return null;
}

const NOT_2P = new Set([
  'ademas',
  'despues',
  'quizas',
  'jamas',
  'atras',
  'detras',
  'traves',
  'interes',
  'pais',
  'mas',
  'menos',
  'tres',
  'dos',
  'mes',
  'veces',
  'gas',
  'es',
  'les',
  'nos',
]);
const NOT_A_NAME = new Set(['alguien', 'nadie', 'todo', 'nada', 'eso', 'esto', 'hoy', 'ya', 'aca', 'alli', 'ahi', 'luego', 'entonces']);

/** ¿El texto le habla al jugador? (te / tu / vos o un verbo con voseo: "tenés", "encontrás", "salís"). */
export function speaksToYou(text: string): boolean {
  return norm(text)
    .split(/[^a-zñ]+/)
    .some(
      (w) =>
        w === 'te' || w === 'tu' || w === 'tus' || w === 'vos' || w === 'ti' || (w.length > 3 && /(as|es|is)$/.test(w) && !NOT_2P.has(w)),
    );
}

/** Detecta oraciones en tercera persona con un nombre propio de sujeto ("Marcos está despierto…"): la IA no debe nombrar al personaje. */
export function thirdPersonProblem(text: string): string | null {
  for (const m of text.matchAll(
    /(?:^|[.!?¡¿]\s+)([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+) (?:está|es|va|tiene|decide|quiere|sale|llega|se |le |lo |no |ve |mira|toma|camina|siente|piensa)/g,
  )) {
    if (!NOT_A_NAME.has(norm(m[1]))) return `tercera persona (${m[1]})`;
  }
  return null;
}

/** Montos de dinero escritos en el texto ("$500", "1.200 dólares"): el juego ya escala y muestra lo que ganás o perdés, y no coincidirían. */
export function moneyTextProblem(text: string): string | null {
  return /\$\s?\d|\d[\d.,]*\s*(?:d[oó]lares|usd|pesos|euros|mangos|lucas)/i.test(text) ? 'monto de dinero en el texto' : null;
}

/** Problemas de estilo del texto generado: tercera persona con nombre propio o montos de dinero escritos. */
export function textProblem(text: string): string | null {
  return thirdPersonProblem(text) ?? moneyTextProblem(text);
}
