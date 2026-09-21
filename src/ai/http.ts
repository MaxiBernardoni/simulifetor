import { AIError } from './types';

export interface FetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal },
) => Promise<FetchResponseLike>;

export interface PostOpts {
  timeoutMs?: number;
  fetchImpl?: FetchLike;
}

/** Reintentos ante fallas de red o 5xx. */
const RETRIES = 1;

const defaultFetch: FetchLike = (url, init) => fetch(url, init) as unknown as Promise<FetchResponseLike>;

/** Mensaje de error del proveedor (`{"error":{"message":"…"}}`), recortado; vacío si no se puede leer. */
async function errorDetail(res: FetchResponseLike): Promise<string> {
  try {
    const raw = await res.text();
    let msg = raw;
    try {
      const j = JSON.parse(raw) as { error?: { message?: string } | string; message?: string };
      msg = (typeof j.error === 'string' ? j.error : j.error?.message) ?? j.message ?? raw;
    } catch {
      // no era JSON: se usa el texto tal cual
    }
    msg = msg.replace(/\s+/g, ' ').trim().slice(0, 160);
    return msg ? ` — ${msg}` : '';
  } catch {
    return '';
  }
}

/** POST JSON con timeout y un reintento ante fallas de red o 5xx. Traduce los errores a AIError. */
export async function postJson(url: string, headers: Record<string, string>, body: unknown, opts: PostOpts = {}): Promise<unknown> {
  const { timeoutMs = 8000, fetchImpl = defaultFetch } = opts;
  let last: AIError = new AIError('network', 'sin conexión');
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const ctrl = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, timeoutMs);
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (res.ok) {
        try {
          return await res.json();
        } catch {
          throw new AIError('bad-response', 'respuesta ilegible');
        }
      }
      const detail = await errorDetail(res);
      if (res.status === 401 || res.status === 403) throw new AIError('auth', `clave rechazada o sin acceso${detail}`);
      if (res.status === 429) throw new AIError('quota', `cuota agotada o demasiados pedidos${detail}`);
      if (res.status >= 500) {
        last = new AIError('network', `error del servidor (${res.status})`);
        continue;
      }
      throw new AIError('bad-response', `error ${res.status}${detail}`);
    } catch (e) {
      if (e instanceof AIError) {
        if (e.kind === 'network') {
          last = e;
          continue;
        }
        throw e;
      }
      const why = e instanceof Error && e.message ? ` (${e.message.slice(0, 80)})` : '';
      last = timedOut ? new AIError('timeout', 'tardó demasiado') : new AIError('network', `sin conexión${why}`);
      if (timedOut && attempt >= RETRIES) throw last;
    } finally {
      clearTimeout(timer);
    }
  }
  throw last;
}
