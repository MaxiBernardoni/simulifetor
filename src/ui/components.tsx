import React from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { Delta, Life, Look, Person, StatKey } from '../engine/types';
import { Avatar } from './Avatar';
import { getScenario } from '../content/scenarios';
import { formatMoney } from '../engine/format';
import { colors, radius, space, barColor } from './theme';
import { Icon } from './Icon';
import { Pop } from './anim';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const STAT_META: Record<StatKey, { label: string; icon: string; color: string }> = {
  happiness: { label: 'Felicidad', icon: 'Sunrise', color: colors.happiness },
  health: { label: 'Salud', icon: 'ShieldPlus', color: colors.health },
  smarts: { label: 'Inteligencia', icon: 'Lightbulb', color: colors.smarts },
  looks: { label: 'Apariencia', icon: 'Sparkles', color: colors.looks },
};

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children, icon, color }: { children: React.ReactNode; icon?: string; color?: string }) {
  if (!icon) return <Text style={s.sectionTitle}>{children}</Text>;
  const c = color ?? colors.accent;
  return (
    <View style={s.sectionRow}>
      <View style={[s.sectionIcon, { backgroundColor: c + '22' }]}>
        <Icon name={icon} size={16} color={c} />
      </View>
      <Text style={[s.sectionTitle, { marginTop: 0, marginBottom: 0, color: c }]}>{children}</Text>
    </View>
  );
}

/** Ficha cuadrada con ícono y color de fondo suave. */
export function IconTile({ name, color = colors.accent, size = 40, solid }: { name: string; color?: string; size?: number; solid?: boolean }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: solid ? color : color + '22', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={Math.round(size * 0.52)} color={solid ? '#fff' : color} />
    </View>
  );
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
  variant?: 'primary' | 'ghost' | 'danger' | 'coral';
  icon?: string;
}) {
  const bg = variant === 'primary' ? colors.accent : variant === 'danger' ? colors.bad : variant === 'coral' ? colors.ageButton : colors.surface2;
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
      {deltas.map((d, idx) => {
        const up = d.amount > 0;
        const color = up ? colors.good : colors.bad;
        const meta = d.key === 'money' ? { icon: 'Banknote', label: '' } : STAT_META[d.key];
        return (
          <Pop key={d.key + d.amount} delay={idx * 110}>
            <View style={[s.chip, { borderColor: color, backgroundColor: color + '14' }]}>
              <Icon name={meta.icon} size={13} color={color} />
              <Text style={[s.chipText, { color }]}>
                {up ? '+' : ''}
                {d.key === 'money' ? formatMoney(d.amount) : d.amount}
              </Text>
            </View>
          </Pop>
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
  tint,
  avatar,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  disabled?: boolean;
  right?: React.ReactNode;
  tint?: string;
  avatar?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled || !onPress} style={({ pressed }) => [s.row, { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }]}>
      {avatar ?? (icon ? <IconTile name={icon} color={tint ?? colors.accent} size={42} /> : null)}
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
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.lg, marginBottom: space.sm },
  sectionIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
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

/** Fila de stat: chip con ícono, etiqueta sobre la barra y porcentaje a la derecha. */
export function LifeStat({ stat, value }: { stat: StatKey; value: number }) {
  const m = STAT_META[stat];
  const color = barColor(value);
  const w = React.useRef(new Animated.Value(value)).current;
  React.useEffect(() => {
    Animated.timing(w, { toValue: value, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [value, w]);
  return (
    <View style={ls.row}>
      <View style={[ls.chip, { backgroundColor: m.color + '26' }]}>
        <Icon name={m.icon} size={20} color={m.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={ls.label}>{m.label}</Text>
        <View style={ls.track}>
          <Animated.View style={[ls.fill, { width: w.interpolate({ inputRange: [0, 100], outputRange: ['3%', '100%'], extrapolate: 'clamp' }), backgroundColor: color }]} />
        </View>
      </View>
      <Text style={ls.pct}>{value}</Text>
    </View>
  );
}

const h = StyleSheet.create({
  bar: { backgroundColor: colors.header, paddingHorizontal: 14, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  side: { width: 76, justifyContent: 'center' },
  circle: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: '800' },
  wordmark: {
    flex: 1, textAlign: 'center', color: colors.headerText, fontSize: 30, fontWeight: '900', letterSpacing: 0.5,
    textShadowColor: '#08403F', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0,
  },
});

const ls = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4, gap: 10 },
  chip: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.nameBlue, fontWeight: '700', fontSize: 13, marginBottom: 3 },
  track: { height: 10, backgroundColor: colors.track, borderRadius: 6, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 6 },
  pct: { width: 34, textAlign: 'right', color: colors.text, fontWeight: '800', fontSize: 16 },
});

// ───────── Extras visuales ─────────
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Aspecto determinístico para una persona, según su id, género y edad. Los familiares comparten tono de piel. */
export function lookForPerson(p: Person, life: Life): Look {
  if (p.look) return p.look;
  const h = hash(p.id);
  const family = p.kind === 'mother' || p.kind === 'father' || p.kind === 'sibling' || p.kind === 'child';
  const styles = p.age < 12 ? [0, 5, 6] : p.gender === 'F' ? [1, 1, 5, 6, 2, 0] : [0, 0, 3, 4, 7, 0];
  return {
    skin: family ? life.look.skin : h % 6,
    eyes: (h >> 4) % 6,
    hairStyle: styles[(h >> 7) % styles.length],
    hairColor: p.age >= 65 ? 6 : [0, 1, 2, 3, 4, 5, 7, 1, 0, 2][(h >> 11) % 10],
  };
}

export function PersonAvatar({ person, life, size = 44 }: { person: Person; life: Life; size?: number }) {
  return (
    <View style={{ opacity: person.alive ? 1 : 0.45 }}>
      <Avatar look={lookForPerson(person, life)} size={size} />
    </View>
  );
}

/** Insignias de estado del personaje (pareja, hijos, casa, cárcel…). */
export function statusBadges(life: Life): { icon: string; color: string; label: string }[] {
  const out: { icon: string; color: string; label: string }[] = [];
  const partner = life.people.find((p) => p.alive && p.kind === 'partner');
  const kids = life.people.filter((p) => p.kind === 'child' && p.alive).length;
  if (life.jailYears > 0) out.push({ icon: 'Lock', color: '#5B6572', label: 'Preso' });
  if (life.flags.fugitive) out.push({ icon: 'Siren', color: '#D64550', label: 'Prófugo' });
  if (partner) out.push({ icon: partner.married ? 'Gem' : 'Heart', color: '#E0517A', label: partner.married ? 'Casado/a' : 'Pareja' });
  if (kids > 0) out.push({ icon: 'Baby', color: '#F4A261', label: `${kids}` });
  if (life.edu.level >= 3) out.push({ icon: 'GraduationCap', color: '#3A86B4', label: 'Título' });
  else if (life.edu.enrolled) out.push({ icon: 'School', color: '#3A86B4', label: 'Estudia' });
  if (life.assets.some((a) => a.kind === 'house')) out.push({ icon: 'House', color: '#2A9D6F', label: 'Casa' });
  if (life.assets.some((a) => a.kind === 'car')) out.push({ icon: 'Car', color: '#2A9D6F', label: 'Auto' });
  if (life.invested > 0) out.push({ icon: 'TrendingUp', color: '#2A9D6F', label: 'Inversor' });
  if (life.loan > 0) out.push({ icon: 'Landmark', color: '#E9A23B', label: 'Deuda' });
  if (life.flags.pet) out.push({ icon: 'PawPrint', color: '#F4A261', label: 'Mascota' });
  if (life.flags.chronic) out.push({ icon: 'HeartPulse', color: '#D64550', label: 'Crónica' });
  if (life.flags.substance) out.push({ icon: 'Pill', color: '#9B5DE5', label: 'Adicción' });
  if (life.flags.criminal_record && life.jailYears === 0) out.push({ icon: 'Scale', color: '#7A5C2E', label: 'Antecedentes' });
  return out;
}

export function StatusBadges({ life }: { life: Life }) {
  const list = statusBadges(life);
  if (!list.length) return null;
  return (
    <View style={sb.row}>
      {list.map((b) => (
        <View key={b.icon + b.label} style={[sb.chip, { backgroundColor: b.color + '1F' }]}>
          <Icon name={b.icon} size={14} color={b.color} />
          <Text style={[sb.text, { color: b.color }]}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

const sb = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.infoBar, borderBottomWidth: 1, borderBottomColor: colors.border },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  text: { fontSize: 12, fontWeight: '700' },
});

const PATTERN = ['Heart', 'Coins', 'GraduationCap', 'Sparkles', 'Baby', 'Briefcase', 'Star', 'Music'];

/** Fondo decorativo con íconos muy tenues. */
export function IconPattern() {
  const items: React.ReactNode[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c2 = 0; c2 < 5; c2++) {
      const name = PATTERN[(r * 5 + c2 * 3) % PATTERN.length];
      items.push(
        <View key={`${r}-${c2}`} style={{ position: 'absolute', top: r * 96 + (c2 % 2) * 40, left: c2 * 78 + (r % 2) * 30, transform: [{ rotate: `${((r * 7 + c2 * 13) % 5) * 10 - 20}deg` }], opacity: 0.06 }}>
          <Icon name={name} size={34} color={colors.nameBlue} />
        </View>,
      );
    }
  }
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>{items}</View>;
}

/** Objetivo del escenario en curso, con su progreso. */
export function ScenarioBar({ life }: { life: Life }) {
  const sc = life.scenario;
  const def = sc ? getScenario(sc.id) : undefined;
  if (!sc || !def) return null;
  const color = sc.status === 'won' ? colors.good : sc.status === 'lost' ? colors.bad : def.color;
  return (
    <View style={[scn.bar, { backgroundColor: color + '18', borderColor: color + '55' }]}>
      <IconTile name={sc.status === 'won' ? 'Trophy' : def.icon} color={color} size={30} solid />
      <View style={{ flex: 1 }}>
        <Text style={[scn.title, { color }]} numberOfLines={1}>
          {def.title}
          {sc.status === 'won' ? ' · superado' : sc.status === 'lost' ? ' · fallado' : def.deadlineAge ? ` · hasta los ${def.deadlineAge}` : ''}
        </Text>
        <Text style={scn.sub} numberOfLines={2}>{def.progress(life)}</Text>
      </View>
    </View>
  );
}

const scn = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 12, marginTop: 8, padding: 8, borderRadius: 12, borderWidth: 1 },
  title: { fontSize: 13, fontWeight: '800' },
  sub: { color: colors.muted, fontSize: 12, marginTop: 1 },
});
