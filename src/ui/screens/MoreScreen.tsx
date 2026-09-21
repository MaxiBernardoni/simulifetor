import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { formatMoney } from '../../engine/format';
import { Button, Card, Row, SectionTitle } from '../components';
import { ACHIEVEMENTS } from '../../content/achievements';
import { colors, space } from '../theme';

export function MoreScreen() {
  const life = useGame((st) => st.life)!;
  const history = useGame((st) => st.history);
  const unlocked = useGame((st) => st.achievements);
  const start = useGame((st) => st.startCreating);
  const wipe = useGame((st) => st.wipe);

  const confirmNew = () => {
    if (!life.alive) return start();
    Alert.alert('¿Empezar otra vida?', 'La vida actual se abandona (no se guarda en el historial).', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Nueva vida', style: 'destructive', onPress: start },
    ]);
  };
  const confirmWipe = () =>
    Alert.alert('Borrar todo', 'Se borran la vida actual y el historial. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar todo', style: 'destructive', onPress: () => void wipe() },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Más</Text>
      <View style={{ gap: 10, marginTop: space.md }}>
        <Button label="Nueva vida" icon="Baby" onPress={confirmNew} />
        <Button label="Borrar todos los datos" variant="danger" onPress={confirmWipe} />
      </View>

      <SectionTitle>Logros · {unlocked.length}/{ACHIEVEMENTS.length}</SectionTitle>
      {ACHIEVEMENTS.map((a) => {
        const done = unlocked.includes(a.id);
        return <Row key={a.id} icon={done ? a.icon : 'Lock'} title={done ? a.title : '???'} subtitle={a.desc} disabled={!done} />;
      })}

      <SectionTitle>Vidas anteriores</SectionTitle>
      {history.length === 0 ? (
        <Text style={{ color: colors.muted }}>Todavía no moriste. Todo a su tiempo.</Text>
      ) : (
        history.map((h) => (
          <Card key={h.id} style={{ marginBottom: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>{h.name}</Text>
            <Text style={{ color: colors.muted, marginTop: 2 }}>
              {h.birthYear} – {h.deathYear} · {h.age} años
            </Text>
            <Text style={{ color: colors.muted, marginTop: 2 }}>
              {h.job} · {formatMoney(h.money)} · Murió de {h.cause}
            </Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}
