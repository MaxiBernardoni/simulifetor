import type { Activity, Tone } from '../engine/types';

export interface IconStyle {
  icon: string;
  color: string;
}

// Ícono y color por etiqueta de evento. Se usa el primero que coincida, en este orden.
const TAG_ORDER: [string, IconStyle][] = [
  ['court', { icon: 'Gavel', color: '#7A5C2E' }],
  ['jail', { icon: 'Lock', color: '#5B6572' }],
  ['crime', { icon: 'VenetianMask', color: '#8A3B3B' }],
  ['justice', { icon: 'Scale', color: '#7A5C2E' }],
  ['health', { icon: 'HeartPulse', color: '#D64550' }],
  ['love', { icon: 'Heart', color: '#E0517A' }],
  ['rel', { icon: 'Users', color: '#9B5DE5' }],
  ['work', { icon: 'BriefcaseBusiness', color: '#0E7C7B' }],
  ['money', { icon: 'Coins', color: '#2A9D6F' }],
  ['family', { icon: 'House', color: '#E9A23B' }],
  ['school', { icon: 'GraduationCap', color: '#3A86B4' }],
  ['child', { icon: 'Baby', color: '#F4A261' }],
  ['teen', { icon: 'Zap', color: '#9B5DE5' }],
  ['tech', { icon: 'Smartphone', color: '#3A86B4' }],
  ['historical', { icon: 'Landmark', color: '#8C6D31' }],
  ['old', { icon: 'Hourglass', color: '#7A7466' }],
  ['random', { icon: 'Sparkles', color: '#E9A23B' }],
];

const DEFAULT_STYLE: IconStyle = { icon: 'Sparkles', color: '#E9A23B' };

export function styleForTags(tags?: string[]): IconStyle {
  if (!tags?.length) return DEFAULT_STYLE;
  for (const [tag, style] of TAG_ORDER) if (tags.includes(tag)) return style;
  return DEFAULT_STYLE;
}

export const TONE_STYLE: Record<Tone, IconStyle> = {
  good: { icon: 'CircleCheck', color: '#2A9D6F' },
  bad: { icon: 'TriangleAlert', color: '#D64550' },
  system: { icon: 'Flag', color: '#0E7C7B' },
  neutral: { icon: 'MessageCircle', color: '#7A7466' },
};

export const CATEGORY_STYLE: Record<Activity['category'], IconStyle & { label: string }> = {
  salud: { icon: 'Stethoscope', color: '#D64550', label: 'Salud' },
  ocio: { icon: 'PartyPopper', color: '#E76F51', label: 'Ocio' },
  social: { icon: 'Users', color: '#9B5DE5', label: 'Social' },
  estudio: { icon: 'BookOpen', color: '#3A86B4', label: 'Estudio' },
  dinero: { icon: 'Coins', color: '#2A9D6F', label: 'Dinero' },
  crimen: { icon: 'Skull', color: '#8A3B3B', label: 'Crimen' },
  trabajo: { icon: 'BriefcaseBusiness', color: '#0E7C7B', label: 'Trabajo' },
};

/** Ícono para un log del sistema según palabras clave del texto. */
export function styleForText(text: string, tone: Tone): IconStyle {
  const t = text.toLowerCase();
  if (t.includes('murió') || t.includes('moriste')) return { icon: 'Ghost', color: '#5B6572' };
  if (t.includes('universidad') || t.includes('secundaria') || t.includes('primaria') || t.includes('escuela')) return { icon: 'GraduationCap', color: '#3A86B4' };
  if (t.includes('ascendieron')) return { icon: 'TrendingUp', color: '#2A9D6F' };
  if (t.includes('trabajar como') || t.includes('trabajo') || t.includes('renunciaste')) return { icon: 'BriefcaseBusiness', color: '#0E7C7B' };
  if (t.includes('jubil')) return { icon: 'Hourglass', color: '#7A7466' };
  if (t.includes('prisión') || t.includes('condena') || t.includes('arrestaron')) return { icon: 'Lock', color: '#5B6572' };
  if (t.includes('heredás') || t.includes('préstamo') || t.includes('compraste') || t.includes('vendiste') || t.includes('inversiones')) return { icon: 'Coins', color: '#2A9D6F' };
  if (t.includes('quiebra')) return { icon: 'TrendingDown', color: '#D64550' };
  if (t.includes('logro')) return { icon: 'Trophy', color: '#E9A23B' };
  if (t.includes('naciste')) return { icon: 'Baby', color: '#F4A261' };
  return TONE_STYLE[tone];
}
