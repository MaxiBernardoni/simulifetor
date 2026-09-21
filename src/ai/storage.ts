import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { GameEvent } from '../engine/types';
import { DEFAULT_AI_CONFIG } from './types';
import type { AIConfig, AuditEntry } from './types';

const DATA_KEY = 'vidasim.ai.v1';
const SECRET = 'vidasim_ai_key';
// La clave NUNCA va en el guardado del juego, en la copia de seguridad ni en logs.
const WEB_SECRET = 'vidasim.ai.key.web';

export interface AIData {
  config: AIConfig;
  pool: GameEvent[];
  audit: AuditEntry[];
}

export async function loadAIData(): Promise<AIData> {
  try {
    const raw = await AsyncStorage.getItem(DATA_KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<AIData>;
      return { config: { ...DEFAULT_AI_CONFIG, ...(d.config ?? {}) }, pool: Array.isArray(d.pool) ? d.pool : [], audit: Array.isArray(d.audit) ? d.audit : [] };
    }
  } catch {
    // datos ilegibles: se arranca limpio
  }
  return { config: { ...DEFAULT_AI_CONFIG }, pool: [], audit: [] };
}

export async function saveAIData(d: AIData): Promise<void> {
  try {
    await AsyncStorage.setItem(DATA_KEY, JSON.stringify(d));
  } catch {
    // sin espacio o sin permiso: la IA sigue funcionando en memoria
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return await AsyncStorage.getItem(WEB_SECRET);
    return await SecureStore.getItemAsync(SECRET);
  } catch {
    return null;
  }
}

export async function setApiKey(key: string): Promise<void> {
  const k = key.trim();
  if (Platform.OS === 'web') {
    if (k) await AsyncStorage.setItem(WEB_SECRET, k);
    else await AsyncStorage.removeItem(WEB_SECRET);
    return;
  }
  if (k) await SecureStore.setItemAsync(SECRET, k);
  else await SecureStore.deleteItemAsync(SECRET);
}
