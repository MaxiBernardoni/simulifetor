import React, { useEffect, useState } from 'react';
import { useAI } from '../ai/store';
import { canAnswerByText } from '../ai/config';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const narratorOn = useAI((st) => st.config.enabled && st.config.narrator && st.config.verified);
  // Responder escribiendo: hace falta la IA activa, el modo narrador y un proveedor usable (el modelo propio no pide clave).
  const canWrite = useAI((st) => canAnswerByText(st.config, st.hasKey));
  const answerText = useAI((st) => st.answerText);
  const [draft, setDraft] = useState<{ key: string; text: string; error: string | null }>({ key: '', text: '', error: null });
  const [thinking, setThinking] = useState(false);
  const [narrated, setNarrated] = useState<{ key: string; text: string } | null>(null);
  const promptKey = prompt ? `${prompt.kind}:${prompt.title}:${prompt.text}` : '';
  // El borrador pertenece a una situación: si cambia la situación, arranca vacío.
  const answer = draft.key === promptKey ? draft.text : '';
  const answerError = draft.key === promptKey ? draft.error : null;
  const setAnswer = (text: string) => setDraft({ key: promptKey, text, error: null });
  useEffect(() => {
    if (!narratorOn || !prompt || prompt.kind !== 'choice' || prompt.options) return;
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
  const submitAnswer = async (text = answer) => {
    setThinking(true);
    const err = await answerText(text);
    setThinking(false);
    if (err) setDraft({ key: promptKey, text, error: err });
  };

  const ev = prompt.kind === 'choice' ? getEvent(prompt.eventId) : undefined;
  const target = life.people.find((p) => p.id === prompt.targetId);
  const bad = prompt.kind === 'result' && score(prompt.deltas) < 0;
  // Clave para reiniciar las animaciones con cada prompt nuevo.
  const key = `${prompt.kind}:${prompt.title}:${prompt.text.length}:${life.log.length}`;

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <KeyboardAvoidingView style={s.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
              {prompt.kind === 'choice' && ev?.choices ? (
                ev.choices.map((c, i) => (
                  <FadeIn key={i} delay={200 + i * 90} from={10}>
                    <Button
                      label={c.label}
                      variant="primary"
                      disabled={thinking || !choiceAvailable(life, c, target)}
                      onPress={() => choose(i)}
                    />
                  </FadeIn>
                ))
              ) : prompt.kind === 'choice' && prompt.options && canWrite ? (
                // Continuación de la IA: las opciones sugeridas se responden como si el jugador las hubiera escrito.
                prompt.options.map((o, i) => (
                  <FadeIn key={i} delay={200 + i * 90} from={10}>
                    <Button label={o} variant="primary" disabled={thinking} onPress={() => void submitAnswer(o)} />
                  </FadeIn>
                ))
              ) : (
                <FadeIn delay={250} from={10}>
                  <Button label="Continuar" onPress={() => (prompt.kind === 'choice' ? choose(0) : dismiss())} />
                </FadeIn>
              )}
            </View>
            {prompt.kind === 'choice' && (ev?.choices || prompt.options) && canWrite ? (
              <View style={s.free}>
                <Text style={s.or}>{prompt.options ? 'o escribí otra cosa' : 'o escribí qué hacés'}</Text>
                <TextInput
                  style={s.input}
                  value={answer}
                  onChangeText={setAnswer}
                  editable={!thinking}
                  multiline
                  maxLength={200}
                  placeholder="Contá qué hacés… la IA decide qué pasa"
                  placeholderTextColor={colors.muted}
                />
                {answerError ? <Text style={s.error}>{answerError}</Text> : null}
                <Button
                  label={thinking ? 'La IA está pensando…' : 'Responder'}
                  variant="coral"
                  disabled={thinking || answer.trim().length < 3}
                  onPress={() => void submitAnswer()}
                />
              </View>
            ) : null}
          </View>
        </Pop>
      </KeyboardAvoidingView>
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
  free: { marginTop: 14, gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  or: { color: colors.muted, fontSize: 12, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.6 },
  input: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  error: { color: colors.bad, fontSize: 13, textAlign: 'center' },
});
