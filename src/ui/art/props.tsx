import React from 'react';
import { Circle, Ellipse, G, Line, Path, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';

// Piezas de arte vectorial en un lienzo de 320x160. Cada una se posiciona con (x, y) y escala s.
interface P {
  x: number;
  y: number;
  s?: number;
  c?: string;
}

const T = ({ x, y, s = 1, children }: P & { children: React.ReactNode }) => (
  <G transform={`translate(${x} ${y}) scale(${s})`}>{children}</G>
);

export const Sun = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <Line key={a} x1={0} y1={-22} x2={0} y2={-30} stroke="#FFC83D" strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${a})`} />
    ))}
    <Circle r={17} fill="#FFD75E" />
    <Circle r={12} fill="#FFE58F" />
  </T>
);

export const Moon = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M10 -18 A19 19 0 1 0 10 18 A15 15 0 1 1 10 -18 Z" fill="#FFF3C4" />
  </T>
);

export const Stars = ({ items }: { items: [number, number, number?][] }) => (
  <G>
    {items.map(([x, y, r = 1.8], i) => (
      <G key={i}>
        <Circle cx={x} cy={y} r={r} fill="#FFF7D6" />
        <Path d={`M${x - r * 2.4} ${y} H${x + r * 2.4} M${x} ${y - r * 2.4} V${y + r * 2.4}`} stroke="#FFF7D6" strokeWidth={0.7} opacity={0.7} />
      </G>
    ))}
  </G>
);

export const Cloud = ({ x, y, s, c = '#FFFFFF' }: P) => (
  <T x={x} y={y} s={s}>
    <Ellipse cx={0} cy={6} rx={22} ry={9} fill={c} />
    <Circle cx={-8} cy={-1} r={10} fill={c} />
    <Circle cx={8} cy={-3} r={12} fill={c} />
  </T>
);

export const Hills = ({ c1 = '#8CCB7A', c2 = '#6DB56A' }: { c1?: string; c2?: string }) => (
  <G>
    <Ellipse cx={80} cy={175} rx={150} ry={50} fill={c1} />
    <Ellipse cx={250} cy={180} rx={150} ry={50} fill={c2} />
  </G>
);

export const Ground = ({ y = 138, c = '#7BC47F' }: { y?: number; c?: string }) => <Rect x={0} y={y} width={320} height={160 - y} fill={c} />;

export const House = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={0} width={64} height={42} fill="#F6E4C4" />
    <Polygon points="-6,0 32,-30 70,0" fill="#D6634A" />
    <Rect x={26} y={16} width={13} height={26} rx={2} fill="#8A5A3B" />
    <Rect x={8} y={10} width={13} height={13} rx={2} fill="#9FD6F0" />
    <Rect x={44} y={10} width={13} height={13} rx={2} fill="#9FD6F0" />
    <Rect x={48} y={-24} width={8} height={16} fill="#B7523C" />
  </T>
);

export const Tree = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={-4} y={10} width={8} height={26} rx={2} fill="#8A5A3B" />
    <Circle cx={0} cy={0} r={17} fill="#4FA35B" />
    <Circle cx={-11} cy={8} r={11} fill="#5DB56A" />
    <Circle cx={11} cy={8} r={11} fill="#5DB56A" />
  </T>
);

export const School = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={0} width={104} height={46} fill="#F4C777" />
    <Polygon points="-6,0 52,-24 110,0" fill="#C4553D" />
    <Rect x={44} y={20} width={16} height={26} rx={2} fill="#7A4A2E" />
    {[8, 24, 68, 84].map((wx) => (
      <Rect key={wx} x={wx} y={12} width={12} height={14} rx={2} fill="#9FD6F0" />
    ))}
    <Line x1={52} y1={-24} x2={52} y2={-46} stroke="#666" strokeWidth={2} />
    <Polygon points="52,-46 72,-40 52,-34" fill="#E5484D" />
  </T>
);

export const Office = ({ x, y, s, c = '#5E7A99' }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={0} width={64} height={110} fill={c} />
    {[0, 1, 2, 3, 4].map((r) =>
      [0, 1, 2].map((k) => <Rect key={`${r}${k}`} x={8 + k * 19} y={9 + r * 20} width={12} height={12} rx={1.5} fill={(r * 3 + k) % 4 === 0 ? '#FFE28A' : '#BFD8EE'} />),
    )}
  </T>
);

export const Desk = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={20} width={90} height={7} rx={2} fill="#8A5A3B" />
    <Rect x={6} y={27} width={5} height={22} fill="#6B4630" />
    <Rect x={79} y={27} width={5} height={22} fill="#6B4630" />
    <Rect x={26} y={-6} width={36} height={24} rx={3} fill="#2B3440" />
    <Rect x={29} y={-3} width={30} height={18} rx={1.5} fill="#8FD3F4" />
    <Rect x={40} y={18} width={8} height={4} fill="#2B3440" />
  </T>
);

export const Scaffold = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={40} width={80} height={60} fill="#C9C2B4" />
    {[0, 1, 2].map((r) => (
      <Line key={r} x1={0} y1={r * 30} x2={80} y2={r * 30} stroke="#8A6A3B" strokeWidth={3} />
    ))}
    {[0, 40, 80].map((cx) => (
      <Line key={cx} x1={cx} y1={0} x2={cx} y2={100} stroke="#8A6A3B" strokeWidth={3} />
    ))}
    <Line x1={0} y1={0} x2={80} y2={30} stroke="#8A6A3B" strokeWidth={2} />
    <Line x1={80} y1={0} x2={0} y2={30} stroke="#8A6A3B" strokeWidth={2} />
    <Path d="M88 100 V-14 H130" stroke="#F2B233" strokeWidth={5} fill="none" />
    <Line x1={124} y1={-14} x2={124} y2={20} stroke="#333" strokeWidth={1.5} />
    <Rect x={118} y={20} width={12} height={8} fill="#E5484D" />
  </T>
);

export const Skyline = ({ c = '#1E2A47', lit = '#FFD86B' }: { c?: string; lit?: string }) => (
  <G>
    {[
      [0, 70, 34], [30, 50, 30], [58, 84, 26], [82, 60, 36], [116, 92, 28], [142, 66, 32],
      [170, 88, 30], [198, 54, 34], [230, 76, 30], [258, 96, 28], [284, 62, 36],
    ].map(([x, h, w], i) => (
      <G key={i}>
        <Rect x={x} y={160 - h} width={w} height={h} fill={c} />
        {[0, 1, 2, 3].map((r) =>
          [0, 1].map((k) => ((i + r + k) % 3 === 0 ? <Rect key={`${r}${k}`} x={x + 6 + k * 12} y={160 - h + 8 + r * 14} width={6} height={7} fill={lit} /> : null)),
        )}
      </G>
    ))}
  </G>
);

export const Lamp = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={-2} y={0} width={4} height={60} fill="#3A3F4B" />
    <Path d="M-12 0 Q0 -14 12 0Z" fill="#3A3F4B" />
    <Polygon points="-10,2 10,2 24,60 -24,60" fill="#FFE28A" opacity={0.22} />
  </T>
);

export const Columns = ({ x, y, s, c = '#E9E1D0' }: P) => (
  <T x={x} y={y} s={s}>
    <Polygon points="-6,20 60,-6 126,20" fill={c} />
    <Rect x={-6} y={20} width={132} height={6} fill="#CFC5AE" />
    {[4, 30, 56, 82, 108].map((cx) => (
      <Rect key={cx} x={cx} y={26} width={10} height={46} fill={c} />
    ))}
    <Rect x={-10} y={72} width={140} height={6} fill="#CFC5AE" />
    <Rect x={-16} y={78} width={152} height={6} fill="#BDB299" />
  </T>
);

export const Gavel = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <G transform="rotate(-30)">
      <Rect x={-4} y={0} width={8} height={38} rx={3} fill="#8A5A3B" />
      <Rect x={-16} y={-8} width={32} height={14} rx={4} fill="#5B3A29" />
    </G>
    <Rect x={-26} y={40} width={40} height={6} rx={3} fill="#5B3A29" />
  </T>
);

export const Justice = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Line x1={0} y1={-24} x2={0} y2={26} stroke="#D9B44A" strokeWidth={3} />
    <Line x1={-26} y1={-16} x2={26} y2={-16} stroke="#D9B44A" strokeWidth={3} />
    {[-26, 26].map((px) => (
      <G key={px}>
        <Line x1={px} y1={-16} x2={px - 9} y2={2} stroke="#D9B44A" strokeWidth={1.5} />
        <Line x1={px} y1={-16} x2={px + 9} y2={2} stroke="#D9B44A" strokeWidth={1.5} />
        <Path d={`M${px - 11} 2 H${px + 11} Q${px} 12 ${px - 11} 2Z`} fill="#D9B44A" />
      </G>
    ))}
    <Rect x={-10} y={26} width={20} height={4} rx={2} fill="#D9B44A" />
  </T>
);

export const Bars = ({ c = '#2A2F3A' }: { c?: string }) => (
  <G>
    {Array.from({ length: 12 }).map((_, i) => (
      <Rect key={i} x={10 + i * 27} y={0} width={6} height={160} fill={c} />
    ))}
    <Rect x={0} y={20} width={320} height={6} fill={c} />
    <Rect x={0} y={128} width={320} height={6} fill={c} />
  </G>
);

export const Heart = ({ x, y, s, c = '#E0517A' }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M0 14 C-28 -6 -16 -28 0 -12 C16 -28 28 -6 0 14Z" fill={c} />
    <Path d="M-10 -12 C-14 -8 -12 -4 -8 -4" stroke="#fff" strokeWidth={2} opacity={0.55} fill="none" strokeLinecap="round" />
  </T>
);

export const BrokenHeart = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <G transform="translate(-2 0) rotate(-6)">
      <Path d="M0 14 C-28 -6 -16 -28 0 -12 L-4 -2 L4 6 L-2 14Z" fill="#C43D62" />
    </G>
    <G transform="translate(2 1) rotate(6)">
      <Path d="M0 14 L2 6 L-4 -2 L2 -12 C16 -28 28 -6 0 14Z" fill="#E0517A" />
    </G>
  </T>
);

export const Balloons = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    {[
      [-14, 0, '#E5484D'], [0, -8, '#F2B233'], [14, 0, '#3A86B4'],
    ].map(([bx, by, c], i) => (
      <G key={i}>
        <Line x1={bx as number} y1={(by as number) + 14} x2={0} y2={46} stroke="#888" strokeWidth={1} />
        <Ellipse cx={bx as number} cy={by as number} rx={10} ry={13} fill={c as string} />
        <Ellipse cx={(bx as number) - 3} cy={(by as number) - 5} rx={2.5} ry={4} fill="#fff" opacity={0.5} />
      </G>
    ))}
  </T>
);

export const CoinStack = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    {[0, 1, 2, 3].map((i) => (
      <G key={i}>
        <Ellipse cx={0} cy={-i * 6 + 6} rx={15} ry={5.5} fill="#E1A62B" />
        <Rect x={-15} y={-i * 6} width={30} height={6} fill="#F2C14E" />
        <Ellipse cx={0} cy={-i * 6} rx={15} ry={5.5} fill="#F7D36B" />
      </G>
    ))}
  </T>
);

export const MoneyBag = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M-14 -22 Q0 -14 14 -22 L8 -30 H-8Z" fill="#7C5B2C" />
    <Path d="M-8 -20 C-32 0 -30 34 0 34 C30 34 32 0 8 -20 Q0 -14 -8 -20Z" fill="#8E6B36" />
    <SvgText x={0} y={20} fontSize={30} fontWeight="bold" fill="#F7D36B" textAnchor="middle">$</SvgText>
  </T>
);

export const Chart = ({ x, y, s, up = true }: P & { up?: boolean }) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={0} width={110} height={70} rx={8} fill="#FFFFFF" opacity={0.92} />
    <Line x1={10} y1={58} x2={100} y2={58} stroke="#C9CED6" strokeWidth={1.5} />
    <Polyline
      points={up ? '12,52 34,40 52,46 74,26 96,12' : '12,14 34,24 52,20 74,42 96,54'}
      fill="none"
      stroke={up ? '#2A9D6F' : '#D64550'}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polygon points={up ? '96,6 104,18 88,16' : '96,60 104,48 88,50'} fill={up ? '#2A9D6F' : '#D64550'} />
  </T>
);

export const Phone = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={0} width={44} height={82} rx={9} fill="#232936" />
    <Rect x={4} y={7} width={36} height={68} rx={5} fill="#A7E0F5" />
    <Rect x={9} y={14} width={26} height={9} rx={4} fill="#fff" />
    <Rect x={9} y={27} width={26} height={9} rx={4} fill="#fff" />
    <Circle cx={30} cy={48} r={8} fill="#E0517A" />
    <Path d="M30 52 C24 47 26 43 30 46 C34 43 36 47 30 52Z" fill="#fff" />
  </T>
);

export const Plane = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M-30 4 L28 -2 Q38 -2 38 4 Q38 10 28 10 L-30 12 Z" fill="#F5F7FA" />
    <Path d="M-8 4 L-22 -22 H-12 L12 2Z" fill="#DDE3EA" />
    <Path d="M-8 10 L-22 34 H-12 L12 10Z" fill="#C9D1DA" />
    <Path d="M-30 4 L-38 -12 H-30 L-22 4Z" fill="#E5484D" />
  </T>
);

export const Palm = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M0 60 Q6 30 -2 4" stroke="#8A5A3B" strokeWidth={6} fill="none" strokeLinecap="round" />
    {[-70, -30, 10, 50, 90].map((a) => (
      <Path key={a} d="M-2 4 Q22 -14 38 6 Q16 -2 -2 4Z" fill="#3E9B57" transform={`rotate(${a} -2 4)`} />
    ))}
  </T>
);

export const Cake = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={-22} y={0} width={44} height={20} rx={4} fill="#F4B6C2" />
    <Rect x={-16} y={-14} width={32} height={14} rx={4} fill="#F9D3DB" />
    <Rect x={-1.5} y={-26} width={3} height={12} fill="#3A86B4" />
    <Path d="M0 -36 Q4 -30 0 -27 Q-4 -30 0 -36Z" fill="#FFB020" />
  </T>
);

export const Dumbbell = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={-30} y={-3} width={60} height={6} rx={3} fill="#8A93A0" />
    {[-30, 22].map((dx) => (
      <G key={dx}>
        <Rect x={dx - 4} y={-16} width={12} height={32} rx={3} fill="#3A3F4B" />
        <Rect x={dx + (dx < 0 ? -12 : 12)} y={-11} width={8} height={22} rx={3} fill="#5B6572" />
      </G>
    ))}
  </T>
);

export const Dice = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={-16} y={-16} width={32} height={32} rx={6} fill="#fff" />
    {[[-7, -7], [7, -7], [0, 0], [-7, 7], [7, 7]].map(([dx, dy], i) => (
      <Circle key={i} cx={dx} cy={dy} r={3} fill="#E5484D" />
    ))}
  </T>
);

export const Cards = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <G transform="rotate(-14)">
      <Rect x={-16} y={-24} width={30} height={44} rx={4} fill="#fff" />
      <SvgText x={-1} y={0} fontSize={22} fill="#E5484D" textAnchor="middle">♥</SvgText>
    </G>
    <G transform="rotate(12) translate(12 0)">
      <Rect x={-16} y={-24} width={30} height={44} rx={4} fill="#fff" />
      <SvgText x={-1} y={0} fontSize={22} fill="#232936" textAnchor="middle">♠</SvgText>
    </G>
  </T>
);

export const Sofa = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={8} width={110} height={38} rx={10} fill="#7BA7BC" />
    <Rect x={-8} y={20} width={20} height={34} rx={8} fill="#6A97AC" />
    <Rect x={98} y={20} width={20} height={34} rx={8} fill="#6A97AC" />
    <Rect x={10} y={-6} width={90} height={26} rx={9} fill="#8FB8CB" />
  </T>
);

export const Plant = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M-12 24 H12 L8 44 H-8Z" fill="#C86B4B" />
    {[-40, -15, 15, 40].map((a) => (
      <Ellipse key={a} cx={0} cy={6} rx={5} ry={20} fill="#4FA35B" transform={`rotate(${a} 0 24)`} />
    ))}
  </T>
);

export const Books = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    {[['#E5484D', 46], ['#3A86B4', 40], ['#F2B233', 50]].map(([c, w], i) => (
      <Rect key={i} x={-((w as number) / 2) + (i % 2) * 4} y={-i * 10} width={w as number} height={9} rx={2} fill={c as string} />
    ))}
  </T>
);

export const Tombstone = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M-14 40 V6 Q-14 -12 0 -12 Q14 -12 14 6 V40Z" fill="#A9B2BD" />
    <Rect x={-2} y={-2} width={4} height={18} fill="#7C8794" />
    <Rect x={-7} y={3} width={14} height={4} fill="#7C8794" />
  </T>
);

export const Car = ({ x, y, s, c = '#E76F51' }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M0 22 Q0 12 10 12 L22 2 Q26 -2 32 -2 H54 Q60 -2 64 2 L74 12 Q84 12 84 22 V30 H0Z" fill={c} />
    <Path d="M26 4 H36 V12 H16Z M42 4 H54 L64 12 H42Z" fill="#CDEAF7" />
    {[20, 64].map((wx) => (
      <G key={wx}>
        <Circle cx={wx} cy={32} r={9} fill="#2B3440" />
        <Circle cx={wx} cy={32} r={4} fill="#B8C0CB" />
      </G>
    ))}
  </T>
);

export const Road = ({ y = 120 }: { y?: number }) => (
  <G>
    <Rect x={0} y={y} width={320} height={160 - y} fill="#4A505C" />
    {Array.from({ length: 8 }).map((_, i) => (
      <Rect key={i} x={i * 44 + 6} y={y + 18} width={24} height={4} rx={2} fill="#F5E6A8" />
    ))}
  </G>
);

export const Bench = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={0} width={70} height={8} rx={2} fill="#A9744B" />
    <Rect x={0} y={-16} width={70} height={7} rx={2} fill="#A9744B" />
    <Rect x={6} y={8} width={5} height={18} fill="#6B4630" />
    <Rect x={59} y={8} width={5} height={18} fill="#6B4630" />
  </T>
);

export const Swing = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M-30 60 L-14 0 H14 L30 60" stroke="#E5484D" strokeWidth={4} fill="none" strokeLinecap="round" />
    <Line x1={-8} y1={2} x2={-8} y2={44} stroke="#666" strokeWidth={1.5} />
    <Line x1={8} y1={2} x2={8} y2={44} stroke="#666" strokeWidth={1.5} />
    <Rect x={-13} y={44} width={26} height={5} rx={2} fill="#F2B233" />
  </T>
);

export const Ball = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Circle r={11} fill="#E5484D" />
    <Path d="M-11 0 H11 M0 -11 V11" stroke="#fff" strokeWidth={2} />
    <Circle r={11} fill="none" stroke="#fff" strokeWidth={1.5} />
  </T>
);

export const Paw = ({ x, y, s, c = '#B57A4B' }: P) => (
  <T x={x} y={y} s={s}>
    <Ellipse cx={0} cy={6} rx={9} ry={7} fill={c} />
    {[[-10, -5], [-3.5, -11], [3.5, -11], [10, -5]].map(([dx, dy], i) => (
      <Ellipse key={i} cx={dx} cy={dy} rx={3.6} ry={4.6} fill={c} />
    ))}
  </T>
);

export const Envelope = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={-30} y={-20} width={60} height={40} rx={4} fill="#F6EFE0" />
    <Path d="M-30 -18 L0 4 L30 -18" stroke="#B9AE96" strokeWidth={2} fill="none" />
    <Circle cx={0} cy={4} r={6} fill="#D64550" />
  </T>
);

export const Question = ({ x, y, s, c = '#F2B233' }: P) => (
  <T x={x} y={y} s={s}>
    <SvgText x={0} y={0} fontSize={64} fontWeight="bold" fill={c} textAnchor="middle">?</SvgText>
  </T>
);

export const Cap = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Polygon points="0,-14 36,0 0,14 -36,0" fill="#2B3440" />
    <Path d="M-20 8 V22 Q0 32 20 22 V8 L0 16Z" fill="#3A4453" />
    <Line x1={32} y1={2} x2={32} y2={22} stroke="#F2B233" strokeWidth={2.5} />
    <Circle cx={32} cy={24} r={3.5} fill="#F2B233" />
  </T>
);

export const Diploma = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={-22} y={-8} width={44} height={16} rx={8} fill="#F6EFE0" />
    <Rect x={-4} y={-8} width={8} height={16} fill="#E5484D" />
  </T>
);

export const Newspaper = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={0} width={80} height={96} rx={4} fill="#F4F1EA" />
    <Rect x={8} y={8} width={64} height={16} fill="#2B3440" />
    <Rect x={8} y={30} width={30} height={26} fill="#B9BFC8" />
    {[30, 38, 46].map((ly) => (
      <Rect key={ly} x={44} y={ly} width={28} height={4} fill="#9AA3AD" />
    ))}
    {[62, 70, 78, 86].map((ly) => (
      <Rect key={ly} x={8} y={ly} width={64} height={3} fill="#B9BFC8" />
    ))}
  </T>
);

export const Flag = ({ x, y, s, c = '#E5484D' }: P) => (
  <T x={x} y={y} s={s}>
    <Line x1={0} y1={0} x2={0} y2={60} stroke="#666" strokeWidth={2.5} />
    <Path d="M0 2 Q14 -4 26 4 T52 4 V30 Q38 36 26 28 T0 30Z" fill={c} />
  </T>
);

export const StringLights = () => (
  <G>
    <Path d="M0 12 Q80 44 160 12 T320 12" stroke="#3A3F4B" strokeWidth={1.5} fill="none" />
    {[16, 52, 90, 130, 170, 210, 250, 290].map((lx, i) => {
      const ly = 12 + 22 * Math.sin(((lx % 160) / 160) * Math.PI);
      return <Circle key={lx} cx={lx} cy={ly + 6} r={4.5} fill={['#E5484D', '#F2B233', '#4FA3E0', '#5DB56A'][i % 4]} />;
    })}
  </G>
);

export const DiscoBall = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Line x1={0} y1={-30} x2={0} y2={-14} stroke="#8A93A0" strokeWidth={2} />
    <Circle r={16} fill="#C9D3DE" />
    {[-8, 0, 8].map((dy) => (
      <Path key={dy} d={`M-16 ${dy} Q0 ${dy + 4} 16 ${dy}`} stroke="#8FA0B2" strokeWidth={1} fill="none" />
    ))}
    {[-8, 0, 8].map((dx) => (
      <Path key={dx} d={`M${dx} -15 Q${dx + 6} 0 ${dx} 15`} stroke="#8FA0B2" strokeWidth={1} fill="none" />
    ))}
    <Circle cx={-5} cy={-5} r={3} fill="#fff" opacity={0.8} />
  </T>
);

export const Hospital = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Rect x={0} y={0} width={110} height={80} fill="#F3F7FA" />
    <Rect x={0} y={0} width={110} height={10} fill="#CBD8E3" />
    <Rect x={40} y={46} width={30} height={34} fill="#9FBFD6" />
    <Circle cx={55} cy={26} r={15} fill="#E5484D" />
    <Rect x={51} y={16} width={8} height={20} fill="#fff" />
    <Rect x={45} y={22} width={20} height={8} fill="#fff" />
    {[10, 80].map((wx) => (
      <Rect key={wx} x={wx} y={22} width={20} height={20} rx={2} fill="#B9DCF0" />
    ))}
  </T>
);

export const Heartbeat = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Polyline points="0,20 30,20 40,4 52,38 62,12 70,20 120,20" fill="none" stroke="#E5484D" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
  </T>
);

export const Ring = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Circle cx={-7} cy={0} r={10} fill="none" stroke="#F2C14E" strokeWidth={4} />
    <Circle cx={7} cy={0} r={10} fill="none" stroke="#E1A62B" strokeWidth={4} />
  </T>
);

export const Arch = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <Path d="M0 100 V30 Q0 -14 50 -14 Q100 -14 100 30 V100" stroke="#F4EEE2" strokeWidth={9} fill="none" strokeLinecap="round" />
    {[[6, 6], [24, -6], [50, -12], [76, -6], [94, 6]].map(([fx, fy], i) => (
      <Circle key={i} cx={fx} cy={fy} r={5.5} fill={['#E0517A', '#F4A261', '#E0517A', '#F4A261', '#E0517A'][i]} />
    ))}
  </T>
);

export const Pill = ({ x, y, s }: P) => (
  <T x={x} y={y} s={s}>
    <G transform="rotate(-35)">
      <Rect x={-18} y={-8} width={36} height={16} rx={8} fill="#F4F4F4" />
      <Path d="M0 -8 H10 A8 8 0 0 1 10 8 H0Z" fill="#E5484D" />
    </G>
  </T>
);

export const Spark = ({ x, y, s, c = '#FFD75E' }: P) => (
  <T x={x} y={y} s={s}>
    <Polygon points="0,-18 5,-5 18,0 5,5 0,18 -5,5 -18,0 -5,-5" fill={c} />
  </T>
);
