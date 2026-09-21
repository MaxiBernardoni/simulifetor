import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { formatMoney } from '../../engine/format';
import { Button, Card, Row, SectionTitle } from '../components';
import { ACHIEVEMENTS } from '../../content/achievements';
import { Scene, SCENE_KEYS } from '../art/Scene';
import { colors, space } from '../theme';

export function MoreScreen() {
  const life = useGame((st) => st.life)!;
  const history = useGame((st) => st.history);
  const unlocked = useGame((st) => st.achievements);
  const start = useGame((st) => st.startCreating);
  const wipe = useGame((st) => st.wipe);
  const setTab = useGame((st) => st.setTab);
  const wins = useGame((st) => st.scenarioWins);
  const [gallery, setGallery] = useState(false);

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
      <View style={{ gap: 10, marginTop: space.md }}>
        <Button label="Nueva vida" icon="Baby" onPress={confirmNew} />
        <Button label="Partidas guardadas" icon="Library" variant="ghost" onPress={() => setTab('slots')} />
        <Button label="Árbol genealógico" icon="Users" variant="ghost" onPress={() => setTab('tree')} />
        <Button label="Copia de seguridad" icon="Upload" variant="ghost" onPress={() => setTab('backup')} />
        <Button label="Borrar todos los datos" variant="danger" onPress={confirmWipe} />
        {__DEV__ ? <Button label={gallery ? 'Ocultar galería de escenas' : 'Galería de escenas (dev)'} variant="ghost" onPress={() => setGallery((g) => !g)} /> : null}
      </View>

      {gallery ? (
        <View style={{ gap: 10, marginTop: 12 }}>
          {SCENE_KEYS.map((k) => (
            <View key={k}>
              <Text style={{ color: colors.muted, fontWeight: '700', marginBottom: 4 }}>{k}</Text>
              <Scene scene={k} life={life} height={150} />
            </View>
          ))}
        </View>
      ) : null}

      <SectionTitle icon="Target" color="#E76F51">Escenarios superados · {wins.length}</SectionTitle>
      <Text style={{ color: colors.muted, marginBottom: 4 }}>Los desafíos se eligen al crear una vida nueva.</Text>

      <SectionTitle icon="Trophy" color="#E9A23B">Logros · {unlocked.length}/{ACHIEVEMENTS.length}</SectionTitle>
      {ACHIEVEMENTS.map((a) => {
        const done = unlocked.includes(a.id);
        return <Row key={a.id} icon={done ? a.icon : 'Lock'} tint={done ? '#E9A23B' : '#9AA0A6'} title={done ? a.title : '???'} subtitle={a.desc} disabled={!done} />;
      })}

      <SectionTitle icon="Ghost" color="#5B6572">Vidas anteriores</SectionTitle>
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
