import type { GameEvent } from '../../engine/types';
import { CHILDHOOD } from './childhood';
import { TEEN } from './teen';
import { WORK } from './work';
import { MONEY } from './money';
import { LOVE } from './love';
import { FAMILY } from './family';
import { HEALTH } from './health';
import { CRIME } from './crime';
import { HISTORICAL, RANDOM, OLD } from './misc';

export const ALL_EVENTS: GameEvent[] = [
  ...CHILDHOOD,
  ...TEEN,
  ...WORK,
  ...MONEY,
  ...LOVE,
  ...FAMILY,
  ...HEALTH,
  ...CRIME,
  ...HISTORICAL,
  ...RANDOM,
  ...OLD,
];
