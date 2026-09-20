import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { formatMoney } from '../../engine/format';
import { Button, Card } from '../components';
import { Avatar } from '../Avatar';
import { colors, space } from '../theme';

export function DeathScreen() {
  const life = useGame((st) => st.life)!;
  const start = useGame((st) => st.startCreating);
  const children = life.people.filter((p) => p.kind === 'child');
  const last = life.log.slice(-6, -1);

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={s.center}>
        <View style={{ opacity: 0.6 }}>
          <Avatar look={life.look} size={104} />
        </View>
        <Text style={s.title}>
          {life.name} {life.surname}
        </Text>
        <Text style={s.sub}>
          {life.birthYear} – {life.year} · {life.age} años
        </Text>
        <Text style={s.cause}>Murió de {life.cause}</Text>
      </View>

      <Card style={{ marginTop: space.xl }}>
        <Line label="Patrimonio final" value={formatMoney(life.money)} />
        <Line label="Última ocupación" value={life.job?.title ?? (life.flags.retired ? 'Jubilado/a' : 'Sin trabajo')} />
        <Line label="Hijos" value={String(children.length)} />
        <Line label="Antecedentes" value={life.flags.criminal_record ? 'Sí' : 'Ninguno'} />
      </Card>

      {last.length ? (
        <Card style={{ marginTop: space.md }}>
          <Text style={{ color: colors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Últimos años</Text>
          {last.map((e, i) => (
            <Text key={i} style={{ color: colors.text, marginVertical: 3, lineHeight: 20 }}>
              <Text style={{ color: colors.muted }}>{e.age} · </Text>
              {e.text}
            </Text>
          ))}
        </Card>
      ) : null}

      <View style={{ marginTop: space.xl }}>
        <Button label="Nueva vida" icon="Baby" onPress={start} />
      </View>
    </ScrollView>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ color: colors.muted }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: space.lg, paddingTop: 48, paddingBottom: 40 },
  center: { alignItems: 'center', gap: 6 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  sub: { color: colors.muted, fontSize: 15 },
  cause: { color: colors.bad, fontSize: 16, fontWeight: '700', marginTop: 6 },
});
