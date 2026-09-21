import { AIError } from './types';

export interface FetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<FetchResponseLike>;

export interface PostOpts {
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
  fetchImpl?: FetchLike;
}

const defaultFetch: FetchLike = (url, init) => fetch(url, init) as unknown as Promise<FetchResponseLike>;

/** POST JSON con timeout y un reintento ante fallas de red o 5xx. Traduce los errores a AIError. */
export async function postJson(url: string, headers: Record<string, string>, body: unknown, opts: PostOpts = {}): Promise<unknown> {
  const { timeoutMs = 8000, retries = 1, fetchImpl = defaultFetch } = opts;
  let last: AIError = new AIError('network', 'sin conexión');
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const onAbort = () => ctrl.abort();
    opts.signal?.addEventListener('abort', onAbort);
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, timeoutMs);
    try {
      const res = await fetchImpl(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), signal: ctrl.signal });
      if (res.ok) {
        try {
          return await res.json();
        } catch {
          throw new AIError('bad-response', 'respuesta ilegible');
        }
      }
      if (res.status === 401 || res.status === 403) throw new AIError('auth', 'clave rechazada');
      if (res.status === 429) throw new AIError('quota', 'cuota agotada o demasiados pedidos');
      if (res.status >= 500) {
        last = new AIError('network', `error del servidor (${res.status})`);
        continue;
      }
      throw new AIError('bad-response', `error ${res.status}`);
    } catch (e) {
      if (e instanceof AIError) {
        if (e.kind === 'network') {
          last = e;
          continue;
        }
        throw e;
      }
      if (opts.signal?.aborted) throw new AIError('timeout', 'cancelado');
      last = timedOut ? new AIError('timeout', 'tardó demasiado') : new AIError('network', 'sin conexión');
      if (timedOut && attempt >= retries) throw last;
    } finally {
      clearTimeout(timer);
      opts.signal?.removeEventListener('abort', onAbort);
    }
  }
  throw last;
}
