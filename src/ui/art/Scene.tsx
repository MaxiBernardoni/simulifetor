import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Line, Path, Polygon, Rect, Stop } from 'react-native-svg';
import type { Life, Person } from '../../engine/types';
import { AvatarArt } from '../Avatar';
import type { Mood } from '../Avatar';
import { lookForPerson } from '../components';
import { Icon } from '../Icon';
import { Bob, Drift, NATIVE, Shake } from '../anim';
import * as A from './props';
import { SCENE_KEYS } from '../../content/scenes';
import type { SceneKey } from '../../content/scenes';

export const SCENE_W = 320;
export const SCENE_H = 160;

type Fx = 'coins' | 'hearts' | 'confetti' | 'rain' | 'sparkles' | 'ghost' | 'sparks';
type Hat = 'hardhat' | 'party' | 'grad';

interface Cast {
  who: 'me' | 'other';
  x: number;
  y: number;
  s: number;
  mood?: Mood;
  flip?: boolean;
  gray?: boolean;
  mask?: boolean;
  hat?: Hat;
  shirt?: string;
}

interface SceneDef {
  bg: [string, string];
  back?: () => React.ReactNode;
  sky?: () => React.ReactNode;
  cast?: Cast[];
  front?: () => React.ReactNode;
  fx?: Fx;
}

const DAY: [string, string] = ['#BFE6F7', '#EAF7F2'];
const SUNSET: [string, string] = ['#FF9E7A', '#FFD9A0'];
const NIGHT: [string, string] = ['#1C2541', '#3A3F73'];
const WARM: [string, string] = ['#FFE8CC', '#F9CFA5'];
const COOL: [string, string] = ['#DDEBF5', '#B7CFE0'];
const DARK: [string, string] = ['#20242E', '#3B4252'];
const GOLD: [string, string] = ['#FFF0B8', '#F6C94C'];
const SAD: [string, string] = ['#A9B5C3', '#7E8B9B'];
const RAIN: [string, string] = ['#8C9BB0', '#5E6B80'];
const PINK: [string, string] = ['#FFD3E0', '#FFB6C9'];

const OTHER_SHIRT = '#E76F51';

export const SCENES: Record<SceneKey, SceneDef> = {
  family_home: {
    bg: DAY,
    sky: () => (
      <>
        <A.Sun x={276} y={34} s={0.9} />
        <A.Cloud x={70} y={30} />
        <A.Cloud x={205} y={22} s={1.1} />
      </>
    ),
    back: () => (
      <>
        <A.Hills />
        <A.House x={126} y={66} s={1.25} />
        <A.Tree x={280} y={92} s={1.1} />
      </>
    ),
    cast: [
      { who: 'me', x: 20, y: 72, s: 0.9 },
      { who: 'other', x: 212, y: 76, s: 0.85, flip: true, shirt: OTHER_SHIRT },
    ],
  },
  school: {
    bg: DAY,
    sky: () => (
      <>
        <A.Sun x={40} y={34} s={0.8} />
        <A.Cloud x={250} y={26} />
      </>
    ),
    back: () => (
      <>
        <A.Hills />
        <A.School x={150} y={58} s={1.2} />
      </>
    ),
    cast: [{ who: 'me', x: 12, y: 74, s: 0.9 }],
  },
  office: {
    bg: COOL,
    back: () => (
      <>
        <A.Office x={16} y={30} s={0.9} c="#7C93AD" />
        <A.Desk x={170} y={92} s={1.25} />
        <A.Ground y={146} c="#9FB7CA" />
      </>
    ),
    cast: [
      { who: 'me', x: 118, y: 74, s: 0.85 },
      { who: 'other', x: 236, y: 78, s: 0.8, flip: true, shirt: '#3B4252' },
    ],
  },
  construction: {
    bg: DAY,
    sky: () => (
      <>
        <A.Sun x={40} y={34} s={0.8} />
        <A.Cloud x={240} y={28} />
      </>
    ),
    back: () => (
      <>
        <A.Ground y={132} c="#C9B48A" />
        <A.Scaffold x={150} y={34} s={1.05} />
      </>
    ),
    cast: [{ who: 'me', x: 20, y: 72, s: 0.9, hat: 'hardhat', shirt: '#F2B233' }],
  },
  money_win: {
    bg: GOLD,
    back: () => (
      <>
        <A.MoneyBag x={250} y={104} s={1.3} />
        <A.CoinStack x={40} y={148} s={1.2} />
        <A.CoinStack x={286} y={150} s={0.9} />
      </>
    ),
    cast: [{ who: 'me', x: 110, y: 70, s: 0.95, mood: 'happy' }],
    fx: 'coins',
  },
  money_loss: {
    bg: SAD,
    back: () => (
      <>
        <A.Chart x={170} y={22} s={1.25} up={false} />
      </>
    ),
    cast: [{ who: 'me', x: 26, y: 72, s: 0.95, mood: 'sad' }],
    fx: 'rain',
  },
  love: {
    bg: PINK,
    back: () => <A.Heart x={160} y={54} s={2.6} c="#FF8FB1" />,
    cast: [
      { who: 'me', x: 46, y: 74, s: 0.9, mood: 'happy' },
      { who: 'other', x: 176, y: 74, s: 0.9, flip: true, shirt: OTHER_SHIRT },
    ],
    fx: 'hearts',
  },
  breakup: {
    bg: RAIN,
    back: () => <A.BrokenHeart x={160} y={48} s={1.9} />,
    cast: [
      { who: 'me', x: 6, y: 78, s: 0.85, mood: 'sad' },
      { who: 'other', x: 226, y: 78, s: 0.85, flip: true, mood: 'sad', shirt: OTHER_SHIRT },
    ],
    fx: 'rain',
  },
  wedding: {
    bg: SUNSET,
    back: () => (
      <>
        <A.Hills c1="#D9A46E" c2="#C98D58" />
        <A.Arch x={112} y={34} s={1} />
        <A.Ring x={160} y={140} s={1.4} />
      </>
    ),
    cast: [
      { who: 'me', x: 62, y: 76, s: 0.85, mood: 'happy' },
      { who: 'other', x: 168, y: 76, s: 0.85, flip: true, mood: 'happy', shirt: '#F4EEE2' },
    ],
    fx: 'confetti',
  },
  baby: {
    bg: ['#FFE9F0', '#FFD3DF'],
    back: () => (
      <>
        <A.Balloons x={50} y={40} s={1.1} />
        <A.Balloons x={272} y={44} s={1.1} />
        <A.Heart x={160} y={34} s={0.9} c="#FF8FB1" />
      </>
    ),
    cast: [{ who: 'me', x: 118, y: 94, s: 0.72, mood: 'happy' }],
    fx: 'hearts',
  },
  party: {
    bg: NIGHT,
    back: () => (
      <>
        <A.StringLights />
        <A.DiscoBall x={160} y={56} s={1.2} />
        <A.Stars
          items={[
            [30, 60],
            [290, 70],
            [60, 100, 1.4],
            [260, 110, 1.4],
          ]}
        />
      </>
    ),
    cast: [
      { who: 'me', x: 26, y: 76, s: 0.9, mood: 'happy', hat: 'party' },
      { who: 'other', x: 200, y: 76, s: 0.9, flip: true, mood: 'happy', shirt: OTHER_SHIRT },
    ],
    fx: 'confetti',
  },
  hospital: {
    bg: COOL,
    back: () => (
      <>
        <A.Hospital x={198} y={44} s={1.2} />
        <A.Heartbeat x={16} y={36} s={1.2} />
        <A.Ground y={146} c="#9FB7CA" />
      </>
    ),
    cast: [{ who: 'me', x: 60, y: 78, s: 0.85, mood: 'neutral' }],
  },
  street_crime: {
    bg: DARK,
    back: () => (
      <>
        <A.Skyline c="#171B26" lit="#FFD86B" />
        <A.Lamp x={44} y={46} s={1.2} />
        <A.Lamp x={276} y={50} s={1.1} />
      </>
    ),
    cast: [{ who: 'me', x: 110, y: 72, s: 0.95, mood: 'neutral', mask: true, shirt: '#2B2F3A' }],
  },
  court: {
    bg: WARM,
    back: () => (
      <>
        <A.Columns x={90} y={22} s={0.95} />
        <A.Justice x={280} y={44} s={1.1} />
        <A.Gavel x={40} y={110} s={1} />
      </>
    ),
    cast: [{ who: 'me', x: 118, y: 80, s: 0.85, mood: 'sad', shirt: '#3B4252' }],
  },
  prison: {
    bg: DARK,
    back: () => (
      <>
        <A.Ground y={140} c="#2A2F3A" />
      </>
    ),
    cast: [{ who: 'me', x: 110, y: 74, s: 0.95, mood: 'sad', shirt: '#E9A23B' }],
    front: () => <A.Bars c="#12151C" />,
  },
  historical: {
    bg: ['#EADFBF', '#CDB784'],
    back: () => (
      <>
        <A.Flag x={40} y={40} s={1.2} c="#B7523C" />
        <A.Newspaper x={120} y={26} s={1.35} />
        <A.Flag x={270} y={40} s={1.2} c="#3A86B4" />
      </>
    ),
  },
  old_age: {
    bg: SUNSET,
    sky: () => (
      <>
        <A.Sun x={58} y={50} s={1} />
        <A.Cloud x={230} y={28} c="#FFF1E0" />
      </>
    ),
    back: () => (
      <>
        <A.Hills c1="#9ACB86" c2="#7FB574" />
        <A.Tree x={276} y={76} s={1.4} />
        <A.Bench x={130} y={112} s={1.2} />
      </>
    ),
    cast: [{ who: 'me', x: 112, y: 62, s: 0.95, gray: true, mood: 'happy' }],
  },
  playground: {
    bg: DAY,
    sky: () => (
      <>
        <A.Sun x={280} y={34} s={0.9} />
        <A.Cloud x={70} y={26} />
      </>
    ),
    back: () => (
      <>
        <A.Hills />
        <A.Swing x={232} y={56} s={1.15} />
        <A.Ball x={60} y={134} s={1} />
      </>
    ),
    cast: [{ who: 'me', x: 110, y: 78, s: 0.82, mood: 'happy' }],
  },
  tech: {
    bg: ['#CFE3FF', '#9DBFF0'],
    back: () => (
      <>
        <A.Phone x={228} y={24} s={1.4} />
        <A.Stars
          items={[
            [40, 30],
            [90, 60, 1.4],
            [190, 40],
          ]}
        />
      </>
    ),
    cast: [{ who: 'me', x: 36, y: 76, s: 0.9, mood: 'shock' }],
    fx: 'sparkles',
  },
  travel: {
    bg: ['#7FD0F5', '#D6F1FB'],
    sky: () => (
      <>
        <A.Sun x={276} y={36} s={0.9} />
        <A.Cloud x={54} y={34} />
        <A.Plane x={150} y={38} s={1} />
      </>
    ),
    back: () => (
      <>
        <A.Ground y={136} c="#F2D9A0" />
        <A.Palm x={262} y={84} s={1.2} />
      </>
    ),
    cast: [{ who: 'me', x: 92, y: 80, s: 0.85, mood: 'happy' }],
  },
  mystery: {
    bg: ['#2A1B4A', '#5B3F8A'],
    back: () => (
      <>
        <A.Stars
          items={[
            [30, 30],
            [80, 70, 1.4],
            [150, 24],
            [290, 30],
            [270, 120, 1.4],
          ]}
        />
        <A.Envelope x={244} y={80} s={1.4} />
        <A.Question x={190} y={72} s={0.9} />
      </>
    ),
    cast: [{ who: 'me', x: 20, y: 76, s: 0.9, mood: 'shock' }],
    fx: 'sparkles',
  },
  graveyard: {
    bg: NIGHT,
    back: () => (
      <>
        <A.Moon x={262} y={36} s={1.1} />
        <A.Stars
          items={[
            [30, 30],
            [90, 50, 1.4],
            [170, 26],
            [220, 62, 1.4],
          ]}
        />
        <A.Ground y={128} c="#232C40" />
        <A.Tombstone x={70} y={100} s={1.2} />
        <A.Tombstone x={160} y={106} s={1} />
        <A.Tombstone x={250} y={100} s={1.2} />
      </>
    ),
    fx: 'ghost',
  },
  car: {
    bg: SUNSET,
    sky: () => (
      <>
        <A.Sun x={266} y={50} s={1} />
        <A.Cloud x={70} y={28} c="#FFF1E0" />
      </>
    ),
    back: () => (
      <>
        <A.Hills c1="#B4C97A" c2="#98B366" />
        <A.Road y={118} />
        <A.Car x={110} y={92} s={1.5} />
      </>
    ),
  },
  bank: {
    bg: ['#DCE6F2', '#B7C7DD'],
    back: () => (
      <>
        <A.Columns x={104} y={20} s={0.95} c="#F1F4F8" />
        <A.CoinStack x={40} y={140} s={1.2} />
        <A.CoinStack x={290} y={142} s={1} />
      </>
    ),
    cast: [{ who: 'me', x: 2, y: 84, s: 0.8, mood: 'neutral', shirt: '#3B4252' }],
  },
  graduation: {
    bg: GOLD,
    back: () => (
      <>
        <A.Diploma x={54} y={130} s={1.3} />
        <A.Spark x={44} y={40} s={0.9} />
        <A.Spark x={286} y={54} s={1.1} />
      </>
    ),
    cast: [{ who: 'me', x: 110, y: 70, s: 0.95, mood: 'happy', hat: 'grad', shirt: '#2B3440' }],
    fx: 'confetti',
  },
  gym: {
    bg: ['#3A4453', '#252B36'],
    back: () => (
      <>
        <A.Ground y={140} c="#1C212B" />
        <A.Dumbbell x={46} y={126} s={1.3} />
        <A.Dumbbell x={276} y={122} s={1.5} />
      </>
    ),
    cast: [{ who: 'me', x: 110, y: 72, s: 0.95, mood: 'angry', shirt: '#E76F51' }],
  },
  casino: {
    bg: ['#0F4D3A', '#1C7A58'],
    back: () => (
      <>
        <A.Dice x={52} y={56} s={1.4} />
        <A.Cards x={268} y={60} s={1.3} />
        <A.CoinStack x={226} y={148} s={1.1} />
        <A.Stars
          items={[
            [110, 24],
            [210, 30],
          ]}
        />
      </>
    ),
    cast: [{ who: 'me', x: 110, y: 74, s: 0.9, mood: 'shock' }],
    fx: 'sparkles',
  },
  therapy: {
    bg: ['#EADFF5', '#D3C4EA'],
    back: () => (
      <>
        <A.Ground y={144} c="#C6B4DD" />
        <A.Sofa x={188} y={92} s={1.2} />
        <A.Plant x={40} y={90} s={1.2} />
      </>
    ),
    cast: [{ who: 'me', x: 96, y: 78, s: 0.85, mood: 'neutral' }],
    fx: 'hearts',
  },
  friends: {
    bg: DAY,
    sky: () => (
      <>
        <A.Sun x={40} y={34} s={0.8} />
        <A.Cloud x={250} y={26} />
      </>
    ),
    back: () => (
      <>
        <A.Hills />
        <A.Tree x={286} y={92} s={1.1} />
      </>
    ),
    cast: [
      { who: 'me', x: 34, y: 74, s: 0.9, mood: 'happy' },
      { who: 'other', x: 168, y: 74, s: 0.9, flip: true, mood: 'happy', shirt: OTHER_SHIRT },
    ],
  },
  fight: {
    bg: ['#7B2D3A', '#C24D4D'],
    back: () => (
      <>
        <A.Spark x={160} y={56} s={2} c="#FFD75E" />
        <A.Spark x={130} y={90} s={0.8} c="#FFF1B0" />
        <A.Spark x={196} y={94} s={0.8} c="#FFF1B0" />
      </>
    ),
    cast: [
      { who: 'me', x: 14, y: 76, s: 0.88, mood: 'angry' },
      { who: 'other', x: 216, y: 76, s: 0.88, flip: true, mood: 'angry', shirt: OTHER_SHIRT },
    ],
    fx: 'sparks',
  },
  pet: {
    bg: DAY,
    sky: () => (
      <>
        <A.Sun x={280} y={34} s={0.9} />
        <A.Cloud x={70} y={28} />
      </>
    ),
    back: () => (
      <>
        <A.Hills />
        <A.Paw x={46} y={58} s={1.3} />
        <A.Paw x={90} y={40} s={0.9} />
        <A.Paw x={270} y={70} s={1.2} />
        <A.Ball x={250} y={136} s={1} />
      </>
    ),
    cast: [{ who: 'me', x: 110, y: 76, s: 0.88, mood: 'happy' }],
    fx: 'hearts',
  },
  study: {
    bg: WARM,
    back: () => (
      <>
        <A.Ground y={144} c="#E6B98B" />
        <A.Books x={262} y={140} s={1.3} />
        <A.Lamp x={44} y={58} s={1.1} />
      </>
    ),
    cast: [{ who: 'me', x: 106, y: 76, s: 0.9, mood: 'neutral' }],
  },
  random: {
    bg: ['#FFF3D6', '#FFD79A'],
    back: () => (
      <>
        <A.Spark x={44} y={44} s={1.1} />
        <A.Spark x={282} y={40} s={0.9} c="#FFB020" />
        <A.Spark x={248} y={112} s={0.7} />
      </>
    ),
    cast: [{ who: 'me', x: 110, y: 72, s: 0.95, mood: 'happy' }],
    fx: 'sparkles',
  },
};

export { SCENE_KEYS };

// ───────── Sombreros ─────────
function HatArt({ hat }: { hat: Hat }) {
  if (hat === 'hardhat')
    return (
      <G>
        <Path d="M27 36 Q50 2 73 36 Z" fill="#F2B233" />
        <Rect x={24} y={34} width={52} height={5} rx={2} fill="#D99A1E" />
      </G>
    );
  if (hat === 'party')
    return (
      <G>
        <Polygon points="50,-6 37,26 63,26" fill="#E0517A" />
        <Path d="M42 14 L58 14 M39 22 L61 22" stroke="#FFD75E" strokeWidth={2.5} />
        <Circle cx={50} cy={-6} r={4.5} fill="#FFD75E" />
      </G>
    );
  return (
    <G>
      <Polygon points="50,12 84,25 50,38 16,25" fill="#2B3440" />
      <Rect x={34} y={30} width={32} height={9} rx={3} fill="#3A4453" />
      <Line x1={80} y1={26} x2={80} y2={44} stroke="#F2B233" strokeWidth={2.5} />
      <Circle cx={80} cy={46} r={3.5} fill="#F2B233" />
    </G>
  );
}

// ───────── Partículas ─────────
const CONFETTI = ['#E0517A', '#F2B233', '#4FA3E0', '#5DB56A', '#9B5DE5'];

function Particle({ fx, i, h }: { fx: Fx; i: number; h: number }) {
  const v = useRef(new Animated.Value(0)).current;
  const left = ((i * 47 + 13) % 92) / 100;
  const dur = fx === 'rain' ? 900 + (i % 4) * 150 : fx === 'sparkles' || fx === 'sparks' ? 1200 + (i % 3) * 300 : 2600 + (i % 5) * 380;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay((i * 317) % 1400),
        Animated.timing(v, {
          toValue: 1,
          duration: dur,
          easing: fx === 'sparkles' || fx === 'sparks' ? Easing.inOut(Easing.sin) : Easing.linear,
          useNativeDriver: NATIVE,
        }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, i, dur, fx]);

  const rises = fx === 'hearts' || fx === 'ghost';
  const twinkles = fx === 'sparkles' || fx === 'sparks';
  const translateY = twinkles ? 0 : v.interpolate({ inputRange: [0, 1], outputRange: rises ? [h + 10, -30] : [-30, h + 10] });
  const opacity = twinkles
    ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] })
    : v.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] });
  const scale = twinkles ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1.1, 0.4] }) : 1;
  const rotate = fx === 'confetti' ? v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 + i * 40}deg`] }) : '0deg';
  const top = twinkles ? ((i * 29 + 8) % 70) + 6 : 0;
  const sway = fx === 'hearts' || fx === 'ghost' ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 10, -6] }) : 0;

  let body: React.ReactNode;
  if (fx === 'confetti')
    body = <View style={{ width: 7, height: 12, backgroundColor: CONFETTI[i % CONFETTI.length], borderRadius: 1.5 }} />;
  else if (fx === 'rain') body = <View style={{ width: 2, height: 16, backgroundColor: 'rgba(230,240,255,0.7)', borderRadius: 1 }} />;
  else if (fx === 'coins') body = <Icon name="Coins" size={20} color="#E9A23B" />;
  else if (fx === 'hearts') body = <Icon name="Heart" size={14 + (i % 3) * 5} color={i % 2 ? '#E0517A' : '#FF8FB1'} />;
  else if (fx === 'ghost') body = <Icon name="Ghost" size={20 + (i % 2) * 8} color="rgba(255,255,255,0.75)" />;
  else if (fx === 'sparks') body = <Icon name="Zap" size={16} color="#FFD75E" />;
  else body = <Icon name="Sparkles" size={14 + (i % 3) * 4} color="#FFD75E" />;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${Math.round(left * 100)}%`,
        top,
        opacity,
        transform: [{ translateY }, { translateX: sway }, { scale }, { rotate }],
      }}
    >
      {body}
    </Animated.View>
  );
}

const FX_COUNT: Record<Fx, number> = { coins: 9, hearts: 8, confetti: 16, rain: 22, sparkles: 8, ghost: 4, sparks: 7 };

// ───────── Personajes ─────────
function otherFor(life: Life, target?: Person): Person | undefined {
  if (target) return target;
  for (const k of ['partner', 'friend', 'mother', 'father', 'sibling', 'child', 'ex'] as const) {
    const p = life.people.find((x) => x.alive && x.kind === k);
    if (p) return p;
  }
  return undefined;
}

let uid = 0;

export function Scene({
  scene,
  life,
  target,
  height = 150,
  shake,
  animated = true,
}: {
  scene?: string;
  life: Life;
  target?: Person;
  height?: number;
  shake?: boolean;
  animated?: boolean;
}) {
  const def = SCENES[(scene ?? 'random') as SceneKey] ?? SCENES.random;
  const id = useMemo(() => `sc${uid++}`, []);
  const other = otherFor(life, target);

  const svgProps = { width: '100%', height: '100%', viewBox: `0 0 ${SCENE_W} ${SCENE_H}`, preserveAspectRatio: 'xMidYMid slice' } as const;

  const chars = (
    <Svg {...svgProps}>
      {(def.cast ?? []).map((c, i) => {
        const p = c.who === 'me' ? undefined : other;
        if (c.who === 'other' && !p) return null;
        const look = c.who === 'me' ? life.look : lookForPerson(p!, life);
        const tf = c.flip ? `translate(${c.x + 100 * c.s} ${c.y}) scale(${-c.s} ${c.s})` : `translate(${c.x} ${c.y}) scale(${c.s})`;
        return (
          <G key={i} transform={tf}>
            <AvatarArt
              look={look}
              mood={c.mood ?? 'happy'}
              shirt={c.shirt}
              gray={c.gray || (c.who === 'other' && p!.age >= 65)}
              mask={c.mask}
            />
            {c.hat ? <HatArt hat={c.hat} /> : null}
          </G>
        );
      })}
    </Svg>
  );

  const body = (
    <View style={[s.wrap, { height }]}>
      <Svg {...svgProps} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={def.bg[0]} />
            <Stop offset="1" stopColor={def.bg[1]} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={`url(#${id}g)`} />
        {def.back?.()}
      </Svg>
      {def.sky ? (
        <View style={StyleSheet.absoluteFill}>
          {animated ? (
            <Drift amp={10} style={StyleSheet.absoluteFill}>
              <Svg {...svgProps}>{def.sky()}</Svg>
            </Drift>
          ) : (
            <Svg {...svgProps}>{def.sky()}</Svg>
          )}
        </View>
      ) : null}
      <View style={StyleSheet.absoluteFill}>
        {animated ? (
          <Bob amp={2.5} style={StyleSheet.absoluteFill}>
            {chars}
          </Bob>
        ) : (
          chars
        )}
      </View>
      {def.front ? (
        <Svg {...svgProps} style={StyleSheet.absoluteFill}>
          {def.front()}
        </Svg>
      ) : null}
      {animated && def.fx
        ? Array.from({ length: FX_COUNT[def.fx] }).map((_, i) => <Particle key={i} fx={def.fx!} i={i} h={height} />)
        : null}
    </View>
  );

  return animated ? <Shake active={!!shake}>{body}</Shake> : body;
}

const s = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: '#ddd' },
});
