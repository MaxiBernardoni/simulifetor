export const SKIN_TONES = ['#FDE0CB', '#F5C9A6', '#E0A97C', '#C68863', '#9C6644', '#6B4429'];
export const EYE_COLORS = ['#5B3A1E', '#2E7D4F', '#3B7DD8', '#7A8B99', '#8A6D2F', '#22222B'];
export const HAIR_COLORS = ['#1B1B1F', '#4A2C17', '#8A5A2B', '#C99A4A', '#E6D3A3', '#B33A2E', '#9AA3AD', '#7C5CFF'];

export type HairGender = 'M' | 'F';

/** Peinados. El índice es el id guardado en `Look.hairStyle` (no reordenar: hay partidas guardadas). Cada uno es de hombre o de mujer. */
export const HAIRS: { name: string; g: HairGender }[] = [
  { name: 'Corto', g: 'M' }, // 0
  { name: 'Largo', g: 'F' }, // 1
  { name: 'Rulos', g: 'F' }, // 2
  { name: 'Pelado', g: 'M' }, // 3
  { name: 'Cresta', g: 'M' }, // 4
  { name: 'Rodete', g: 'F' }, // 5
  { name: 'Carré', g: 'F' }, // 6
  { name: 'Afro', g: 'M' }, // 7
  { name: 'Jopo', g: 'M' }, // 8
  { name: 'Raya al costado', g: 'M' }, // 9
  { name: 'Rulos cortos', g: 'M' }, // 10
  { name: 'Despeinado', g: 'M' }, // 11
  { name: 'Entradas', g: 'M' }, // 12
  { name: 'Trenza', g: 'F' }, // 13
  { name: 'Colitas', g: 'F' }, // 14
  { name: 'Pixie', g: 'F' }, // 15
  { name: 'Ondas largas', g: 'F' }, // 16
  { name: 'Flequillo', g: 'F' }, // 17
  { name: 'Cola alta', g: 'F' }, // 18
  { name: 'Afro rizado', g: 'F' }, // 19
];

export const HAIR_STYLES = HAIRS.map((h) => h.name);

export const hairGenderOf = (style: number): HairGender => HAIRS[style]?.g ?? 'M';

/** Ids de peinados disponibles para un género. */
export const hairStylesFor = (g: HairGender): number[] => HAIRS.map((h, i) => (h.g === g ? i : -1)).filter((i) => i >= 0);

const KID_HAIR: Record<HairGender, number[]> = { M: [0, 9, 10], F: [6, 14, 15, 13] };
export const kidHairStyles = (g: HairGender): number[] => KID_HAIR[g];

// Equivalente más parecido en el otro género (para partidas viejas donde los peinados eran unisex).
const SWAP: Record<number, number> = {
  0: 15, 3: 15, 4: 18, 7: 19, 8: 17, 9: 6, 10: 2, 11: 1, 12: 15,
  1: 11, 2: 10, 5: 11, 6: 9, 13: 11, 14: 10, 15: 0, 16: 11, 17: 8, 18: 4, 19: 7,
};

/** Devuelve un peinado válido para el género: si ya lo es, el mismo; si no, su equivalente. */
export function hairForGender(style: number, g: HairGender): number {
  if (hairGenderOf(style) === g) return style;
  return SWAP[style] ?? hairStylesFor(g)[0];
}

export const EYE_NAMES = ['Marrón', 'Verde', 'Azul', 'Gris', 'Miel', 'Negro'];
export const SKIN_NAMES = ['Muy clara', 'Clara', 'Trigueña', 'Morena', 'Oscura', 'Muy oscura'];
