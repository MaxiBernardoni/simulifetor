import { eraAt } from '../../content/eras';
import React, { useEffect, useMemo } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../store/gameStore';
import type { Life, LogEntry, StatKey } from '../../engine/types';
import { formatMoney } from '../../engine/format';
import { CircleButton, DeltaChips, Header, IconPattern, IconTile, LifeStat, ScenarioBar, StatusBadges } from '../components';
import { styleForText, TONE_STYLE } from '../../content/icons';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { FadeIn, PressScale, Pulse, useBump, useHop } from '../anim';
import { CoachTarget, useCoach } from '../coach';
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
    <PressScale onPress={onPress} outerStyle={s.navItem} style={{ alignItems: 'center', gap: 4 }} to={0.85}>
      <Icon name={icon} size={26} color={colors.navIcon} />
      <Text style={s.navLabel}>{label}</Text>
    </PressScale>
  );
}

export function LifeScreen() {
  const life = useGame((st) => st.life)!;
  const unlocked = useGame((st) => st.achievements.length);
  const ageUp = useGame((st) => st.ageUp);
  const setTab = useGame((st) => st.setTab);
  const insets = useSafeAreaInsets();
  const hop = useHop(life.age);
  const bump = useBump(life.money);
  const seenTutorial = useGame((st) => st.seenTutorial);
  const startCoach = useCoach((st) => st.start);
  // Primera vida: arranca la guía con globos.
  useEffect(() => {
    if (!seenTutorial && life.age <= 1 && life.alive) startCoach();
  }, [seenTutorial]); // eslint-disable-line react-hooks/exhaustive-deps

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
        left={
          <CoachTarget id="menu">
            <CircleButton icon="Menu" onPress={() => setTab('more')} />
          </CoachTarget>
        }
        right={
          <Pressable onPress={() => setTab('more')} style={s.stars} hitSlop={8}>
            <Icon name="Trophy" size={20} color={colors.headerText} />
            <Text style={s.starCount}>{unlocked}</Text>
          </Pressable>
        }
      />

      <CoachTarget id="info" style={s.info}>
        <Animated.View style={hop}>
          <Avatar look={life.look} size={52} animated />
        </Animated.View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.name} numberOfLines={1}>
            {life.name} {life.surname}
          </Text>
          <Text style={s.job} numberOfLines={1}>
            {occupation(life)} · {eraAt(life.year).label}
          </Text>
        </View>
        <Animated.View style={[s.moneyPill, debt && { backgroundColor: '#FBE3E5' }, bump]}>
          <Text style={[s.money, debt && { color: colors.bad }]}>{formatMoney(life.money)}</Text>
          <Text style={s.moneyLabel}>{debt ? 'Deuda' : 'En el banco'}</Text>
        </Animated.View>
      </CoachTarget>

      <StatusBadges life={life} />
      <ScenarioBar life={life} />

      <View style={s.feedWrap}>
        <IconPattern />
        <FlatList
          style={s.feed}
          contentContainerStyle={{ padding: space.lg, paddingBottom: 30 }}
          data={groups}
          keyExtractor={(g) => String(g.age)}
          renderItem={({ item }) => (
            <FadeIn style={{ marginBottom: 16 }}>
              <View style={s.ageRow}>
                <Text style={s.ageHead}>
                  {item.age} {item.age === 1 ? 'año' : 'años'}
                </Text>
                <Text style={s.ageYear}>{item.year}</Text>
                <View style={s.ageLine} />
              </View>
              {item.entries.map((e, i) => {
                const st = e.icon ? { icon: e.icon, color: TONE_STYLE[e.tone].color } : styleForText(e.text, e.tone);
                const color = e.tone === 'good' ? colors.good : e.tone === 'bad' ? colors.bad : st.color;
                return (
                  <View key={i} style={s.entryRow}>
                    <IconTile name={st.icon} color={color} size={34} />
                    <Text style={s.entry}>
                      {e.title ? <Text style={s.entryTitle}>{e.title}: </Text> : null}
                      {e.text}
                    </Text>
                  </View>
                );
              })}
            </FadeIn>
          )}
        />
      </View>

      <CoachTarget id="nav" style={s.navBar}>
        <NavItem icon="BriefcaseBusiness" label="Ocupación" onPress={() => setTab('work')} />
        <NavItem icon="PiggyBank" label="Activos" onPress={() => setTab('assets')} />
        <CoachTarget id="age" style={s.ageSlot}>
          <Pulse active={!blocked} amount={0.045} style={s.pulse}>
            <PressScale onPress={ageUp} disabled={blocked} to={0.88} style={[s.ageButton, { opacity: blocked ? 0.5 : 1 }]}>
              <Icon name="ChevronsRight" size={38} color="#fff" />
              <Text style={s.ageText}>Envejecer</Text>
            </PressScale>
          </Pulse>
        </CoachTarget>
        <NavItem icon="HeartHandshake" label="Relaciones" onPress={() => setTab('people')} />
        <NavItem icon="LayoutGrid" label="Actividades" onPress={() => setTab('activities')} />
      </CoachTarget>

      <CoachTarget id="stats" style={[s.stats, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {STATS.map((k) => (
          <LifeStat key={k} stat={k} value={life.stats[k]} />
        ))}
        <DeltaChips deltas={life.lastDelta} />
      </CoachTarget>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  starCount: { color: '#fff', fontWeight: '900', fontSize: 18 },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoBar,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { color: colors.nameBlue, fontSize: 20, fontWeight: '800' },
  job: { color: colors.muted, fontSize: 15, marginTop: 1 },
  moneyPill: { alignItems: 'flex-end', backgroundColor: '#E1F2E9', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  money: { color: colors.money, fontSize: 19, fontWeight: '800' },
  moneyLabel: { color: colors.muted, fontSize: 11 },
  feedWrap: { flex: 1 },
  feed: { flex: 1 },
  entryRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 8 },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  ageHead: { color: colors.nameBlue, fontWeight: '800', fontSize: 18 },
  ageYear: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  ageLine: { flex: 1, height: 1, backgroundColor: colors.border },
  entry: { flex: 1, color: '#4A5158', fontSize: 16, lineHeight: 23, paddingTop: 1 },
  entryTitle: { color: '#3B4250', fontWeight: '700' },
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.nav,
    alignItems: 'flex-end',
    paddingTop: 12,
    paddingBottom: 10,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navLabel: { color: '#DCE9E8', fontSize: 12, fontWeight: '600' },
  ageSlot: { flex: 1.15, alignItems: 'center' },
  pulse: { marginTop: -34, marginBottom: -2 },
  ageButton: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor: colors.ageButton,
    borderWidth: 5,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  ageText: { color: '#fff', fontWeight: '800', fontSize: 15, marginTop: -2 },
  stats: { backgroundColor: colors.bg, paddingHorizontal: 12, paddingTop: 10 },
});
