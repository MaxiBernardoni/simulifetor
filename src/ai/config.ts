import type { AIConfig } from './types';

/** Campos que definen "con quién hablamos": si cambian, la conexión probada deja de valer. */
const CONNECTION_FIELDS: (keyof AIConfig)[] = ['provider', 'baseUrl', 'model', 'cloudModel'];

/** Aplica un cambio a la configuración. Si toca la conexión (proveedor, dirección o modelo), hay que volver a probarla. */
export function applyConfigPatch(prev: AIConfig, patch: Partial<AIConfig>): AIConfig {
  const touchesConnection = CONNECTION_FIELDS.some((k) => k in patch && patch[k] !== prev[k]);
  return { ...prev, ...patch, ...(touchesConnection && !('verified' in patch) ? { verified: false } : {}) };
}

/**
 * ¿Se puede mostrar la opción de responder escribiendo? Hace falta: IA activada, modo narrador encendido y una
 * conexión que ya se probó con éxito (con clave válida, salvo el modelo propio que no usa clave).
 */
export function canAnswerByText(config: AIConfig, hasKey: boolean): boolean {
  return config.enabled && config.narrator && config.verified && (hasKey || config.provider === 'compat');
}
