import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../store/gameStore';
import { getEvent } from '../engine/registry';
import { choiceAvailable } from '../engine/events';
import { Button, DeltaChips, IconTile } from './components';
import { styleForTags } from '../content/icons';
import { colors, radius } from './theme';

function heroColor(deltas: { key: string; amount: number }[]): string {
  const score = deltas.filter((d) => d.key !== 'money').reduce((a, d) => a + d.amount, 0);
  return score > 0 ? colors.good : score < 0 ? colors.bad : colors.accent;
}

export function PromptModal() {
  const life = useGame((st) => st.life);
  const choose = useGame((st) => st.choose);
  const dismiss = useGame((st) => st.dismiss);
  const prompt = life?.pending[0];
  if (!life || !prompt) return null;

  const ev = prompt.kind === 'choice' ? getEvent(prompt.eventId) : undefined;
  const target = prompt.kind === 'choice' ? life.people.find((p) => p.id === prompt.targetId) : undefined;

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <View style={s.backdrop}>
        <View style={s.card}>
          <View style={s.hero}>
            <IconTile
              name={prompt.icon ?? (prompt.kind === 'result' ? 'CircleCheck' : 'Sparkles')}
              color={prompt.kind === 'result' ? heroColor(prompt.deltas) : styleForTags(ev?.tags).color}
              size={64}
              solid
            />
          </View>
          <Text style={s.title}>{prompt.title}</Text>
          <ScrollView style={{ maxHeight: 260 }}>
            <Text style={s.text}>{prompt.text}</Text>
            {prompt.kind === 'result' ? (
              <View style={{ alignItems: 'center' }}>
                <DeltaChips deltas={prompt.deltas} />
              </View>
            ) : null}
          </ScrollView>
          <View style={s.actions}>
            {prompt.kind === 'choice' && ev?.choices
              ? ev.choices.map((c, i) => (
                  <Button
                    key={i}
                    label={c.label}
                    variant="primary"
                    disabled={!choiceAvailable(life, c, target)}
                    onPress={() => choose(i)}
                  />
                ))
              : <Button label="Continuar" onPress={dismiss} />}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, paddingTop: 22, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 21, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  hero: { alignItems: 'center', marginTop: -50, marginBottom: 10 },
  text: { color: colors.text, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  actions: { marginTop: 18, gap: 10 },
});
