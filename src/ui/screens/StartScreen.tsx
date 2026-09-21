import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { Button } from '../components';
import { Icon } from '../Icon';
import { Bob, Pop } from '../anim';
import { colors, space } from '../theme';

// Recorrido visual de una vida: de bebé a la despedida.
const PATH: { icon: string; label: string; color: string }[] = [
  { icon: 'Baby', label: 'Nacer', color: '#F4A261' },
  { icon: 'GraduationCap', label: 'Estudiar', color: '#3A86B4' },
  { icon: 'BriefcaseBusiness', label: 'Trabajar', color: '#2A9D6F' },
  { icon: 'Heart', label: 'Amar', color: '#E0517A' },
  { icon: 'Ghost', label: 'Morir', color: '#8A93A0' },
];

const FLOATING = [
  { icon: 'Coins', top: '9%', left: '8%', size: 34, rot: '-14deg' },
  { icon: 'Gem', top: '14%', left: '78%', size: 30, rot: '12deg' },
  { icon: 'Scale', top: '30%', left: '86%', size: 28, rot: '8deg' },
  { icon: 'Car', top: '72%', left: '6%', size: 32, rot: '-10deg' },
  { icon: 'PartyPopper', top: '80%', left: '80%', size: 34, rot: '14deg' },
  { icon: 'House', top: '26%', left: '5%', size: 28, rot: '6deg' },
] as const;

export function StartScreen() {
  const start = useGame((st) => st.startCreating);
  const slots = useGame((st) => st.slots);
  const switchSlot = useGame((st) => st.switchSlot);
  return (
    <View style={s.wrap}>
      {FLOATING.map((f, i) => (
        <Bob key={f.icon} amp={6} period={2200 + i * 380} delay={i * 200} style={{ position: 'absolute', top: f.top, left: f.left, opacity: 0.32 }}>
          <View style={{ transform: [{ rotate: f.rot }] }}>
            <Icon name={f.icon} size={f.size} color="#FFF0C7" />
          </View>
        </Bob>
      ))}
      <Text style={s.title}>VidaSim</Text>
      <Text style={s.sub}>Una vida entera. Un año por vez. Muchas malas decisiones.</Text>

      <View style={s.path}>
        {PATH.map((p, i) => (
          <React.Fragment key={p.label}>
            <Pop delay={300 + i * 140} style={{ alignItems: 'center', gap: 6 }}>
              <View style={[s.pathIcon, { backgroundColor: p.color }]}>
                <Icon name={p.icon} size={24} color="#fff" />
              </View>
              <Text style={s.pathLabel}>{p.label}</Text>
            </Pop>
            {i < PATH.length - 1 ? <View style={s.pathLine} /> : null}
          </React.Fragment>
        ))}
      </View>

      <View style={{ width: '100%', marginTop: space.xl * 1.5 }}>
        <Button label="Empezar una vida" icon="Baby" variant="coral" onPress={start} />
        {slots.map((l, i) =>
          l ? (
            <View key={i} style={{ marginTop: 10 }}>
              <Button label={`Ranura ${i + 1}: ${l.name} (${l.age})`} icon="Zap" variant="ghost" onPress={() => switchSlot(i)} />
            </View>
          ) : null,
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: 10, backgroundColor: colors.header },
  title: {
    color: colors.headerText, fontSize: 56, fontWeight: '900',
    textShadowColor: '#08403F', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0,
  },
  sub: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  path: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: space.xl },
  pathIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
  pathLabel: { color: '#FFF0C7', fontSize: 11, fontWeight: '700' },
  pathLine: { width: 14, height: 3, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 2, marginTop: 22 },
});
