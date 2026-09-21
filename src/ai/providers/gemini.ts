import { AIError } from '../types';
import type { AIProvider } from '../types';
import { postJson } from '../http';
import type { FetchLike } from '../http';

// Las cuotas y los nombres de modelo cambian con el tiempo: si dejara de andar, cambiá MODEL.
export const GEMINI_MODEL = 'gemini-2.0-flash';

export function createGemini(fetchImpl?: FetchLike): AIProvider {
  return {
    id: 'gemini',
    label: 'Google Gemini',
    async generate(prompt, apiKey, opts) {
      const data = (await postJson(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        { 'x-goog-api-key': apiKey },
        { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 1, responseMimeType: 'text/plain' } },
        { ...opts, fetchImpl },
      )) as { candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]; promptFeedback?: { blockReason?: string } };
      if (data.promptFeedback?.blockReason) throw new AIError('filtered', 'el proveedor bloqueó el pedido');
      const cand = data.candidates?.[0];
      if (cand?.finishReason === 'SAFETY') throw new AIError('filtered', 'el proveedor bloqueó la respuesta');
      const text = cand?.content?.parts?.map((p) => p.text ?? '').join('');
      if (!text) throw new AIError('bad-response', 'respuesta vacía');
      return text;
    },
  };
}
