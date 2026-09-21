import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { TUTORIAL } from '../../content/help';
import { Button, IconTile } from '../components';
import { Scene } from '../art/Scene';
import { FadeIn } from '../anim';
import { colors, radius, space } from '../theme';

/** Tutorial de primer uso: 5 tarjetas con Atrás / Siguiente / Saltar. Se muestra una sola vez. */
export function TutorialScreen() {
  const life = useGame((st) => st.life)!;
  const done = useGame((st) => st.markTutorialSeen);
  const [i, setI] = useState(0);
  const card = TUTORIAL[i];
  const last = i === TUTORIAL.length - 1;
  return (
    <View style={s.wrap}>
      <View style={s.dots}>
        {TUTORIAL.map((_, k) => (
          <View key={k} style={[s.dot, k === i && s.dotOn]} />
        ))}
      </View>
      <FadeIn key={i} from={16} style={{ flex: 1, justifyContent: 'center' }}>
        <View style={s.card}>
          <Scene scene={card.scene} life={life} height={190} />
          <View style={{ padding: space.lg, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <IconTile name={card.icon} color={colors.accent} size={40} solid />
              <Text style={s.title}>{card.title}</Text>
            </View>
            <Text style={s.text}>{card.text}</Text>
          </View>
        </View>
      </FadeIn>
      <View style={{ gap: 8 }}>
        <Button label={last ? 'Empezar a jugar' : 'Siguiente'} onPress={() => (last ? done() : setI(i + 1))} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {i > 0 ? (
            <View style={{ flex: 1 }}>
              <Button label="Atrás" variant="ghost" onPress={() => setI(i - 1)} />
            </View>
          ) : null}
          {!last ? (
            <View style={{ flex: 1 }}>
              <Button label="Saltar" variant="ghost" onPress={done} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: space.lg, gap: space.md, justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.accent, width: 22 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  title: { flex: 1, color: colors.text, fontSize: 20, fontWeight: '900' },
  text: { color: colors.text, fontSize: 15, lineHeight: 22 },
});
