export const colors = {
  // Paleta propia: verde petróleo, coral y crema.
  bg: '#FBF7F0',
  surface: '#FFFFFF',
  surface2: '#EFE9DD',
  border: '#E2D9C8',
  text: '#26323A',
  muted: '#7A7466',
  accent: '#0E7C7B',
  accentSoft: '#D5ECEA',
  good: '#2A9D6F',
  bad: '#D64550',
  warn: '#E9A23B',
  // Barras y chrome
  header: '#0E7C7B',
  headerText: '#FFF0C7',
  nav: '#12343B',
  navIcon: '#F4A261',
  ageButton: '#E76F51',
  nameBlue: '#0B5F5E',
  infoBar: '#F2EADB',
  track: '#E6EBE6',
  // Stats
  happiness: '#F4A261',
  health: '#D64550',
  smarts: '#3A86B4',
  looks: '#9B5DE5',
  money: '#2A9D6F',
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
