// Capa de IA opcional (docs/05-ia.md). Nada de esto se usa si el jugador no la activa.

export type ProviderId = 'gemini' | 'groq' | 'compat';

/** Un proveedor de texto. `generate` devuelve el texto crudo o lanza AIError. */
export interface AIProvider {
  id: ProviderId | 'mock';
  generate(prompt: string, apiKey: string, opts?: { timeoutMs?: number; temperature?: number }): Promise<string>;
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
  /** Solo para `compat`: dirección base de la API estilo OpenAI y nombre del modelo. */
  baseUrl: string;
  model: string;
  /** Modelo elegido para Gemini/Groq (vacío = el de por defecto). */
  cloudModel: string;
  /** La conexión se verificó con éxito (verificación automática). Habilita el responder escribiendo. */
  verified: boolean;
  narrator: boolean;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: false,
  provider: 'gemini',
  narrator: false,
  baseUrl: '',
  model: '',
  cloudModel: '',
  verified: false,
};

export interface AuditEntry {
  t: number;
  reason: string;
  title?: string;
}

export const POOL_MAX = 200;
export const AUDIT_MAX = 50;
export const SESSION_BATCH = 5;
