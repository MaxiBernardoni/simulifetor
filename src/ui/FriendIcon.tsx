import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/** Dos amigos abrazados (silueta): el ícono de la barra de amistad. */
export function FriendIcon({ size = 20, color = '#2A9D6F' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={36} cy={27} r={12} fill={color} />
      <Circle cx={64} cy={27} r={12} fill={color} />
      <Rect x={26} y={46} width={22} height={44} rx={9} fill={color} />
      <Rect x={52} y={46} width={22} height={44} rx={9} fill={color} />
      <Path d="M30 52 L8 30 M70 52 L92 30 M34 50 Q50 57 66 50" stroke={color} strokeWidth={9} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
