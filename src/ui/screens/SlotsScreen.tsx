import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { showAlert } from '../dialog';
import { SLOT_COUNT, useGame } from '../../store/gameStore';
import type { Life } from '../../engine/types';
import { formatMoney } from '../../engine/format';
import { getScenario } from '../../content/scenarios';
import { Avatar } from '../Avatar';
import { Button, Card, IconTile } from '../components';
import { Icon } from '../Icon';
import { FadeIn } from '../anim';
import { colors, space } from '../theme';

function describe(l: Life): string {
  if (!l.alive) return `Falleció a los ${l.age} años`;
  if (l.jailYears > 0) return 'Preso/a';
  return l.job?.title ?? (l.flags.retired ? 'Jubilado/a' : l.edu.enrolled ? 'Estudiante' : l.age < 5 ? 'Niño/a' : 'Sin trabajo');
}

export function SlotsScreen() {
  const slots = useGame((st) => st.slots);
  const active = useGame((st) => st.activeSlot);
  const switchSlot = useGame((st) => st.switchSlot);
  const deleteSlot = useGame((st) => st.deleteSlot);
  const startCreating = useGame((st) => st.startCreating);

  const confirmDelete = (i: number) =>
    showAlert('Borrar partida', `Se borra la partida de la ranura ${i + 1}. No se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => deleteSlot(i) },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: 12, paddingBottom: 40 }}>
      <Text style={{ color: colors.muted }}>Tenés {SLOT_COUNT} ranuras: cada una guarda una vida distinta.</Text>
      {Array.from({ length: SLOT_COUNT }).map((_, i) => {
        const l = slots[i];
        const isActive = i === active;
        const sc = l?.scenario ? getScenario(l.scenario.id) : undefined;
        return (
          <FadeIn key={i} delay={i * 80}>
            <Card style={isActive ? { borderColor: colors.accent, borderWidth: 2 } : undefined}>
              <View style={s.head}>
                <Text style={s.slot}>Ranura {i + 1}</Text>
                {isActive ? <Text style={s.active}>ACTIVA</Text> : null}
              </View>
              {l ? (
                <>
                  <View style={s.row}>
                    <Avatar look={l.look} size={58} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.name}>
                        {l.name} {l.surname}
                      </Text>
                      <Text style={s.sub}>
                        {l.age} años · {l.year} · {describe(l)}
                      </Text>
                      <Text style={s.sub}>
                        {formatMoney(l.money)} · Generación {l.generation}
                      </Text>
                    </View>
                  </View>
                  {sc ? (
                    <View style={s.scenario}>
                      <IconTile name={sc.icon} color={sc.color} size={26} />
                      <Text style={{ flex: 1, color: colors.text, fontSize: 13, fontWeight: '600' }}>
                        {sc.title} · {l.scenario!.status === 'won' ? 'superado' : l.scenario!.status === 'lost' ? 'fallado' : 'en curso'}
                      </Text>
                    </View>
                  ) : null}
                  <View style={s.actions}>
                    {!isActive ? (
                      <View style={{ flex: 1 }}>
                        <Button label="Jugar" icon="Zap" onPress={() => switchSlot(i)} />
                      </View>
                    ) : null}
                    <View style={{ flex: 1 }}>
                      <Button label="Borrar" variant="danger" onPress={() => confirmDelete(i)} />
                    </View>
                  </View>
                </>
              ) : (
                <View style={{ gap: 10 }}>
                  <View style={s.empty}>
                    <Icon name="Baby" size={22} color={colors.muted} />
                    <Text style={{ color: colors.muted }}>Ranura vacía</Text>
                  </View>
                  <Button
                    label="Nueva vida aquí"
                    icon="Plus"
                    onPress={() => {
                      switchSlot(i);
                      startCreating();
                    }}
                  />
                </View>
              )}
            </Card>
          </FadeIn>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  slot: { color: colors.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  active: {
    color: '#fff',
    backgroundColor: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: colors.text, fontSize: 18, fontWeight: '800' },
  sub: { color: colors.muted, fontSize: 13, marginTop: 1 },
  scenario: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: colors.bg, borderRadius: 10, padding: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  empty: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
});
