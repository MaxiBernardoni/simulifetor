import type { AIProvider } from '../types';
import type { FetchLike } from '../http';
import { createOpenAICompat } from './openai';

/** Modelo por defecto: el de 8B está en el plan gratuito de Groq; los grandes pueden requerir otro plan (se elige en Ajustes). */
export const GROQ_MODEL = 'llama-3.1-8b-instant';

export const createGroq = (fetchImpl?: FetchLike, model?: string): AIProvider =>
  createOpenAICompat('groq', 'https://api.groq.com/openai/v1', model?.trim() || GROQ_MODEL, fetchImpl);
