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

export type Mood = 'happy' | 'sad' | 'angry' | 'neutral' | 'shock';

export interface ArtOptions {
  mood?: Mood;
  shirt?: string;
  gray?: boolean;
  mask?: boolean;
}

/** Busto del personaje (coordenadas 0..100), sin fondo. Se usa en el avatar y dentro de las escenas. */
export function AvatarArt({ look, mood = 'happy', shirt, gray, mask }: { look: Look } & ArtOptions) {
  const skin = SKIN_TONES[look.skin] ?? SKIN_TONES[1];
  const eye = EYE_COLORS[look.eyes] ?? EYE_COLORS[0];
  const hc = gray ? '#9AA3AD' : (HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[0]);
  const h = hair(look.hairStyle, hc);
  const brow = hc === '#1B1B1F' ? '#000' : hc;
  const browPath =
    mood === 'angry' ? 'M35 36 L47 41.5 M53 41.5 L65 36' : mood === 'sad' ? 'M36 40 Q41 37 47 35.5 M53 35.5 Q59 37 64 40' : mood === 'shock' ? 'M37 35 Q42 32.5 47 35 M53 35 Q58 32.5 63 35' : 'M37 38 Q42 35.5 47 38 M53 38 Q58 35.5 63 38';
  const mouth =
    mood === 'happy' ? <Path d="M43 56 Q50 63 57 56" stroke="#7a2e2e" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    : mood === 'sad' ? <Path d="M44 60 Q50 55 56 60" stroke="#7a2e2e" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    : mood === 'angry' ? <Path d="M44 59 Q50 56 56 59" stroke="#7a2e2e" strokeWidth={2} fill="none" strokeLinecap="round" />
    : mood === 'shock' ? <Ellipse cx={50} cy={58} rx={3.2} ry={4} fill="#7a2e2e" />
    : <Path d="M45 58 L55 58" stroke="#7a2e2e" strokeWidth={1.8} fill="none" strokeLinecap="round" />;
  return (
    <G>
      {h.back}
      <Rect x={44} y={60} width={12} height={16} fill={skin} />
      <Path d="M14 100 Q14 74 50 72 Q86 74 86 100Z" fill={shirt ?? colors.accent} />
      <Circle cx={30} cy={46} r={4.5} fill={skin} />
      <Circle cx={70} cy={46} r={4.5} fill={skin} />
      <Ellipse cx={50} cy={44} rx={20} ry={23} fill={skin} />
      {h.front}
      {[42, 58].map((x) => (
        <G key={x}>
          <Ellipse cx={x} cy={45} rx={4.2} ry={mood === 'shock' ? 4.6 : 3.6} fill="#fff" />
          <Circle cx={x} cy={45} r={2.6} fill={eye} />
          <Circle cx={x} cy={45} r={1.1} fill="#111" />
        </G>
      ))}
      {mask ? (
        <G>
          <Path d="M31 40 Q50 34 69 40 L69 50 Q50 45 31 50Z" fill="#15151A" />
          {[42, 58].map((x) => (
            <G key={'m' + x}>
              <Ellipse cx={x} cy={45} rx={3.4} ry={2.6} fill="#fff" />
              <Circle cx={x} cy={45} r={1.6} fill="#111" />
            </G>
          ))}
        </G>
      ) : (
        <Path d={browPath} stroke={brow} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      )}
      <Path d="M50 47 L48.5 52 L51.5 52" stroke="rgba(0,0,0,0.25)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      {mouth}
    </G>
  );
}

export function Avatar({ look, size = 96 }: { look: Look; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={0} y={0} width={100} height={100} rx={22} fill={colors.surface2} />
      <AvatarArt look={look} />
    </Svg>
  );
}
