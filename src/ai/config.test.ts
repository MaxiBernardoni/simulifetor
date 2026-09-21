import { describe, expect, it } from 'vitest';
import { applyConfigPatch, canAnswerByText } from './config';
import { DEFAULT_AI_CONFIG } from './types';
import type { AIConfig } from './types';

const ready: AIConfig = { ...DEFAULT_AI_CONFIG, enabled: true, narrator: true, verified: true, provider: 'groq' };

describe('responder escribiendo: solo con conexión verificada', () => {
  it('por defecto está apagado y sin verificar', () => {
    expect(DEFAULT_AI_CONFIG.enabled).toBe(false);
    expect(DEFAULT_AI_CONFIG.verified).toBe(false);
    expect(canAnswerByText(DEFAULT_AI_CONFIG, true)).toBe(false);
  });

  it('exige IA activada, modo narrador, conexión probada y una clave (salvo el modelo propio)', () => {
    expect(canAnswerByText(ready, true)).toBe(true);
    expect(canAnswerByText({ ...ready, enabled: false }, true)).toBe(false);
    expect(canAnswerByText({ ...ready, narrator: false }, true)).toBe(false);
    expect(canAnswerByText({ ...ready, verified: false }, true)).toBe(false);
    expect(canAnswerByText(ready, false)).toBe(false); // Groq sin clave
    expect(canAnswerByText({ ...ready, provider: 'compat' }, false)).toBe(true); // el modelo propio no usa clave
  });
});

describe('la conexión probada se invalida al cambiar de conexión', () => {
  it.each([
    ['proveedor', { provider: 'gemini' as const }],
    ['dirección', { baseUrl: 'http://otro:11434/v1' }],
    ['modelo propio', { model: 'hermes3' }],
    ['modelo de la nube', { cloudModel: 'openai/gpt-oss-20b' }],
  ])('cambiar %s pide volver a probar', (_n, patch) => {
    expect(applyConfigPatch(ready, patch).verified).toBe(false);
  });

  it('activar/desactivar la IA o el narrador no invalida la conexión', () => {
    expect(applyConfigPatch(ready, { narrator: false }).verified).toBe(true);
    expect(applyConfigPatch(ready, { enabled: false }).verified).toBe(true);
  });

  it('repetir el mismo valor no invalida, y un patch con verified lo respeta', () => {
    expect(applyConfigPatch(ready, { provider: 'groq' }).verified).toBe(true);
    expect(applyConfigPatch(ready, { provider: 'gemini', verified: true }).verified).toBe(true);
    expect(applyConfigPatch({ ...ready, verified: false }, { verified: true }).verified).toBe(true);
  });
});
