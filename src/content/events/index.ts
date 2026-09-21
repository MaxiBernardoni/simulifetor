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
import { COURT } from './court';
import { RELATIONSHIPS } from './relationships';
import { BONDS } from './bonds';
import { CAREER, MONEY_EXTRA } from './career';
import { DYNASTY } from './dynasty';
import { HISTORY, HISTORY_LAWS } from './history';

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
  ...HISTORY,
  ...HISTORY_LAWS,
  ...RANDOM,
  ...OLD,
  ...COURT,
  ...RELATIONSHIPS,
  ...BONDS,
  ...CAREER,
  ...MONEY_EXTRA,
  ...DYNASTY,
];
