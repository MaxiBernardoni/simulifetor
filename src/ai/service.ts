import type { GameEvent } from '../engine/types';
import { AIError } from './types';
import type { AIProvider, AuditEntry } from './types';
import { eventPrompt, narratorPrompt } from './prompts';
import { validateAiEvent } from './validate';
import { contentProblem, norm } from './filter';

export interface GenResult {
  added: GameEvent[];
  rejected: AuditEntry[];
  error?: AIError;
}

/**
 * Pide hasta `n` eventos al proveedor, uno por pedido. Nunca lanza: los fallos se devuelven en `error`
 * y el juego sigue con el contenido normal.
 */
export async function generateEvents(
  provider: AIProvider,
  apiKey: string,
  n: number,
  ctx: string,
  known: { ids: Set<string>; titles: Set<string> },
  opts: { timeoutMs?: number } = {},
): Promise<GenResult> {
  const out: GenResult = { added: [], rejected: [] };
  const ids = new Set(known.ids);
  const titles = new Set(known.titles);
  for (let i = 0; i < n; i++) {
    try {
      const raw = await provider.generate(eventPrompt(ctx), apiKey, opts);
      const res = validateAiEvent(raw, ids, titles);
      if (res.ok) {
        out.added.push(res.event);
        ids.add(res.event.id);
        titles.add(norm(res.event.title));
      } else {
        out.rejected.push({ t: Date.now(), reason: res.reason, title: res.title });
      }
    } catch (e) {
      out.error = e instanceof AIError ? e : new AIError('network', 'error desconocido');
      if (out.error.kind === 'filtered') {
        out.rejected.push({ t: Date.now(), reason: 'el proveedor rechazó el pedido por su filtro' });
        out.error = undefined;
        continue;
      }
      break;
    }
  }
  return out;
}

const narrationCache = new Map<string, string>();

const words = (t: string) => norm(t).match(/[a-z0-9]{4,}/g) ?? [];

/**
 * ¿La versión narrada conserva los datos del original? Los modelos chicos suelen inventar o cambiar personajes al
 * reescribir; si menos del 65 % de las palabras importantes del original sigue en el texto (comparando por raíz de
 * 5 letras), se descarta y se muestra el original.
 */
export function keepsFacts(original: string, narrated: string): boolean {
  const orig = words(original);
  if (!orig.length) return true;
  const stems = new Set(words(narrated).map((w) => w.slice(0, 5)));
  const kept = orig.filter((w) => stems.has(w.slice(0, 5))).length;
  return kept / orig.length >= 0.65;
}

/** Reescribe el texto de un evento con el contexto de la vida. Devuelve null si tarda, falla o no pasa el filtro. */
export async function narrate(
  provider: AIProvider,
  apiKey: string,
  eventId: string,
  text: string,
  ctx: string,
  timeoutMs = 3000,
): Promise<string | null> {
  const key = `${eventId}|${ctx}`;
  const cached = narrationCache.get(key);
  if (cached) return cached;
  try {
    const raw = await provider.generate(narratorPrompt(text, ctx), apiKey, { timeoutMs, temperature: 0.3 });
    const out = raw.trim().replace(/^["“]|["”]$/g, '');
    if (out.length < 10 || out.length > text.length * 1.6 + 40) return null;
    if (!keepsFacts(text, out)) return null;
    if (out.includes('{') || contentProblem(out) !== null) return null;
    narrationCache.set(key, out);
    if (narrationCache.size > 100) narrationCache.delete(narrationCache.keys().next().value as string);
    return out;
  } catch {
    return null;
  }
}
