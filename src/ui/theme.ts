export const colors = {
  // Base clara, estilo simulador de vida clásico.
  bg: '#F0F0F0',
  surface: '#FFFFFF',
  surface2: '#E4E8EE',
  border: '#D3D8E0',
  text: '#2B2F36',
  muted: '#6B7280',
  accent: '#0B5DBB',
  accentSoft: '#DCE8F7',
  good: '#2E9E3A',
  bad: '#D9342B',
  warn: '#E08A00',
  // Barras y chrome
  header: '#E5361C',
  headerText: '#FFD21E',
  nav: '#0A4F9E',
  navIcon: '#1FC8D0',
  ageButton: '#2E9E3A',
  nameBlue: '#0A4FA0',
  infoBar: '#E2E4E6',
  track: '#D8E3F0',
  // Stats
  happiness: '#F2B01E',
  health: '#E5484D',
  smarts: '#2F80ED',
  looks: '#A855F7',
  money: '#2E9E3A',
};

export const radius = { sm: 8, md: 14, lg: 20 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const toneColor = {
  good: colors.good,
  bad: colors.bad,
  neutral: colors.border,
  system: colors.accent,
} as const;

/** Color de barra según el valor, como en los simuladores de vida. */
export const barColor = (v: number) => (v >= 45 ? colors.good : v >= 25 ? colors.warn : colors.bad);
