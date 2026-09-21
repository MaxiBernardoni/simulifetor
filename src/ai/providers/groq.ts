import type { AIProvider } from '../types';
import type { FetchLike } from '../http';
import { createOpenAICompat } from './openai';

export const GROQ_MODEL = 'llama-3.3-70b-versatile';

export const createGroq = (fetchImpl?: FetchLike): AIProvider =>
  createOpenAICompat('groq', 'https://api.groq.com/openai/v1', GROQ_MODEL, fetchImpl);
