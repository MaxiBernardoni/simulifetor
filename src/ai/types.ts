// Capa de IA opcional (docs/05-ia.md). Nada de esto se usa si el jugador no la activa.

export type ProviderId = 'gemini' | 'groq';

export interface GenerateOpts {
  timeoutMs?: number;
}

/** Un proveedor de texto. `generate` devuelve el texto crudo o lanza AIError. */
export interface AIProvider {
  id: ProviderId | 'mock';
  label: string;
  generate(prompt: string, apiKey: string, opts?: GenerateOpts): Promise<string>;
}

export type AIErrorKind = 'network' | 'timeout' | 'quota' | 'auth' | 'filtered' | 'bad-response';

export class AIError extends Error {
  constructor(
    public kind: AIErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export interface AIConfig {
  enabled: boolean;
  provider: ProviderId;
  narrator: boolean;
}

export const DEFAULT_AI_CONFIG: AIConfig = { enabled: false, provider: 'gemini', narrator: false };

export interface AuditEntry {
  t: number;
  reason: string;
  title?: string;
}

export const POOL_MAX = 200;
export const AUDIT_MAX = 50;
export const SESSION_BATCH = 5;
