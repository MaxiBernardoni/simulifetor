import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useAI } from '../../ai/store';
import type { ProviderId } from '../../ai/types';
import { Button, Card, SectionTitle } from '../components';
import { colors, radius, space } from '../theme';

const PROVIDERS: { id: ProviderId; label: string; url: string }[] = [
  { id: 'gemini', label: 'Google Gemini', url: 'aistudio.google.com (clave gratis)' },
  { id: 'groq', label: 'Groq', url: 'console.groq.com (clave gratis)' },
];

export function AIScreen() {
  const ai = useAI();
  const [key, setKey] = useState('');
  const [showLog, setShowLog] = useState(false);
  const prov = PROVIDERS.find((p) => p.id === ai.config.provider)!;

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={s.lead}>La IA es opcional. El juego funciona igual sin ella y nunca depende de internet.</Text>
        <Text style={s.small}>
          Sirve para dos cosas: escribir eventos nuevos (que se validan y filtran antes de entrar al juego) y, si querés, reescribir el texto de los eventos con el contexto de tu vida. La clave la conseguís vos, gratis, en la web del proveedor. Se guarda solo en este dispositivo y no viaja en la copia de seguridad.
        </Text>
      </Card>

      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Activar IA</Text>
          <Text style={s.small}>Desactivada por defecto.</Text>
        </View>
        <Switch value={ai.config.enabled} onValueChange={(v) => void ai.setConfig({ enabled: v })} trackColor={{ true: colors.accent }} />
      </View>

      <SectionTitle icon="Bot" color="#9B5DE5">Proveedor</SectionTitle>
      <View style={s.chips}>
        {PROVIDERS.map((p) => (
          <Button key={p.id} label={p.label} variant={ai.config.provider === p.id ? 'primary' : 'ghost'} onPress={() => void ai.setConfig({ provider: p.id })} />
        ))}
      </View>
      <Text style={[s.small, { marginTop: 6 }]}>Conseguí la clave en {prov.url}.</Text>

      <SectionTitle icon="KeyRound" color="#E9A23B">Clave</SectionTitle>
      <TextInput
        style={s.input}
        value={key}
        onChangeText={setKey}
        placeholder={ai.hasKey ? 'Clave guardada (pegá otra para reemplazarla)' : 'Pegá tu clave acá'}
        placeholderTextColor={colors.muted}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={{ gap: 8, marginTop: 8 }}>
        <Button
          label="Guardar clave"
          disabled={!key.trim()}
          onPress={() => {
            void ai.saveKey(key);
            setKey('');
          }}
        />
        {ai.hasKey ? <Button label="Borrar clave" variant="ghost" onPress={() => void ai.saveKey('')} /> : null}
        <Button label={ai.busy ? 'Probando…' : 'Probar conexión'} variant="ghost" disabled={ai.busy || !ai.hasKey} onPress={() => void ai.testConnection()} />
      </View>

      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Modo narrador</Text>
          <Text style={s.small}>Reescribe el texto de los eventos con tu contexto. Si tarda más de 3 segundos, se muestra el original.</Text>
        </View>
        <Switch value={ai.config.narrator} onValueChange={(v) => void ai.setConfig({ narrator: v })} trackColor={{ true: colors.accent }} disabled={!ai.config.enabled} />
      </View>

      <SectionTitle icon="Sparkles" color="#2A9D6F">Eventos generados · {ai.poolCount}</SectionTitle>
      <View style={{ gap: 8 }}>
        <Button label={ai.busy ? 'Generando…' : 'Generar 5 ahora'} variant="ghost" disabled={ai.busy || !ai.hasKey || !ai.config.enabled} onPress={() => void ai.generate(5)} />
        {__DEV__ ? <Button label="Generar evento de prueba (simulado)" variant="ghost" disabled={ai.busy} onPress={() => void ai.generate(1, true)} /> : null}
        <Button label="Vaciar pool" variant="danger" disabled={ai.poolCount === 0} onPress={() => void ai.clearPool()} />
      </View>
      {ai.status ? <Text style={[s.small, { marginTop: 8, color: colors.text }]}>{ai.status}</Text> : null}

      <SectionTitle icon="ShieldCheck" color="#3A86B4">Diagnóstico</SectionTitle>
      <Button label={showLog ? 'Ocultar rechazos' : `Ver rechazos (${ai.audit.length})`} variant="ghost" onPress={() => setShowLog((v) => !v)} />
      {showLog
        ? ai.audit
            .slice()
            .reverse()
            .map((a, i) => (
              <Text key={i} style={[s.small, { marginTop: 6 }]}>
                {new Date(a.t).toLocaleTimeString()} · {a.title ? `“${a.title}” — ` : ''}
                {a.reason}
              </Text>
            ))
        : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  lead: { color: colors.text, fontWeight: '700', fontSize: 15 },
  small: { color: colors.muted, fontSize: 12.5, marginTop: 6, lineHeight: 18 },
  label: { color: colors.text, fontWeight: '700', fontSize: 15 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: space.lg },
  chips: { gap: 8 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, color: colors.text, fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
});
