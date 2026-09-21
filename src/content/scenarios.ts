import type { Life } from '../engine/types';
import { netWorth } from '../engine/assets';
import { formatMoney } from '../engine/format';

export interface Scenario {
  id: string;
  title: string;
  desc: string;
  goal: string;
  icon: string;
  color: string;
  difficulty: 1 | 2 | 3;
  /** Edad con la que arrancás: la vida previa se genera automáticamente. */
  startAge: number;
  wealth?: 1 | 2 | 3;
  deadlineAge?: number;
  setup?: (l: Life) => void;
  won: (l: Life) => boolean;
  /** Condición extra de derrota (además de morir o pasar la edad límite). */
  lost?: (l: Life) => boolean;
  progress: (l: Life) => string;
}

const kids = (l: Life) => l.people.filter((p) => p.kind === 'child' && p.alive).length;
const married = (l: Life) => l.people.some((p) => p.alive && p.kind === 'partner' && p.married);
const CRIME_FLAGS = ['thief', 'scammer', 'dealer', 'hacker', 'embezzler', 'bank_robber'];
const hasCrimeFlag = (l: Life) => CRIME_FLAGS.some((f) => l.flags[f]);

export const SCENARIOS: Scenario[] = [
  {
    id: 'rags_to_riches', title: 'Del barro al éxito', icon: 'TrendingUp', color: '#2A9D6F', difficulty: 2,
    desc: 'Nacés en una familia humilde. Que eso no defina tu destino.',
    goal: 'Llegá a $400.000 de patrimonio antes de los 55 años.',
    startAge: 0, wealth: 1, deadlineAge: 55,
    won: (l) => netWorth(l) >= 400000,
    progress: (l) => `Patrimonio ${formatMoney(netWorth(l))} / ${formatMoney(400000)}`,
  },
  {
    id: 'young_millionaire', title: 'Millonario joven', icon: 'Gem', color: '#E9A23B', difficulty: 3,
    desc: 'Arrancás a los 18 con lo justo y una ambición enorme.',
    goal: 'Juntá $1.000.000 de patrimonio antes de los 40.',
    startAge: 18, wealth: 2, deadlineAge: 40,
    setup: (l) => { l.money = 3000; l.edu.level = Math.max(l.edu.level, 2); },
    won: (l) => netWorth(l) >= 1000000,
    progress: (l) => `Patrimonio ${formatMoney(netWorth(l))} / ${formatMoney(1000000)}`,
  },
  {
    id: 'saint_life', title: 'Vida ejemplar', icon: 'Heart', color: '#E0517A', difficulty: 2,
    desc: 'Sin escándalos, sin antecedentes, con familia.',
    goal: 'Llegá a los 75 casado/a, con 2 hijos vivos y sin antecedentes.',
    startAge: 0,
    won: (l) => l.age >= 75 && married(l) && kids(l) >= 2 && !l.flags.criminal_record,
    lost: (l) => !!l.flags.criminal_record,
    progress: (l) => `${l.age}/75 años · ${married(l) ? 'Casado/a' : 'Sin casar'} · ${kids(l)}/2 hijos`,
  },
  {
    id: 'underworld', title: 'Rey del hampa', icon: 'VenetianMask', color: '#8A3B3B', difficulty: 3,
    desc: 'El crimen paga… si no te atrapan.',
    goal: 'Hacete de $250.000 con un pasado criminal, en libertad, antes de los 50.',
    startAge: 18, wealth: 1, deadlineAge: 50,
    won: (l) => netWorth(l) >= 250000 && hasCrimeFlag(l) && l.jailYears === 0,
    progress: (l) => `Patrimonio ${formatMoney(netWorth(l))} / ${formatMoney(250000)} · ${hasCrimeFlag(l) ? 'con pasado criminal' : 'sin delitos aún'}`,
  },
  {
    id: 'prison_reboot', title: 'Volver a empezar', icon: 'Lock', color: '#5B6572', difficulty: 2,
    desc: 'Empezás a los 26 con 10 años de condena por delante.',
    goal: 'Salí en libertad, conseguí trabajo y juntá $30.000 antes de los 45.',
    startAge: 26, deadlineAge: 45,
    setup: (l) => { l.jailYears = 10; l.flags.criminal_record = true; l.job = null; l.money = 0; l.edu.enrolled = null; },
    won: (l) => l.jailYears === 0 && !!l.job && l.money >= 30000,
    progress: (l) => (l.jailYears > 0 ? `Condena: ${l.jailYears} años` : `${l.job ? 'Con trabajo' : 'Sin trabajo'} · ${formatMoney(l.money)} / ${formatMoney(30000)}`),
  },
  {
    id: 'centenarian', title: 'Centenario', icon: 'Award', color: '#3A86B4', difficulty: 3,
    desc: 'Cuidate mucho. Muchísimo.',
    goal: 'Llegá a los 100 años.',
    startAge: 0,
    setup: (l) => { l.stats.health = 95; },
    won: (l) => l.age >= 100,
    progress: (l) => `${l.age}/100 años · Salud ${l.stats.health}`,
  },
  {
    id: 'big_family', title: 'Familia numerosa', icon: 'Users', color: '#F4A261', difficulty: 2,
    desc: 'Empezás a los 20 con muchas ganas de armar una familia grande.',
    goal: 'Casate y tené 5 hijos vivos antes de los 55.',
    startAge: 20, deadlineAge: 55,
    won: (l) => married(l) && kids(l) >= 5,
    progress: (l) => `${married(l) ? 'Casado/a' : 'Sin casar'} · ${kids(l)}/5 hijos`,
  },
  {
    id: 'genius', title: 'Cerebro brillante', icon: 'Brain', color: '#9B5DE5', difficulty: 2,
    desc: 'Nacés con una inteligencia enorme. Aprovechala.',
    goal: 'Terminá la universidad y llegá al nivel 3 de una carrera de alto nivel antes de los 50.',
    startAge: 0, deadlineAge: 50,
    setup: (l) => { l.stats.smarts = 92; },
    won: (l) => l.edu.level >= 3 && !!l.job && l.job.level >= 2 && ['salud', 'legal', 'tecnología', 'ingeniería', 'finanzas'].includes(l.job.sector),
    progress: (l) => `${l.edu.level >= 3 ? 'Con título' : 'Sin título'} · ${l.job ? `${l.job.title} (nivel ${l.job.level + 1})` : 'Sin trabajo'}`,
  },
  {
    id: 'home_sweet', title: 'Hogar dulce hogar', icon: 'House', color: '#0E7C7B', difficulty: 1,
    desc: 'Lo básico de la vida adulta, en tiempo récord.',
    goal: 'Tené casa, auto, pareja casada y un hijo antes de los 40.',
    startAge: 22, deadlineAge: 40,
    won: (l) => l.assets.some((a) => a.kind === 'house') && l.assets.some((a) => a.kind === 'car') && married(l) && kids(l) >= 1,
    progress: (l) => `${l.assets.some((a) => a.kind === 'house') ? 'Casa ✓' : 'Casa ✗'} · ${l.assets.some((a) => a.kind === 'car') ? 'Auto ✓' : 'Auto ✗'} · ${married(l) ? 'Casado/a ✓' : 'Casado/a ✗'} · ${kids(l) >= 1 ? 'Hijo ✓' : 'Hijo ✗'}`,
  },
];

export const getScenario = (id: string): Scenario | undefined => SCENARIOS.find((s) => s.id === id);
