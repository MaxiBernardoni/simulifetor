import type { Life } from '../engine/types';
import { getCareer } from '../engine/registry';
import { netWorth } from '../engine/assets';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  check: (l: Life) => boolean;
}

const kids = (l: Life) => l.people.filter((p) => p.kind === 'child').length;
const isTop = (l: Life) => {
  const j = l.job;
  if (!j) return false;
  const c = getCareer(j.careerId);
  return !!c && j.level >= c.levels.length - 1;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'grad', title: 'Egresado/a', desc: 'Terminá la universidad.', icon: 'GraduationCap', check: (l) => !!l.flags.graduated },
  { id: 'top_job', title: 'En la cima', desc: 'Llegá al puesto más alto de una carrera.', icon: 'TrendingUp', check: isTop },
  { id: 'saver', title: 'Ahorrista', desc: 'Juntá $100.000 de patrimonio.', icon: 'Wallet', check: (l) => netWorth(l) >= 100000 },
  { id: 'millionaire', title: 'Millonario/a', desc: 'Llegá a $1.000.000 de patrimonio.', icon: 'Gem', check: (l) => netWorth(l) >= 1000000 },
  { id: 'homeowner', title: 'Casa propia', desc: 'Comprá una vivienda.', icon: 'House', check: (l) => l.assets.some((a) => a.kind === 'house') },
  { id: 'investor', title: 'Inversor/a', desc: 'Invertí en la bolsa.', icon: 'TrendingUp', check: (l) => l.invested > 0 },
  { id: 'bankrupt', title: 'Todo perdido', desc: 'Declarate en quiebra.', icon: 'Skull', check: (l) => !!l.flags.bankrupt },
  { id: 'married', title: 'Sí, quiero', desc: 'Casate.', icon: 'Heart', check: (l) => l.people.some((p) => p.kind === 'partner' && p.married) },
  { id: 'divorced', title: 'Página dada vuelta', desc: 'Divorciate.', icon: 'HeartCrack', check: (l) => !!l.flags.divorced },
  { id: 'parent', title: 'Padre/Madre', desc: 'Tené un hijo.', icon: 'Baby', check: (l) => kids(l) >= 1 },
  { id: 'big_family', title: 'Familia numerosa', desc: 'Tené 4 o más hijos.', icon: 'Users', check: (l) => kids(l) >= 4 },
  { id: 'convict', title: 'Antecedentes', desc: 'Andá preso.', icon: 'Lock', check: (l) => !!l.flags.criminal_record },
  { id: 'fugitive', title: 'Prófugo/a', desc: 'Escapate de la cárcel.', icon: 'Zap', check: (l) => !!l.flags.fugitive },
  { id: 'robber', title: 'El golpe del siglo', desc: 'Robá un banco con éxito.', icon: 'Landmark', check: (l) => !!l.flags.bank_robber },
  { id: 'murderer', title: 'Línea cruzada', desc: 'Cometé un homicidio.', icon: 'Skull', check: (l) => !!l.flags.murderer },
  { id: 'octo', title: 'Octogenario', desc: 'Llegá a los 80 años.', icon: 'Award', check: (l) => l.age >= 80 },
  { id: 'centenarian', title: 'Centenario', desc: 'Llegá a los 100 años.', icon: 'Award', check: (l) => l.age >= 100 },
  { id: 'early', title: 'Se fue temprano', desc: 'Morí antes de los 18.', icon: 'Ghost', check: (l) => !l.alive && l.age < 18 },
  { id: 'clean', title: 'Manos limpias', desc: 'Viví 60 años sin antecedentes.', icon: 'Check', check: (l) => l.age >= 60 && !l.flags.criminal_record },
];
