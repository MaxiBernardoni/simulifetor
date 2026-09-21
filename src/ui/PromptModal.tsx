import React, { useEffect, useState } from 'react';
import { useAI } from '../ai/store';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../store/gameStore';
import { getEvent } from '../engine/registry';
import { choiceAvailable } from '../engine/events';
import { Button, DeltaChips, IconTile } from './components';
import { Scene } from './art/Scene';
import { FadeIn, Pop } from './anim';
import { styleForTags } from '../content/icons';
import { colors, radius } from './theme';

function score(deltas: { key: string; amount: number }[]): number {
  return deltas.filter((d) => d.key !== 'money').reduce((a, d) => a + d.amount, 0);
}

export function PromptModal() {
  const life = useGame((st) => st.life);
  const choose = useGame((st) => st.choose);
  const dismiss = useGame((st) => st.dismiss);
  const prompt = life?.pending[0];
  const narrateText = useAI((st) => st.narrateText);
  const narratorOn = useAI((st) => st.config.enabled && st.config.narrator);
  const [narrated, setNarrated] = useState<{ key: string; text: string } | null>(null);
  const promptKey = prompt ? `${prompt.kind}:${prompt.title}:${prompt.text}` : '';
  useEffect(() => {
    if (!narratorOn || !prompt || prompt.kind !== 'choice') return;
    let alive = true;
    void narrateText(prompt.eventId, prompt.text).then((t) => {
      if (alive && t) setNarrated({ key: promptKey, text: t });
    });
    return () => {
      alive = false;
    };
  }, [promptKey, narratorOn, narrateText]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!life || !prompt) return null;
  const shownText = narrated?.key === promptKey ? narrated.text : prompt.text;

  const ev = prompt.kind === 'choice' ? getEvent(prompt.eventId) : undefined;
  const target = life.people.find((p) => p.id === prompt.targetId);
  const bad = prompt.kind === 'result' && score(prompt.deltas) < 0;
  // Clave para reiniciar las animaciones con cada prompt nuevo.
  const key = `${prompt.kind}:${prompt.title}:${prompt.text.length}:${life.log.length}`;

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <View style={s.backdrop}>
        <Pop key={key} from={0.82} style={s.card}>
          {prompt.scene ? (
            <Scene scene={prompt.scene} life={life} target={target} height={160} shake={bad} />
          ) : (
            <View style={s.hero}>
              <IconTile name={prompt.icon ?? 'Sparkles'} color={styleForTags(ev?.tags).color} size={64} solid />
            </View>
          )}
          <View style={s.body}>
            <Text style={s.title}>{prompt.title}</Text>
            <ScrollView style={{ maxHeight: 230 }}>
              <FadeIn delay={120}>
                <Text style={s.text}>{shownText}</Text>
              </FadeIn>
              {prompt.kind === 'result' ? (
                <View style={{ alignItems: 'center' }}>
                  <DeltaChips deltas={prompt.deltas} />
                </View>
              ) : null}
            </ScrollView>
            <View style={s.actions}>
              {prompt.kind === 'choice' && ev?.choices
                ? ev.choices.map((c, i) => (
                    <FadeIn key={i} delay={200 + i * 90} from={10}>
                      <Button label={c.label} variant="primary" disabled={!choiceAvailable(life, c, target)} onPress={() => choose(i)} />
                    </FadeIn>
                  ))
                : (
                  <FadeIn delay={250} from={10}>
                    <Button label="Continuar" onPress={() => (prompt.kind === "choice" ? choose(0) : dismiss())} />
                  </FadeIn>
                )}
            </View>
          </View>
        </Pop>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: 18 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  body: { padding: 18, paddingTop: 14 },
  title: { color: colors.text, fontSize: 21, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  hero: { alignItems: 'center', paddingTop: 22, paddingBottom: 4 },
  text: { color: colors.text, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  actions: { marginTop: 16, gap: 10 },
});
