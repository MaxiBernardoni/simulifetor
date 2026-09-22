export type StatKey = 'happiness' | 'health' | 'smarts' | 'looks';
export type Gender = 'M' | 'F';
export type PersonKind = 'mother' | 'father' | 'sibling' | 'friend' | 'partner' | 'child' | 'ex';
export type Op = '>=' | '<=' | '>' | '<';
export type Tone = 'good' | 'bad' | 'neutral' | 'system';

// ───────── Condiciones ─────────
export type Cond =
  | { stat: StatKey; op: Op; value: number }
  | { age: [number, number] }
  | { year: [number, number] }
  | { flag: string }
  | { noFlag: string }
  | { money: { gte?: number; lte?: number } }
  | { job: boolean }
  | { sector: string }
  | { eduGte: number }
  | { enrolled: boolean }
  | { has: PersonKind }
  | { hasNot: PersonKind }
  | { chance: number }
  | { jailed: boolean }
  | { targetFriendship: { gte?: number; lte?: number } }
  | { targetRomance: { gte?: number; lte?: number } }
  | { targetAge: { gte?: number; lte?: number } }
  | { performance: { gte?: number; lte?: number } }
  | { wealth: number[] }
  | { married: boolean }
  | { trial: boolean }
  | { asset: 'house' | 'car' }
  | { invested: { gte?: number; lte?: number } }
  | { loan: boolean }
  | { tech: string }
  | { law: string }
  | { noLaw: string }
  | { era: string };

// ───────── Efectos ─────────
/** A quién apunta un efecto: la persona objetivo, el primero de un tipo, o el amante (quien más amor tiene sin ser la pareja). */
export type Who = 'target' | 'lover' | PersonKind;

export type Effect =
  | { stat: StatKey; add: number }
  | { money: number }
  | { moneyPct: number }
  | { setFlag: string }
  | { clearFlag: string }
  | { addPerson: { kind: PersonKind; age?: 'baby' | 'peer' | 'young' } }
  | { relation: { who: Who; friendship?: number; romance?: number; becomes?: PersonKind; married?: boolean; remove?: boolean } }
  | { performance: number }
  | { gpa: number }
  | { salaryMult: number }
  | { loseJob: true }
  | { jail: [number, number] }
  | { parole: number }
  | { arrest: { crime: string; years: [number, number] } }
  | { sentence: 'full' | 'half' | 'double' | 'none' | 'probation' }
  | { loseAsset: 'house' | 'car' }
  | { invest: number }
  | { die: string }
  | { log: string }
  | { trigger: string };

export interface Outcome {
  weight?: number;
  /** Si no se cumplen, este resultado no puede salir (p. ej. cambios por ley de época). */
  conditions?: Cond[];
  text: string;
  effects?: Effect[];
}

export interface Choice {
  label: string;
  conditions?: Cond[];
  outcomes: Outcome[];
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  tags?: string[];
  weight?: number;
  cooldown?: number;
  once?: boolean;
  target?: PersonKind;
  conditions?: Cond[];
  effects?: Effect[];
  choices?: Choice[];
}

export interface Activity {
  id: string;
  label: string;
  desc: string;
  icon: string;
  category: 'salud' | 'ocio' | 'dinero' | 'social' | 'crimen' | 'estudio' | 'trabajo';
  cost?: number;
  conditions?: Cond[];
  inJail?: boolean;
  /** Tecnología requerida (content/eras.ts). */
  tech?: string;
  outcomes: Outcome[];
}

export interface PersonAction {
  id: string;
  label: string;
  icon: string;
  kinds: PersonKind[];
  cost?: number;
  conditions?: Cond[];
  /** Rota: cada año solo se ofrece una parte al azar (determinista) de las que ya están desbloqueadas. */
  rotate?: boolean;
  /** Cuánto "rastro" deja con la pareja oficial si la persona objetivo es otra (infidelidad). */
  risk?: number;
  outcomes: Outcome[];
}

export interface Career {
  id: string;
  sector: string;
  minAge: number;
  minEdu: number;
  minSmarts?: number;
  noRecord?: boolean;
  /** Año desde el que existe / hasta el que existe la profesión (eras). */
  since?: number;
  until?: number;
  levels: { title: string; salary: number }[];
}

// ───────── Estado ─────────
export interface Person {
  id: string;
  kind: PersonKind;
  name: string;
  gender: Gender;
  age: number;
  alive: boolean;
  /** Amistad: de -100 a 100. Por debajo de 0 es enemistad ("mala onda"). */
  friendship: number;
  /** Amor: 0 a 100. `undefined` = todavía bloqueado (se desbloquea con acciones románticas). */
  romance?: number;
  /** Solo la pareja: cuánto sospecha de una infidelidad (0–100). Sube con los amoríos y baja con el tiempo. */
  suspicion?: number;
  married?: boolean;
  /** Aspecto propio (hijos heredan rasgos). Si falta, se deriva del id. */
  look?: Look;
  /** No envejece ni muere mientras se simula el pasado de un heredero. */
  frozen?: boolean;
  /** Si es un miembro de la familia: su id en el árbol (el mundo decide su edad y su muerte). */
  nodeId?: string;
}

export interface Job {
  careerId: string;
  title: string;
  sector: string;
  level: number;
  salary: number;
  performance: number;
  yearsAtLevel: number;
  yearsTotal: number;
  boss: string;
}

export interface Education {
  level: number; // 0 nada, 1 primaria, 2 secundaria, 3 universidad
  enrolled: null | 'primary' | 'secondary' | 'university';
  years: number;
  gpa: number;
}

export interface LogEntry {
  age: number;
  year: number;
  text: string;
  tone: Tone;
  title?: string;
  icon?: string;
}

export interface Delta {
  /** Stats, plata, o cuánto cambió la amistad o el amor con la persona de la acción. */
  key: StatKey | 'money' | 'friendship' | 'romance';
  amount: number;
}

/** Id de los prompts de continuación de la IA (no corresponden a ningún evento registrado). */
export const FOLLOWUP_ID = 'ai.followup';

/** Nueva situación que la IA plantea a partir de la respuesta del jugador. */
export interface FollowUp {
  title: string;
  text: string;
  options: string[];
  thread: string;
  depth: number;
}

export type Prompt =
  | {
      kind: 'choice';
      eventId: string;
      title: string;
      text: string;
      targetId?: string;
      icon?: string;
      scene?: string;
      /** Continuación generada por la IA (no hay evento detrás): opciones sugeridas, historia hasta acá y cuántas van. */
      options?: string[];
      thread?: string;
      depth?: number;
    }
  | { kind: 'result'; title: string; text: string; deltas: Delta[]; icon?: string; scene?: string; targetId?: string };

export interface Asset {
  id: string;
  catalogId: string;
  kind: 'house' | 'car';
  name: string;
  value: number;
  boughtYear: number;
}

export interface Look {
  skin: number;
  eyes: number;
  hairStyle: number;
  hairColor: number;
}

export interface Life {
  id: string;
  rng: number;
  name: string;
  surname: string;
  gender: Gender;
  look: Look;
  birthYear: number;
  age: number;
  year: number;
  alive: boolean;
  cause?: string;
  wealthClass: 1 | 2 | 3;
  stats: Record<StatKey, number>;
  money: number;
  pension: number;
  edu: Education;
  job: Job | null;
  offers: string[];
  assets: Asset[];
  loan: number;
  invested: number;
  trial: { crime: string; years: [number, number] } | null;
  people: Person[];
  flags: Record<string, boolean>;
  jailYears: number;
  usedThisYear: string[];
  eventLast: Record<string, number>;
  log: LogEntry[];
  pending: Prompt[];
  lastDelta: Delta[];
  schemaVersion: number;
  /** Dinastía a la que pertenece esta vida. */
  lineageId: string;
  generation: number;
  parentLifeId?: string;
  /** Id de esta persona en el árbol genealógico. */
  nodeId?: string;
  scenario?: { id: string; status: 'active' | 'won' | 'lost'; wonAge?: number };
}

export interface LifeSummary {
  id: string;
  name: string;
  birthYear: number;
  deathYear: number;
  age: number;
  cause: string;
  money: number;
  job: string;
  lineageId?: string;
  generation?: number;
  parentId?: string;
  look?: Look;
  gender?: Gender;
  legacy?: number;
  children?: number;
  netWorth?: number;
  scenarioId?: string;
  scenarioResult?: 'won' | 'lost' | 'active';
}

export const SCHEMA_VERSION = 5;
