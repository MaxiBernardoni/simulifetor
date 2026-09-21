import type { AIConfig } from './types';
import { cleanBaseUrl } from './providers/openai';

/** Campos que definen "con quién hablamos": si cambian, la conexión probada deja de valer. */
const CONNECTION_FIELDS: (keyof AIConfig)[] = ['provider', 'baseUrl', 'model', 'cloudModel'];

/** Aplica un cambio a la configuración. Si toca la conexión (proveedor, dirección o modelo), hay que volver a probarla. */
export function applyConfigPatch(prev: AIConfig, patch: Partial<AIConfig>): AIConfig {
  const touchesConnection = CONNECTION_FIELDS.some((k) => k in patch && patch[k] !== prev[k]);
  return { ...prev, ...patch, ...(touchesConnection && !('verified' in patch) ? { verified: false } : {}) };
}

/**
 * ¿Se puede mostrar la opción de responder escribiendo? Hace falta: IA activada, «responder escribiendo» encendido y una
 * conexión que ya se probó con éxito (con clave válida, salvo el modelo propio que no usa clave).
 */
export function canAnswerByText(config: AIConfig, hasKey: boolean): boolean {
  return config.enabled && config.narrator && config.verified && (hasKey || config.provider === 'compat');
}

/** ¿Cambió algo que define "con quién hablamos"? (para volver a verificar la conexión). */
export function connectionChanged(prev: AIConfig, next: AIConfig): boolean {
  return CONNECTION_FIELDS.some((k) => prev[k] !== next[k]);
}

/** ¿Está completa la configuración como para intentar una conexión? (clave para la nube; dirección y modelo para el modelo propio). */
export function connectionUsable(config: AIConfig, hasKey: boolean): boolean {
  return config.provider === 'compat' ? !!cleanBaseUrl(config.baseUrl) && !!config.model.trim() : hasKey;
}

/** Texto para mostrar cuando falla la verificación (lo que se ve al tocar la cruz roja). */
export function describeAIError(kind?: string, message?: string): string {
  // Los errores HTTP vienen como "texto corto — detalle del proveedor": se muestra solo el detalle para no repetir.
  const after = message?.includes('—') ? message.split('—').slice(1).join('—').trim() : (message ?? '').trim();
  const detail = after ? ` ${after}` : '';
  switch (kind) {
    case 'auth':
      return `La clave fue rechazada o no tiene acceso a ese modelo.${detail}`;
    case 'quota':
      return `Sin cuota por ahora (límite gratuito).${detail}`;
    case 'timeout':
      return 'Tardó demasiado en responder. Revisá tu conexión o probá otro modelo.';
    case 'bad-response':
      return `La IA respondió con un error:${(message ?? '').trim() ? ` ${(message ?? '').trim()}` : ' desconocido'}`;
    default:
      return `No se pudo conectar:${detail || ' sin detalle'}. Puede ser falta de internet o que el navegador (o un bloqueador de anuncios) bloqueó el pedido.`;
  }
}
