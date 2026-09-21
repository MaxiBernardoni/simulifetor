import type { Life } from '../engine/types';
import { CATEGORIES } from './validate';

// Las reglas de contenido van primero: el modelo las lee antes que cualquier otra cosa.
export const CONTENT_RULES = `REGLAS OBLIGATORIAS (si no las cumplís, tu respuesta se descarta):
- Nunca escribas contenido sexual que involucre a menores de 18 años ni mencioná a menores en situaciones sexuales.
- No trates el suicidio ni la autolesión.
- El país es ficticio y genérico: no nombres países, ciudades, políticos ni personas reales.
- No nombres marcas reales.
- Español rioplatense (voseo), humor negro y seco, segunda persona. Frases cortas.`;

export function summarizeLife(life: Life): string {
  const partner = life.people.some((p) => p.alive && p.kind === 'partner');
  const kids = life.people.filter((p) => p.alive && p.kind === 'child').length;
  const parts = [
    `${life.name}, ${life.age} años`,
    `año ${life.year}`,
    life.job ? `trabaja de ${life.job.title}` : life.age < 18 ? 'estudiante' : 'sin trabajo',
    partner ? 'con pareja' : 'sin pareja',
    kids ? `${kids} hijo(s)` : 'sin hijos',
    life.money < 0 ? 'endeudado' : life.money > 50000 ? 'con plata' : 'con plata justa',
  ];
  return parts.join(', ');
}

export function eventPrompt(ctx: string): string {
  return `${CONTENT_RULES}

Sos guionista de un simulador de vida en texto para adultos. Podés ser crudo, picante y oscuro (sexo entre adultos, drogas, violencia, humor negro): no hay censura salvo las reglas de arriba. Inventá UN evento de vida nuevo y original para este personaje: ${ctx}.

ESTILO (obligatorio): escribí SIEMPRE en segunda persona, hablándole al jugador con voseo ("Encontrás un sobre en el buzón"). Nunca uses tercera persona ni el nombre del personaje. Tono seco, irónico y con humor negro, frases cortas, situaciones concretas (no genéricas). Las opciones son acciones en infinitivo o imperativo cortas ("Aceptar la coima", "Hacerte el distraído"). Ejemplo de estilo (NO lo copies, inventá otra situación distinta): "Tu vecino de arriba empieza a taladrar a las 7 de la mañana. Todos los días. Desde hace un mes."

Respondé SOLO con un objeto JSON, sin texto extra, con esta forma exacta:
{
  "title": "título corto",
  "text": "situación en 1 o 2 oraciones",
  "category": "una de: ${CATEGORIES.join(', ')}",
  "minAge": 18,
  "maxAge": 60,
  "weight": 3,
  "choices": [
    { "label": "opción 1", "outcomes": [ { "weight": 6, "text": "qué pasa", "effects": { "happiness": 4, "health": 0, "smarts": 0, "looks": 0, "money": -200 } } ] },
    { "label": "opción 2", "outcomes": [ { "weight": 1, "text": "qué pasa", "effects": { "happiness": -3 } } ] }
  ]
}
Límites: cada efecto de stat entre -15 y 15; "money" entre -20000 y 20000 (en dólares del año 2000; lo normal es entre -2000 y 2000); "moneyPct" entre -0.25 y 0.25 (opcional); "weight" del evento entre 1 y 8; 2 o 3 opciones con 1 a 3 resultados cada una. Los efectos son opcionales. No uses otros campos.`;
}

export function narratorPrompt(text: string, ctx: string): string {
  return `${CONTENT_RULES}

Reescribí este texto de un evento adaptándolo al personaje (${ctx}). Mantené el mismo significado y el mismo desenlace, no agregues datos que cambien las opciones, máximo 2 oraciones. Respondé SOLO con el texto reescrito, sin comillas.

Texto: ${text}`;
}
