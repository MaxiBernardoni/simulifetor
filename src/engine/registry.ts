import { ALL_EVENTS } from '../content/events';
import { ACTIVITIES } from '../content/activities';
import { PERSON_ACTIONS } from '../content/personActions';
import { CAREERS } from '../content/careers';
import type { Activity, Career, GameEvent, PersonAction } from './types';

const eventMap = new Map<string, GameEvent>(ALL_EVENTS.map((e) => [e.id, e]));
const careerMap = new Map<string, Career>(CAREERS.map((c) => [c.id, c]));

// Eventos generados por la IA opcional (src/ai). Vacío si la IA está desactivada: el motor no cambia.
let aiEvents: GameEvent[] = [];
let aiMap = new Map<string, GameEvent>();
let merged: GameEvent[] | null = null;

export function setAiEvents(list: GameEvent[]): void {
  aiEvents = list;
  aiMap = new Map(list.map((e) => [e.id, e]));
  merged = null;
}
export const aiEventCount = (): number => aiEvents.length;

export const getEvent = (id: string): GameEvent | undefined => eventMap.get(id) ?? aiMap.get(id);
export const getCareer = (id: string): Career | undefined => careerMap.get(id);
export const allEvents = (): GameEvent[] => (aiEvents.length ? (merged ??= [...ALL_EVENTS, ...aiEvents]) : ALL_EVENTS);
export const allActivities = (): Activity[] => ACTIVITIES;
export const allPersonActions = (): PersonAction[] => PERSON_ACTIONS;
export const allCareers = (): Career[] => CAREERS;
