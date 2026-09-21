import { AIError } from '../types';
import type { AIProvider, ProviderId } from '../types';
import { postJson } from '../http';
import type { FetchLike } from '../http';

/** Normaliza la URL base ("http://192.168.0.5:11434/v1/" → "http://192.168.0.5:11434/v1"). Devuelve null si no es http(s). */
export function cleanBaseUrl(url: string): string | null {
  const u = url.trim().replace(/\/+$/, '');
  return /^https?:\/\/\S+$/i.test(u) ? u : null;
}

/**
 * Cualquier servicio con API estilo OpenAI (`/chat/completions`): Groq, OpenRouter, Ollama, LM Studio…
 * La clave es opcional (los modelos locales no la piden).
 */
export function createOpenAICompat(id: ProviderId, baseUrl: string, model: string, fetchImpl?: FetchLike): AIProvider {
  return {
    id,
    async generate(prompt, apiKey, opts) {
      const url = cleanBaseUrl(baseUrl);
      if (!url || !model.trim()) throw new AIError('bad-response', 'falta la dirección o el modelo');
      const data = (await postJson(
        `${url}/chat/completions`,
        apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        { model: model.trim(), messages: [{ role: 'user', content: prompt }], temperature: 1 },
        { ...opts, fetchImpl },
      )) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new AIError('bad-response', 'respuesta vacía');
      return text;
    },
  };
}
