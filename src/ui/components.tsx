import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { Delta, StatKey } from '../engine/types';
import { formatMoney } from '../engine/format';
import { colors, radius, space } from './theme';
import { Icon } from './Icon';

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
      {icon ? <Icon name={icon} size={18} color="#fff" /> : null}
      <Text style={s.btnText}>{label}</Text>
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
  barBg: { backgroundColor: colors.surface2, borderRadius: 8, overflow: 'hidden' },
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
