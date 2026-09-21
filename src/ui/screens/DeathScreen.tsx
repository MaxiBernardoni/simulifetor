import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { formatMoney } from '../../engine/format';
import { estateOf, heirsOf, legacyPoints } from '../../engine/dynasty';
import { getScenario } from '../../content/scenarios';
import { Bar, Button, Card, IconTile, PersonAvatar, SectionTitle } from '../components';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { Scene } from '../art/Scene';
import { FadeIn } from '../anim';
import { colors, radius, space } from '../theme';

export function DeathScreen() {
  const life = useGame((st) => st.life)!;
  const start = useGame((st) => st.startCreating);
  const continueAsHeir = useGame((st) => st.continueAsHeir);
  const setTab = useGame((st) => st.setTab);
  const children = life.people.filter((p) => p.kind === 'child');
  const last = life.log.slice(-6, -1);
  const heirs = heirsOf(life);
  const legacy = legacyPoints(life);
  const sc = life.scenario ? getScenario(life.scenario.id) : undefined;

  const pickHeir = (id: string) => {
    if (!continueAsHeir(id)) Alert.alert('No se pudo continuar', 'No se pudo generar al heredero. Probá con otro o empezá una vida nueva.');
  };

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={{ marginHorizontal: -space.lg, marginTop: -24, marginBottom: 12 }}>
        <Scene scene="graveyard" life={life} height={170} />
      </View>
      <FadeIn delay={200} style={s.center}>
        <View style={{ opacity: 0.6 }}>
          <Avatar look={life.look} size={104} />
        </View>
        <Text style={s.title}>
          {life.name} {life.surname}
        </Text>
        <Text style={s.sub}>
          Generación {life.generation} · {life.birthYear} – {life.year} · {life.age} años
        </Text>
        <Text style={s.cause}>Murió de {life.cause}</Text>
      </FadeIn>

      {sc && life.scenario ? (
        <View style={[s.scenario, { backgroundColor: life.scenario.status === 'won' ? '#E1F2E9' : '#FBE3E5' }]}>
          <IconTile name={sc.icon} color={life.scenario.status === 'won' ? colors.good : colors.bad} size={36} solid />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>{sc.title}</Text>
            <Text style={{ color: life.scenario.status === 'won' ? colors.good : colors.bad, fontWeight: '700', fontSize: 13 }}>
              {life.scenario.status === 'won' ? `Superado a los ${life.scenario.wonAge} años` : 'Objetivo no cumplido'}
            </Text>
          </View>
        </View>
      ) : null}

      <Card style={{ marginTop: space.lg }}>
        <View style={s.legacy}>
          <Icon name="Award" size={26} color="#B77A12" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Legado</Text>
            <Text style={{ color: '#B77A12', fontSize: 26, fontWeight: '900' }}>{legacy} puntos</Text>
          </View>
        </View>
        <Line icon="Coins" color="#2A9D6F" label="Patrimonio final" value={formatMoney(life.money)} />
        <Line icon="BriefcaseBusiness" color="#0E7C7B" label="Última ocupación" value={life.job?.title ?? (life.flags.retired ? 'Jubilado/a' : 'Sin trabajo')} />
        <Line icon="Baby" color="#F4A261" label="Hijos" value={String(children.length)} />
        <Line icon="Scale" color="#7A5C2E" label="Antecedentes" value={life.flags.criminal_record ? 'Sí' : 'Ninguno'} />
      </Card>

      {heirs.length > 0 ? (
        <>
          <SectionTitle icon="Crown" color="#B77A12">Continuar la dinastía</SectionTitle>
          <Text style={{ color: colors.muted, marginBottom: 8, lineHeight: 19 }}>
            Elegí a quién vas a ser ahora. Hereda el apellido, {formatMoney(estateOf(life))} (menos lo que se reparta) y la fama de la familia.
          </Text>
          {heirs.map((h, i) => (
            <FadeIn key={h.id} delay={300 + i * 100}>
              <Pressable onPress={() => pickHeir(h.id)} style={({ pressed }) => [s.heir, { opacity: pressed ? 0.85 : 1 }]}>
                <PersonAvatar person={h} life={life} size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={s.heirName}>{h.name}</Text>
                  <Text style={s.heirSub}>
                    {h.kind === 'child' ? 'Hijo/a' : 'Hermano/a'} · {h.age} años
                  </Text>
                  <View style={{ marginTop: 5, width: 90 }}>
                    <Bar value={h.closeness} color={h.closeness > 60 ? colors.good : colors.warn} height={6} />
                  </View>
                </View>
                <View style={s.heirCta}>
                  <Text style={s.heirCtaText}>Ser {h.name.split(' ')[0]}</Text>
                  <Icon name="ChevronRight" size={16} color="#fff" />
                </View>
              </Pressable>
            </FadeIn>
          ))}
        </>
      ) : null}

      {last.length ? (
        <Card style={{ marginTop: space.lg }}>
          <Text style={{ color: colors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Últimos años</Text>
          {last.map((e, i) => (
            <Text key={i} style={{ color: colors.text, marginVertical: 3, lineHeight: 20 }}>
              <Text style={{ color: colors.muted }}>{e.age} · </Text>
              {e.text}
            </Text>
          ))}
        </Card>
      ) : null}

      <View style={{ marginTop: space.xl, gap: 10 }}>
        <Button label="Ver árbol genealógico" icon="Users" variant="ghost" onPress={() => setTab('tree')} />
        <Button label={heirs.length ? 'Empezar una vida nueva (otra dinastía)' : 'Nueva vida'} icon="Baby" onPress={start} />
      </View>
    </ScrollView>
  );
}

function Line({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
      <IconTile name={icon} color={color} size={34} />
      <Text style={{ color: colors.muted, flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: space.lg, paddingTop: 24, paddingBottom: 40 },
  center: { alignItems: 'center', gap: 6 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  sub: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  cause: { color: colors.bad, fontSize: 16, fontWeight: '700', marginTop: 6 },
  scenario: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, padding: 12, marginTop: space.lg },
  legacy: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF3D6', borderRadius: 12, padding: 12, marginBottom: 6 },
  heir: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, borderWidth: 2, borderColor: '#E9A23B', marginBottom: 10 },
  heirName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  heirSub: { color: colors.muted, fontSize: 12, marginTop: 1 },
  heirCta: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.ageButton, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  heirCtaText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
