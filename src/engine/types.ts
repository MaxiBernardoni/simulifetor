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
  | { targetCloseness: { gte?: number; lte?: number } }
  | { targetAge: { gte?: number; lte?: number } }
  | { performance: { gte?: number; lte?: number } }
  | { wealth: number[] }
  | { married: boolean }
  | { trial: boolean }
  | { asset: 'house' | 'car' }
  | { invested: { gte?: number; lte?: number } }
  | { loan: boolean };

// ───────── Efectos ─────────
export type Who = 'target' | PersonKind;

export type Effect =
  | { stat: StatKey; add: number }
  | { money: number }
  | { moneyPct: number }
  | { setFlag: string }
  | { clearFlag: string }
  | { addPerson: { kind: PersonKind; age?: 'baby' | 'peer' | 'young' } }
  | { relation: { who: Who; closeness?: number; becomes?: PersonKind; married?: boolean; remove?: boolean } }
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
  outcomes: Outcome[];
}

export interface PersonAction {
  id: string;
  label: string;
  icon: string;
  kinds: PersonKind[];
  cost?: number;
  conditions?: Cond[];
  outcomes: Outcome[];
}

export interface Career {
  id: string;
  sector: string;
  minAge: number;
  minEdu: number;
  minSmarts?: number;
  noRecord?: boolean;
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
  closeness: number;
  married?: boolean;
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
  key: StatKey | 'money';
  amount: number;
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
}

export const SCHEMA_VERSION = 3;
