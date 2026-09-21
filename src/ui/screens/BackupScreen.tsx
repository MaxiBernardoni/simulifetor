import React, { useState } from 'react';
import { Alert, Platform, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { Button, Card, SectionTitle } from '../components';
import { colors, radius, space } from '../theme';

export function BackupScreen() {
  const exportData = useGame((st) => st.exportData);
  const importData = useGame((st) => st.importData);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const doExport = async () => {
    const json = exportData();
    try {
      const nav = (globalThis as { navigator?: { clipboard?: { writeText: (t: string) => Promise<void> } } }).navigator;
      if (Platform.OS === 'web' && nav?.clipboard) {
        await nav.clipboard.writeText(json);
        setMsg({ ok: true, text: 'Copia guardada en el portapapeles. Pegala en un lugar seguro.' });
      } else {
        await Share.share({ message: json });
        setMsg({ ok: true, text: 'Elegí dónde guardar la copia (Notas, Mensajes, un archivo…).' });
      }
    } catch {
      setMsg({ ok: false, text: 'No se pudo compartir la copia.' });
    }
  };

  const doImport = () => {
    if (!text.trim()) {
      setMsg({ ok: false, text: 'Pegá primero el texto de tu copia de seguridad.' });
      return;
    }
    const run = () => {
      const err = importData(text);
      setMsg(err ? { ok: false, text: err } : { ok: true, text: 'Copia importada. Se cargaron tus partidas.' });
      if (!err) setText('');
    };
    Alert.alert('Importar copia', 'Esto reemplaza TODAS tus partidas actuales por las de la copia. ¿Seguir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Importar', style: 'destructive', onPress: run },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={{ color: colors.muted, lineHeight: 20 }}>
        Guardá una copia de todas tus partidas, dinastías y logros. Sirve para pasarlas a otro celular o para no perderlas.
      </Text>

      <SectionTitle icon="Upload" color="#2A9D6F">
        Exportar
      </SectionTitle>
      <Card>
        <Text style={{ color: colors.muted, marginBottom: 10 }}>Genera un texto con todo tu progreso. Guardalo donde quieras.</Text>
        <Button label="Copiar / compartir copia" icon="Upload" onPress={doExport} />
      </Card>

      <SectionTitle icon="Download" color="#3A86B4">
        Importar
      </SectionTitle>
      <Card>
        <Text style={{ color: colors.muted, marginBottom: 10 }}>Pegá acá el texto de una copia anterior.</Text>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder='{"app":"vidasim", ...}'
          placeholderTextColor={colors.muted}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={{ marginTop: 10 }}>
          <Button label="Importar copia" icon="Download" variant="primary" onPress={doImport} />
        </View>
      </Card>

      {msg ? (
        <View style={[s.msg, { backgroundColor: msg.ok ? '#E1F2E9' : '#FBE3E5' }]}>
          <Text style={{ color: msg.ok ? colors.good : colors.bad, fontWeight: '700' }}>{msg.text}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  input: {
    minHeight: 110,
    maxHeight: 200,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    color: colors.text,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  msg: { marginTop: space.lg, padding: 12, borderRadius: radius.md },
});
