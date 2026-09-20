export const colors = {
  bg: '#0E0F13',
  surface: '#171922',
  surface2: '#20232F',
  border: '#2A2E3F',
  text: '#F2F3F7',
  muted: '#8C91A7',
  accent: '#7C5CFF',
  accentSoft: '#2A2450',
  good: '#3DDC97',
  bad: '#FF5C7A',
  warn: '#FFB020',
  happiness: '#FFC857',
  health: '#FF5C7A',
  smarts: '#5CC8FF',
  looks: '#C77DFF',
  money: '#3DDC97',
};

export const radius = { sm: 8, md: 14, lg: 20 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const toneColor = {
  good: colors.good,
  bad: colors.bad,
  neutral: colors.border,
  system: colors.accent,
} as const;
