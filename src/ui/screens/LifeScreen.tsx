import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../store/gameStore';
import type { Life, LogEntry, StatKey } from '../../engine/types';
import { formatMoney } from '../../engine/format';
import { CircleButton, DeltaChips, Header, LifeStat } from '../components';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { colors, space } from '../theme';

const STATS: StatKey[] = ['happiness', 'health', 'smarts', 'looks'];

interface Group {
  age: number;
  year: number;
  entries: LogEntry[];
}

function occupation(l: Life): string {
  if (!l.alive) return 'Fallecido/a';
  if (l.jailYears > 0) return `Preso/a · ${l.jailYears} ${l.jailYears === 1 ? 'año' : 'años'}`;
  if (l.job) return l.job.title;
  if (l.edu.enrolled === 'university') return 'Universitario/a';
  if (l.edu.enrolled) return 'Estudiante';
  if (l.flags.retired) return 'Jubilado/a';
  if (l.age < 5) return l.age < 2 ? 'Bebé' : 'Niño/a';
  if (l.age < 18) return 'Sin escolarizar';
  return 'Desempleado/a';
}

function NavItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.navItem}>
      <View style={s.navCircle}>
        <Icon name={icon} size={24} color="#fff" />
      </View>
      <Text style={s.navLabel}>{label}</Text>
    </Pressable>
  );
}

export function LifeScreen() {
  const life = useGame((st) => st.life)!;
  const unlocked = useGame((st) => st.achievements.length);
  const ageUp = useGame((st) => st.ageUp);
  const setTab = useGame((st) => st.setTab);
  const insets = useSafeAreaInsets();

  const groups = useMemo(() => {
    const out: Group[] = [];
    for (const e of life.log) {
      const last = out[out.length - 1];
      if (last && last.age === e.age) last.entries.push(e);
      else out.push({ age: e.age, year: e.year, entries: [e] });
    }
    return out.reverse();
  }, [life.log]);

  const blocked = life.pending.length > 0 || !life.alive;
  const debt = life.money < 0;

  return (
    <View style={s.wrap}>
      <Header
        wordmark
        left={<CircleButton icon="Menu" onPress={() => setTab('more')} />}
        right={
          <Pressable onPress={() => setTab('more')} style={s.stars} hitSlop={8}>
            <Icon name="Star" size={26} color={colors.headerText} />
            <Text style={s.starCount}>{unlocked}</Text>
          </Pressable>
        }
      />

      <View style={s.info}>
        <Avatar look={life.look} size={52} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.name} numberOfLines={1}>
            {life.name} {life.surname}
          </Text>
          <Text style={s.job} numberOfLines={1}>
            {occupation(life)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[s.money, debt && { color: colors.bad }]}>{formatMoney(life.money)}</Text>
          <Text style={s.moneyLabel}>{debt ? 'Deuda' : 'Saldo bancario'}</Text>
        </View>
      </View>

      <FlatList
        style={s.feed}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 30 }}
        data={groups}
        keyExtractor={(g) => String(g.age)}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <Text style={s.ageHead}>
              Edad: {item.age} {item.age === 1 ? 'año' : 'años'}
            </Text>
            {item.entries.map((e, i) => (
              <Text key={i} style={s.entry}>
                {e.title ? <Text style={s.entryTitle}>{e.title}: </Text> : null}
                {e.text}
              </Text>
            ))}
          </View>
        )}
      />

      <View style={s.navBar}>
        <NavItem icon="Briefcase" label="Ocupación" onPress={() => setTab('work')} />
        <NavItem icon="Wallet" label="Activos" onPress={() => setTab('assets')} />
        <View style={s.ageSlot}>
          <Pressable onPress={ageUp} disabled={blocked} style={({ pressed }) => [s.ageButton, { opacity: blocked ? 0.5 : pressed ? 0.85 : 1 }]}>
            <Icon name="Plus" size={40} color="#fff" />
            <Text style={s.ageText}>Edad</Text>
          </Pressable>
        </View>
        <NavItem icon="Heart" label="Relaciones" onPress={() => setTab('people')} />
        <NavItem icon="Ellipsis" label="Actividades" onPress={() => setTab('activities')} />
      </View>

      <View style={[s.stats, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {STATS.map((k) => (
          <LifeStat key={k} stat={k} value={life.stats[k]} />
        ))}
        <DeltaChips deltas={life.lastDelta} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starCount: { color: '#fff', fontWeight: '900', fontSize: 22 },
  info: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.infoBar, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { color: colors.nameBlue, fontSize: 20, fontWeight: '800', textDecorationLine: 'underline' },
  job: { color: colors.muted, fontSize: 15, marginTop: 1 },
  money: { color: colors.money, fontSize: 22, fontWeight: '800' },
  moneyLabel: { color: colors.muted, fontSize: 13 },
  feed: { flex: 1 },
  ageHead: { color: colors.nameBlue, fontWeight: '800', fontSize: 18, marginBottom: 2 },
  entry: { color: '#555B66', fontSize: 17, lineHeight: 24, marginTop: 2 },
  entryTitle: { color: '#3B4250', fontWeight: '700' },
  navBar: { flexDirection: 'row', backgroundColor: colors.nav, alignItems: 'flex-end', paddingTop: 8, paddingBottom: 6 },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.navIcon, alignItems: 'center', justifyContent: 'center' },
  navLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  ageSlot: { flex: 1.15, alignItems: 'center' },
  ageButton: {
    width: 92, height: 92, borderRadius: 46, backgroundColor: colors.ageButton, borderWidth: 5, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginTop: -30, marginBottom: -2,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  ageText: { color: '#fff', fontWeight: '800', fontSize: 18, marginTop: -6 },
  stats: { backgroundColor: colors.bg, paddingHorizontal: 12, paddingTop: 10 },
});
