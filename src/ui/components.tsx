import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { Delta, StatKey } from '../engine/types';
import { formatMoney } from '../engine/format';
import { colors, radius, space, barColor } from './theme';
import { Icon } from './Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const STAT_META: Record<StatKey, { label: string; icon: string; color: string }> = {
  happiness: { label: 'Felicidad', icon: 'Sun', color: colors.happiness },
  health: { label: 'Salud', icon: 'HeartPulse', color: colors.health },
  smarts: { label: 'Inteligencia', icon: 'Brain', color: colors.smarts },
  looks: { label: 'Apariencia', icon: 'Sparkles', color: colors.looks },
};

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  disabled,
  variant = 'primary',
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  icon?: string;
}) {
  const bg = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.bad : colors.surface2;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 }]}
    >
      {icon ? <Icon name={icon} size={18} color={variant === 'ghost' ? colors.text : '#fff'} /> : null}
      <Text style={[s.btnText, variant === 'ghost' && { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Bar({ value, color, height = 8 }: { value: number; color: string; height?: number }) {
  return (
    <View style={[s.barBg, { height }]}>
      <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height, backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

export function StatBar({ stat, value }: { stat: StatKey; value: number }) {
  const m = STAT_META[stat];
  return (
    <View style={s.statRow}>
      <Icon name={m.icon} size={16} color={m.color} />
      <Text style={s.statLabel}>{m.label}</Text>
      <View style={{ flex: 1 }}>
        <Bar value={value} color={m.color} />
      </View>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

export function DeltaChips({ deltas }: { deltas: Delta[] }) {
  if (!deltas.length) return null;
  return (
    <View style={s.chips}>
      {deltas.map((d) => {
        const up = d.amount > 0;
        const color = up ? colors.good : colors.bad;
        const meta = d.key === 'money' ? { icon: 'Banknote', label: '' } : STAT_META[d.key];
        return (
          <View key={d.key} style={[s.chip, { borderColor: color }]}>
            <Icon name={meta.icon} size={13} color={color} />
            <Text style={[s.chipText, { color }]}>
              {up ? '+' : ''}
              {d.key === 'money' ? formatMoney(d.amount) : d.amount}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function Row({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
  right,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  disabled?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled || !onPress} style={({ pressed }) => [s.row, { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }]}>
      {icon ? (
        <View style={s.rowIcon}>
          <Icon name={icon} size={20} color={colors.text} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>
        {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress && !disabled ? <Icon name="ChevronRight" size={18} color={colors.muted} /> : null)}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: space.lg, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: space.lg, marginBottom: space.sm },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 18, borderRadius: radius.md },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  barBg: { backgroundColor: colors.track, borderRadius: 8, overflow: 'hidden' },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  statLabel: { color: colors.muted, width: 92, fontSize: 13 },
  statValue: { color: colors.text, width: 28, textAlign: 'right', fontWeight: '700', fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  rowIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  rowSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
});

// ───────── Estilo "simulador de vida" ─────────

/** Barra roja superior con título, botón de volver y acciones a los costados. */
export function Header({
  title,
  onBack,
  left,
  right,
  wordmark,
}: {
  title?: string;
  onBack?: () => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
  wordmark?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[h.bar, { paddingTop: insets.top + 8 }]}>
      <View style={h.side}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={10} style={h.circle}>
            <Icon name="ArrowLeft" size={22} color="#fff" />
          </Pressable>
        ) : (
          left
        )}
      </View>
      {wordmark ? <Text style={h.wordmark}>VidaSim</Text> : <Text style={h.title}>{title}</Text>}
      <View style={[h.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

export function CircleButton({ icon, onPress }: { icon: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={h.circle}>
      <Icon name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

/** Fila de stat: etiqueta azul a la izquierda, barra con porcentaje. */
export function LifeStat({ stat, value }: { stat: StatKey; value: number }) {
  const m = STAT_META[stat];
  const color = barColor(value);
  return (
    <View style={ls.row}>
      <Text style={ls.label}>{m.label}</Text>
      <View style={ls.icon}>
        <Icon name={m.icon} size={18} color={m.color} />
      </View>
      <View style={ls.track}>
        <View style={[ls.fill, { width: `${Math.max(2, Math.min(100, value))}%`, backgroundColor: color }]} />
        <Text style={ls.pct}>{value}%</Text>
      </View>
    </View>
  );
}

const h = StyleSheet.create({
  bar: { backgroundColor: colors.header, paddingHorizontal: 14, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  side: { width: 76, justifyContent: 'center' },
  circle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2.5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: '800' },
  wordmark: {
    flex: 1, textAlign: 'center', color: colors.headerText, fontSize: 30, fontWeight: '900', letterSpacing: 0.5,
    textShadowColor: '#0A3A7A', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0,
  },
});

const ls = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  label: { width: 104, textAlign: 'right', color: colors.nameBlue, fontWeight: '800', fontSize: 16, paddingRight: 8 },
  icon: { width: 28, alignItems: 'center' },
  track: { flex: 1, height: 26, backgroundColor: colors.track, borderRadius: 3, overflow: 'hidden', justifyContent: 'center', marginLeft: 6 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  pct: { position: 'absolute', right: 8, color: colors.text, fontWeight: '800', fontSize: 15 },
});
