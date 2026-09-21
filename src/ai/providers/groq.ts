import { AIError } from '../types';
import type { AIProvider } from '../types';
import { postJson } from '../http';
import type { FetchLike } from '../http';

export const GROQ_MODEL = 'llama-3.3-70b-versatile';

export function createGroq(fetchImpl?: FetchLike): AIProvider {
  return {
    id: 'groq',
    async generate(prompt, apiKey, opts) {
      const data = (await postJson(
        'https://api.groq.com/openai/v1/chat/completions',
        { Authorization: `Bearer ${apiKey}` },
        { model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 1 },
        { ...opts, fetchImpl },
      )) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new AIError('bad-response', 'respuesta vacía');
      return text;
    },
  };
}
