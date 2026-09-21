import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { Look } from '../engine/types';
import { EYE_COLORS, HAIR_COLORS, hairGenderOf, SKIN_TONES } from '../content/look';
import { colors } from './theme';

const CORAL = '#E76F51';
const NATIVE = Platform.OS !== 'web';

/** Aclara (amt > 0) u oscurece (amt < 0) un color hex. */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => {
    const t = amt >= 0 ? 255 : 0;
    return Math.round(v + (t - v) * Math.abs(amt));
  };
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// Peinados: [detrás de la cabeza, delante]. Todo dibujado en un viewBox de 100x100.
// `c` es el color base y `l` una versión más clara para los brillos.
function hair(style: number, c: string, l: string, d: string) {
  const fringe = <Path d="M29 44 Q28 19 50 19 Q72 19 71 44 Q64 31 50 31 Q36 31 29 44Z" fill={c} />;
  const shine = (p: string) => <Path d={p} stroke={l} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.45} />;
  const topShine = shine('M37 25 Q50 17.5 63 25');
  switch (style) {
    case 0: // Corto (H)
      return {
        back: null,
        front: (
          <G>
            <Path d="M28 42 Q26 17 50 16 Q74 17 72 42 Q68 30 58 28 Q50 33 40 28 Q32 30 28 42Z" fill={c} />
            <Path
              d="M40 28 Q44 22 50 24 M52 24 Q58 20 62 26"
              stroke={d}
              strokeWidth={1.2}
              fill="none"
              strokeLinecap="round"
              opacity={0.5}
            />
            {topShine}
          </G>
        ),
      };
    case 1: // Largo (M)
      return {
        back: <Path d="M25 42 Q24 14 50 14 Q76 14 75 42 L79 84 Q64 90 50 84 Q36 90 21 84Z" fill={c} />,
        front: (
          <G>
            <Path d="M28 44 Q27 18 50 17 Q73 18 72 44 Q62 26 46 27 Q34 30 28 44Z" fill={c} />
            {topShine}
            {shine('M29 56 Q27 70 30 80')}
          </G>
        ),
      };
    case 2: // Rulos (M)
      return {
        back: (
          <G fill={c}>
            {[52, 62, 72].map((y) => (
              <G key={y}>
                <Circle cx={25} cy={y} r={7} />
                <Circle cx={75} cy={y} r={7} />
              </G>
            ))}
          </G>
        ),
        front: (
          <G fill={c}>
            {[29, 37, 45, 53, 61, 69].map((x, i) => (
              <Circle key={x} cx={x} cy={i % 2 ? 22 : 26} r={9} />
            ))}
            <Circle cx={30} cy={37} r={6.5} />
            <Circle cx={70} cy={37} r={6.5} />
            <Circle cx={40} cy={17} r={3} fill={l} opacity={0.35} />
          </G>
        ),
      };
    case 3: // Pelado (H)
      return {
        back: null,
        front: <Path d="M38 24 Q50 18 62 24" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.28} />,
      };
    case 4: // Cresta (H)
      return {
        back: null,
        front: (
          <G>
            <Path d="M42 30 L42 12 L46 18 L50 6 L54 18 L58 12 L58 30Z" fill={c} />
            {shine('M50 10 L50 26')}
          </G>
        ),
      };
    case 5: // Rodete (M)
      return {
        back: (
          <G>
            <Circle cx={50} cy={11} r={10} fill={c} />
            <Path d="M43 8 Q50 3 57 8" stroke={l} strokeWidth={2} fill="none" opacity={0.4} strokeLinecap="round" />
          </G>
        ),
        front: (
          <G>
            {fringe}
            <Rect x={42} y={19} width={16} height={3.5} rx={1.7} fill={CORAL} />
            {topShine}
          </G>
        ),
      };
    case 6: // Carré (M)
      return {
        back: <Path d="M24 44 Q23 14 50 14 Q77 14 76 44 L76 64 Q76 69 70 67 L30 67 Q24 69 24 64Z" fill={c} />,
        front: (
          <G>
            <Path d="M29 42 Q28 18 50 17 Q72 18 71 42 L71 33 Q50 24 29 33Z" fill={c} />
            {shine('M34 24 Q50 18 66 24')}
          </G>
        ),
      };
    case 7: // Afro (H)
      return {
        back: <Circle cx={50} cy={34} r={31} fill={c} />,
        front: (
          <G>
            <Path d="M32 42 Q34 24 50 24 Q66 24 68 42 Q60 32 50 32 Q40 32 32 42Z" fill={c} />
            <Circle cx={36} cy={16} r={3.4} fill={l} opacity={0.3} />
            <Circle cx={60} cy={12} r={2.6} fill={l} opacity={0.3} />
          </G>
        ),
      };
    case 8: // Jopo (H)
      return {
        back: null,
        front: (
          <G>
            <Path d="M28 42 Q20 12 50 9 Q80 12 72 42 Q70 27 55 26 Q40 25 28 42Z" fill={c} />
            {shine('M32 22 Q42 12 58 13')}
            <Path d="M30 42 Q31 33 34 30" stroke={d} strokeWidth={1.4} fill="none" opacity={0.5} />
          </G>
        ),
      };
    case 9: // Raya al costado (H)
      return {
        back: null,
        front: (
          <G>
            <Path d="M28 43 Q26 17 50 16 Q74 17 72 43 Q71 31 61 27 Q46 23 36 30 Q30 34 28 43Z" fill={c} />
            <Path d="M40 18 Q40 25 33 31" stroke={d} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.6} />
            {shine('M46 20 Q58 18 66 26')}
          </G>
        ),
      };
    case 10: // Rulos cortos (H)
      return {
        back: null,
        front: (
          <G fill={c}>
            {[33, 41, 49, 57, 65].map((x, i) => (
              <Circle key={x} cx={x} cy={i % 2 ? 21 : 24} r={7.5} />
            ))}
            <Circle cx={29} cy={33} r={5.5} />
            <Circle cx={71} cy={33} r={5.5} />
            <Circle cx={31} cy={41} r={3.6} />
            <Circle cx={69} cy={41} r={3.6} />
            <Circle cx={45} cy={18} r={2.4} fill={l} opacity={0.4} />
          </G>
        ),
      };
    case 11: // Melena (H)
      return {
        back: <Path d="M25 42 Q24 13 50 13 Q76 13 75 42 L75 54 Q69 51 67 44 L33 44 Q31 51 25 54Z" fill={c} />,
        front: (
          <G>
            <Path d="M28 43 Q26 15 44 13 L50 8 L56 13 Q74 15 72 43 Q66 27 52 28 Q38 24 28 43Z" fill={c} />
            {shine('M32 22 Q50 13 68 22')}
          </G>
        ),
      };
    case 12: // Entradas (H)
      return {
        back: null,
        front: (
          <G>
            <Path
              d="M28 44 Q26 28 34 20 Q40 16 50 16 Q60 16 66 20 Q74 28 72 44 Q69 32 66 27 Q58 22 50 22 Q42 22 34 27 Q31 32 28 44Z"
              fill={c}
            />
            <Path d="M32 26 Q31 34 32 40 M68 26 Q69 34 68 40" stroke={d} strokeWidth={1.1} fill="none" opacity={0.4} />
          </G>
        ),
      };
    case 13: // Trenza (M)
      return {
        back: (
          <G>
            <Path d="M26 42 Q25 14 50 14 Q75 14 74 42 Q75 56 72 62Z" fill={c} />
            {[64, 70, 76, 82, 88].map((y, i) => (
              <Ellipse key={y} cx={73 - i * 0.4} cy={y} rx={5} ry={4} fill={i % 2 ? d : c} />
            ))}
            <Circle cx={71} cy={94} r={3.5} fill={CORAL} />
          </G>
        ),
        front: (
          <G>
            <Path d="M28 44 Q27 18 50 17 Q73 18 72 44 Q62 27 50 28 Q36 28 28 44Z" fill={c} />
            {topShine}
          </G>
        ),
      };
    case 14: // Colitas (M)
      return {
        back: (
          <G>
            <Path d="M28 40 Q16 44 14 60 Q13 74 20 84 Q22 70 28 62Z M72 40 Q84 44 86 60 Q87 74 80 84 Q78 70 72 62Z" fill={c} />
            <Circle cx={25} cy={40} r={3.6} fill={CORAL} />
            <Circle cx={75} cy={40} r={3.6} fill={CORAL} />
          </G>
        ),
        front: (
          <G>
            {fringe}
            {topShine}
          </G>
        ),
      };
    case 15: // Pixie (M)
      return {
        back: null,
        front: (
          <G>
            <Path d="M28 44 Q24 15 50 13 Q76 15 72 44 Q70 31 60 26 L44 30 Q34 31 28 44Z" fill={c} />
            <Path d="M38 27 Q52 37 68 24" stroke={c} strokeWidth={4} fill="none" strokeLinecap="round" />
            {shine('M34 22 Q50 13 66 21')}
          </G>
        ),
      };
    case 16: // Ondas largas (M)
      return {
        back: <Path d="M24 42 Q22 13 50 13 Q78 13 76 42 Q83 56 76 66 Q72 76 79 90 L21 90 Q28 76 24 66 Q17 56 24 42Z" fill={c} />,
        front: (
          <G>
            <Path d="M50 16 Q27 21 28 46 Q34 28 50 27 Q66 28 72 46 Q73 21 50 16Z" fill={c} />
            {shine('M30 60 Q26 68 30 76 M70 60 Q74 68 70 76')}
            {shine('M36 24 Q50 16 64 24')}
          </G>
        ),
      };
    case 17: // Flequillo (M)
      return {
        back: <Path d="M25 42 Q24 14 50 14 Q76 14 75 42 L76 78 L24 78Z" fill={c} />,
        front: (
          <G>
            <Path d="M28 44 Q27 16 50 15 Q73 16 72 44 L72 35 Q50 27 28 35Z" fill={c} />
            {shine('M34 22 Q50 16 66 22')}
            <Path d="M40 28 L38 35 M50 28 L50 35 M60 28 L62 35" stroke={d} strokeWidth={1.1} opacity={0.45} />
          </G>
        ),
      };
    case 18: // Cola alta (M)
      return {
        back: (
          <G>
            <Path d="M52 14 Q92 6 88 44 Q86 62 76 72 Q80 50 68 30Z" fill={c} />
            <Path d="M78 28 Q84 44 78 62" stroke={l} strokeWidth={2} fill="none" opacity={0.35} strokeLinecap="round" />
          </G>
        ),
        front: (
          <G>
            {fringe}
            <Circle cx={60} cy={20} r={3.6} fill={CORAL} />
            {topShine}
          </G>
        ),
      };
    default: // 19 Afro rizado (M)
      return {
        back: <Circle cx={50} cy={38} r={35} fill={c} />,
        front: (
          <G>
            <Path d="M30 44 Q30 22 50 21 Q70 22 70 44 Q62 31 50 31 Q38 31 30 44Z" fill={c} />
            <Circle cx={30} cy={16} r={3.6} fill={l} opacity={0.3} />
            <Circle cx={58} cy={9} r={2.8} fill={l} opacity={0.3} />
            <Circle cx={74} cy={26} r={2.4} fill={l} opacity={0.3} />
          </G>
        ),
      };
  }
}

export type Mood = 'happy' | 'sad' | 'angry' | 'neutral' | 'shock';

export interface ArtOptions {
  mood?: Mood;
  shirt?: string;
  gray?: boolean;
  mask?: boolean;
  /** Ojos cerrados (para el parpadeo). */
  blink?: boolean;
}

/** Busto del personaje (coordenadas 0..100), sin fondo. Se usa en el avatar y dentro de las escenas. */
export function AvatarArt({ look, mood = 'happy', shirt, gray, mask, blink }: { look: Look } & ArtOptions) {
  const female = hairGenderOf(look.hairStyle) === 'F';
  const skin = SKIN_TONES[look.skin] ?? SKIN_TONES[1];
  const eye = EYE_COLORS[look.eyes] ?? EYE_COLORS[0];
  const hc = gray ? '#9AA3AD' : (HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[0]);
  const hl = shade(hc, 0.35);
  const hd = shade(hc, -0.35);
  const h = hair(look.hairStyle, hc, hl, hd);
  const brow = hc === '#1B1B1F' ? '#000' : shade(hc, -0.15);
  const skinDark = shade(skin, -0.14);
  const lash = '#2A1A14';
  const shirtColor = shirt ?? colors.accent;
  const lip = female ? '#B8404D' : '#7A2E2E';

  const browPath =
    mood === 'angry'
      ? 'M35 38 L46 42.5 M54 42.5 L65 38'
      : mood === 'sad'
        ? 'M36 41.5 Q41 39 46.5 37.5 M53.5 37.5 Q59 39 64 41.5'
        : mood === 'shock'
          ? 'M37 36.5 Q41.5 34 46 36.5 M54 36.5 Q58.5 34 63 36.5'
          : female
            ? 'M36.5 38.5 Q41 35.8 46 38.2 M54 38.2 Q59 35.8 63.5 38.5'
            : 'M36.5 39 Q41 36.5 46 38.8 M54 38.8 Q59 36.5 63.5 39';

  const mouth =
    mood === 'happy' ? (
      <Path d="M43 56 Q50 64.5 57 56 Q50 59.5 43 56Z" fill="#8A2F3A" stroke="#8A2F3A" strokeWidth={1.2} strokeLinejoin="round" />
    ) : mood === 'sad' ? (
      <Path d="M44.5 61 Q50 56 55.5 61" stroke={lip} strokeWidth={2} fill="none" strokeLinecap="round" />
    ) : mood === 'angry' ? (
      <Path d="M44.5 60 Q50 57 55.5 60" stroke={lip} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    ) : mood === 'shock' ? (
      <Ellipse cx={50} cy={59} rx={3} ry={4} fill="#6b2430" />
    ) : (
      <Path d="M45 58.5 Q50 61 55 58.5" stroke={lip} strokeWidth={2} fill="none" strokeLinecap="round" />
    );

  const eyes = [41, 59].map((x, i) => {
    const outer = i === 0 ? -1 : 1;
    if (blink) {
      return (
        <Path key={x} d={`M${x - 3.6} 46.8 Q${x} 49.2 ${x + 3.6} 46.8`} stroke={lash} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      );
    }
    return (
      <G key={x}>
        <Ellipse cx={x} cy={47} rx={mood === 'shock' ? 3.2 : 2.7} ry={mood === 'shock' ? 4.2 : 3.4} fill={shade(eye, -0.55)} />
        <Ellipse cx={x} cy={47.6} rx={1.9} ry={2.4} fill={eye} opacity={0.75} />
        <Circle cx={x - 0.9} cy={45.8} r={1} fill="#fff" />
        {female ? (
          <Path d={`M${x + outer * 2.6} 44.8 L${x + outer * 4.6} 43.4`} stroke={lash} strokeWidth={1.3} strokeLinecap="round" />
        ) : null}
      </G>
    );
  });

  return (
    <G>
      {h.back}
      {/* cuello y torso: hombros anchos, remera plana con cuello */}
      <Rect x={43} y={60} width={14} height={18} rx={4} fill={skinDark} />
      <Path d="M8 100 Q8 78 33 73 Q42 82 50 82 Q58 82 67 73 Q92 78 92 100Z" fill={shirtColor} />
      <Path d="M8 100 Q8 78 33 73 L36 80 Q20 84 18 100Z" fill="#000" opacity={0.08} />
      <Path d="M39 73.5 Q50 90 61 73.5 Q50 81 39 73.5Z" fill={skinDark} />
      <Path d="M33 73 Q42 82 50 82 Q58 82 67 73" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.5} />
      {/* orejas */}
      <Circle cx={28.5} cy={48} r={4.4} fill={skin} />
      <Circle cx={71.5} cy={48} r={4.4} fill={skin} />
      {/* cabeza redonda y grande */}
      <Ellipse cx={50} cy={45} rx={female ? 21 : 21.8} ry={23.4} fill={skin} />
      <Path d="M67 32 Q74 46 64 64 Q75 56 72 40Z" fill={skinDark} opacity={0.28} />
      {mood !== 'angry' ? (
        <G opacity={mood === 'shock' ? 0.15 : 0.4}>
          <Ellipse cx={34.5} cy={54} rx={4.2} ry={2.6} fill="#FF7B86" />
          <Ellipse cx={65.5} cy={54} rx={4.2} ry={2.6} fill="#FF7B86" />
        </G>
      ) : null}
      {h.front}
      {mask ? (
        <G>
          <Path d="M30 41 Q50 35 70 41 L70 52 Q50 47 30 52Z" fill="#15151A" />
          {[41, 59].map((x) => (
            <G key={'m' + x}>
              <Ellipse cx={x} cy={47} rx={3.2} ry={2.4} fill="#fff" />
              <Circle cx={x} cy={47} r={1.5} fill="#111" />
            </G>
          ))}
        </G>
      ) : (
        <G>
          {eyes}
          <Path d={browPath} stroke={brow} strokeWidth={female ? 1.9 : 2.6} fill="none" strokeLinecap="round" />
        </G>
      )}
      <Path d="M48.2 51.5 Q50 53.6 51.8 51.5" stroke={skinDark} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      {mouth}
    </G>
  );
}

/** Parpadeo aleatorio cada 2–5 s. */
function useBlink(on: boolean): boolean {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!on) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(
        () => {
          if (!alive) return;
          setClosed(true);
          t = setTimeout(() => {
            if (!alive) return;
            setClosed(false);
            loop();
          }, 130);
        },
        2200 + Math.random() * 2800,
      );
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [on]);
  return closed;
}

/** Retrato del personaje. Con `animated` respira y parpadea (usalo en pocos lugares). */
export function Avatar({ look, size = 96, animated = false }: { look: Look; size?: number; animated?: boolean }) {
  const blink = useBlink(animated);
  const breath = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
        Animated.timing(breath, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, breath]);
  const ty = breath.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.02] });
  const sc = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] });
  const svg = (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={0} y={0} width={100} height={100} rx={22} fill="#F1E9D8" />
      <AvatarArt look={look} blink={blink} />
    </Svg>
  );
  if (!animated) return svg;
  return <Animated.View style={{ transform: [{ translateY: ty }, { scale: sc }] }}>{svg}</Animated.View>;
}
