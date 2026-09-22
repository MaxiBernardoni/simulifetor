import type { FollowUp, GameEvent, Outcome } from '../engine/types';
import { AIError } from './types';
import type { AIProvider, AuditEntry } from './types';
import { eventPrompt, freeTextPrompt } from './prompts';
import { validateAiEvent, validateFreeTextOutcome } from './validate';
import { norm } from './filter';

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

/** Cuántas continuaciones seguidas puede plantear la IA: después, la historia cierra sola. */
export const MAX_FOLLOWUPS = 3;

export type FreeTextAnswer = { ok: true; outcome: Outcome; next?: FollowUp } | { ok: false; message: string };

const ERROR_MESSAGE: Record<string, string> = {
  timeout: 'La IA tardó demasiado.',
  quota: 'La IA se quedó sin cuota por ahora.',
  auth: 'La clave de la IA fue rechazada.',
  network: 'No hay conexión con la IA.',
  filtered: 'El proveedor no quiso responder a eso.',
  'bad-response': 'La IA respondió algo que no se pudo usar.',
};

/**
 * Le pide a la IA que juzgue la respuesta escrita del jugador y devuelve un resultado validado (texto + puntos).
 * Nunca lanza: ante cualquier falla devuelve un mensaje para mostrar y el jugador puede elegir una opción.
 */
export async function resolveFreeText(
  provider: AIProvider,
  apiKey: string,
  input: {
    title: string;
    situation: string;
    answer: string;
    ctx: string;
    age: number;
    thread?: string;
    depth?: number;
    targetLabel?: string;
  },
  timeoutMs = 30000,
): Promise<FreeTextAnswer> {
  let reason = 'sin respuesta';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const depth = input.depth ?? 0;
      const raw = await provider.generate(
        freeTextPrompt(input.title, input.situation, input.answer, input.ctx, input.thread, depth < MAX_FOLLOWUPS, input.targetLabel),
        apiKey,
        {
          timeoutMs,
          temperature: 0.8,
        },
      );
      const res = validateFreeTextOutcome(raw, input.age);
      if (res.ok) {
        const { next, outcome } = res;
        if (!next || depth >= MAX_FOLLOWUPS) return { ok: true, outcome };
        // La historia hasta acá (acotada) viaja con la continuación para que la IA no pierda el hilo.
        const step = `${input.situation} → el jugador: ${input.answer.trim()} → ${outcome.text}`;
        const thread = [input.thread, step].filter(Boolean).join(' | ').slice(-700);
        return { ok: true, outcome, next: { ...next, thread, depth: depth + 1 } };
      }
      reason = res.reason;
    } catch (e) {
      const kind = e instanceof AIError ? e.kind : 'network';
      // Fallas que no se arreglan reintentando.
      if (kind !== 'bad-response') return { ok: false, message: ERROR_MESSAGE[kind] ?? 'La IA no respondió.' };
      reason = 'respuesta vacía';
    }
  }
  return { ok: false, message: `La IA no dio una respuesta válida (${reason}).` };
}
