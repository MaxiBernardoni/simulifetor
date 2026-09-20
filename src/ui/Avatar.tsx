import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { Look } from '../engine/types';
import { EYE_COLORS, HAIR_COLORS, SKIN_TONES } from '../content/look';
import { colors } from './theme';

// Peinados: [detrás de la cabeza, delante]. Todo dibujado en un viewBox de 100x100.
function hair(style: number, c: string) {
  const fringe = <Path d="M29 44 Q28 19 50 19 Q72 19 71 44 Q64 31 50 31 Q36 31 29 44Z" fill={c} />;
  switch (style) {
    case 0: // corto
      return { back: null, front: fringe };
    case 1: // largo
      return {
        back: <Path d="M26 42 Q26 15 50 15 Q74 15 74 42 L77 80 L23 80Z" fill={c} />,
        front: fringe,
      };
    case 2: // rulos
      return {
        back: null,
        front: (
          <G fill={c}>
            {[30, 38, 46, 54, 62, 70].map((x, i) => (
              <Circle key={x} cx={x} cy={i % 2 ? 24 : 27} r={9} />
            ))}
            <Circle cx={31} cy={38} r={6} />
            <Circle cx={69} cy={38} r={6} />
          </G>
        ),
      };
    case 3: // pelado
      return { back: null, front: null };
    case 4: // cresta
      return { back: null, front: <Path d="M43 30 L45 8 L50 14 L55 8 L57 30Z" fill={c} /> };
    case 5: // rodete
      return { back: <Circle cx={50} cy={12} r={9} fill={c} />, front: fringe };
    case 6: // carré
      return {
        back: <Path d="M25 42 Q25 15 50 15 Q75 15 75 42 L75 60 L25 60Z" fill={c} />,
        front: fringe,
      };
    default: // afro
      return { back: <Circle cx={50} cy={34} r={31} fill={c} />, front: <Path d="M32 42 Q34 24 50 24 Q66 24 68 42 Q60 32 50 32 Q40 32 32 42Z" fill={c} /> };
  }
}

export function Avatar({ look, size = 96 }: { look: Look; size?: number }) {
  const skin = SKIN_TONES[look.skin] ?? SKIN_TONES[1];
  const eye = EYE_COLORS[look.eyes] ?? EYE_COLORS[0];
  const hc = HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[0];
  const h = hair(look.hairStyle, hc);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={0} y={0} width={100} height={100} rx={22} fill={colors.surface2} />
      {h.back}
      <Rect x={44} y={60} width={12} height={16} fill={skin} />
      <Path d="M14 100 Q14 74 50 72 Q86 74 86 100Z" fill={colors.accent} />
      <Circle cx={30} cy={46} r={4.5} fill={skin} />
      <Circle cx={70} cy={46} r={4.5} fill={skin} />
      <Ellipse cx={50} cy={44} rx={20} ry={23} fill={skin} />
      {h.front}
      {[42, 58].map((x) => (
        <G key={x}>
          <Ellipse cx={x} cy={45} rx={4.2} ry={3.6} fill="#fff" />
          <Circle cx={x} cy={45} r={2.6} fill={eye} />
          <Circle cx={x} cy={45} r={1.1} fill="#111" />
        </G>
      ))}
      <Path d="M37 38 Q42 35.5 47 38 M53 38 Q58 35.5 63 38" stroke={hc === '#1B1B1F' ? '#000' : hc} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Path d="M50 47 L48.5 52 L51.5 52" stroke="rgba(0,0,0,0.25)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <Path d="M44 57 Q50 62 56 57" stroke="#7a2e2e" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
