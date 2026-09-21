import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { SCENARIOS } from '../../content/scenarios';
import { IconTile } from '../components';
import { Icon } from '../Icon';
import { FadeIn } from '../anim';
import { colors, radius, space } from '../theme';

function BigCard({ icon, color, title, desc, onPress, badge }: { icon: string; color: string; title: string; desc: string; onPress: () => void; badge?: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, { opacity: pressed ? 0.85 : 1 }]}>
      <IconTile name={icon} color={color} size={56} solid />
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.desc}>{desc}</Text>
        {badge ? <Text style={s.badge}>{badge}</Text> : null}
      </View>
      <Icon name="ChevronRight" size={20} color={colors.muted} />
    </Pressable>
  );
}

/** Primer paso al crear una vida: libre o escenario. */
export function ModeScreen() {
  const setCreating = useGame((st) => st.setCreating);
  const wins = useGame((st) => st.scenarioWins.length);
  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: 12 }}>
      <FadeIn>
        <BigCard icon="Baby" color={colors.accent} title="Vida libre" desc="Empezás de cero y hacés lo que quieras. Al morir, podés seguir con un hijo." onPress={() => setCreating({ step: 'create' })} />
      </FadeIn>
      <FadeIn delay={120}>
        <BigCard icon="Target" color="#E76F51" title="Escenarios" desc="Desafíos con un objetivo y un tiempo límite." badge={`${wins}/${SCENARIOS.length} superados`} onPress={() => setCreating({ step: 'scenarios' })} />
      </FadeIn>
    </ScrollView>
  );
}

const STARS = (n: number) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3].map((i) => (
      <Icon key={i} name="Star" size={13} color={i <= n ? '#E9A23B' : colors.border} />
    ))}
  </View>
);

/** Lista de escenarios disponibles. */
export function ScenariosScreen() {
  const setCreating = useGame((st) => st.setCreating);
  const wins = useGame((st) => st.scenarioWins);
  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: 10, paddingBottom: 40 }}>
      {SCENARIOS.map((sc, i) => (
        <FadeIn key={sc.id} delay={i * 60}>
          <Pressable onPress={() => setCreating({ step: 'create', scenarioId: sc.id })} style={({ pressed }) => [s.card, { alignItems: 'flex-start', opacity: pressed ? 0.85 : 1 }]}>
            <IconTile name={sc.icon} color={sc.color} size={50} solid />
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={s.title}>{sc.title}</Text>
                {STARS(sc.difficulty)}
              </View>
              <Text style={s.desc}>{sc.desc}</Text>
              <View style={s.goalRow}>
                <Icon name="Target" size={14} color={sc.color} />
                <Text style={[s.goal, { color: sc.color }]}>{sc.goal}</Text>
              </View>
              {wins.includes(sc.id) ? (
                <View style={s.done}>
                  <Icon name="Trophy" size={13} color="#fff" />
                  <Text style={s.doneText}>Superado</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        </FadeIn>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 17, fontWeight: '800' },
  desc: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  badge: { color: colors.accent, fontSize: 12, fontWeight: '700', marginTop: 4 },
  goalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  goal: { flex: 1, fontSize: 13, fontWeight: '700' },
  done: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: colors.good, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, marginTop: 6 },
  doneText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
