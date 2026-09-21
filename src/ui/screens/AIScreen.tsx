import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useAI } from '../../ai/store';
import type { ProviderId } from '../../ai/types';
import { Button, Card, SectionTitle } from '../components';
import { colors, radius, space } from '../theme';

const PROVIDERS: { id: ProviderId; label: string; url: string }[] = [
  { id: 'gemini', label: 'Google Gemini', url: 'aistudio.google.com (clave gratis)' },
  { id: 'groq', label: 'Groq', url: 'console.groq.com (clave gratis)' },
  { id: 'compat', label: 'Modelo propio (sin censura)', url: '' },
];

export function AIScreen() {
  const ai = useAI();
  const [key, setKey] = useState('');
  const [showLog, setShowLog] = useState(false);
  const prov = PROVIDERS.find((p) => p.id === ai.config.provider)!;
  const own = ai.config.provider === 'compat';
  const canUse = ai.hasKey || own; // el modelo propio no necesita clave
  // Servidor en tu propia PC o red (Ollama, LM Studio…): no usa clave, así que no se muestra el campo.
  const local = own && /^https?:\/\/(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\])/i.test(ai.config.baseUrl.trim());

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Card>
        <Text style={s.lead}>La IA es opcional. El juego funciona igual sin ella y nunca depende de internet.</Text>
        <Text style={s.small}>
          Sirve para dos cosas: escribir eventos nuevos (que se validan y filtran antes de entrar al juego) y, si querés, reescribir el
          texto de los eventos con el contexto de tu vida. La clave la conseguís vos, gratis, en la web del proveedor. Se guarda solo en
          este dispositivo y no viaja en la copia de seguridad.
        </Text>
      </Card>

      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Activar IA</Text>
          <Text style={s.small}>Desactivada por defecto.</Text>
        </View>
        <Switch value={ai.config.enabled} onValueChange={(v) => void ai.setConfig({ enabled: v })} trackColor={{ true: colors.accent }} />
      </View>

      <SectionTitle icon="Bot" color="#9B5DE5">
        Proveedor
      </SectionTitle>
      <View style={s.chips}>
        {PROVIDERS.map((p) => (
          <Button
            key={p.id}
            label={p.label}
            variant={ai.config.provider === p.id ? 'primary' : 'ghost'}
            onPress={() => void ai.setConfig({ provider: p.id })}
          />
        ))}
      </View>
      {own ? null : <Text style={[s.small, { marginTop: 6 }]}>Conseguí la clave en {prov.url}.</Text>}

      {own ? (
        <View style={{ marginTop: space.md, gap: 8 }}>
          <Text style={s.small}>
            Sirve con cualquier servidor compatible con OpenAI. Gratis y sin censura: instalá Ollama en tu PC, bajá un modelo sin filtros
            (por ejemplo dolphin3 o hermes3) y poné la IP de tu PC. Las reglas fijas del juego (nada sexual con menores, sin suicidio) se
            siguen aplicando a lo que genere.
          </Text>
          <TextInput
            style={s.input}
            value={ai.config.baseUrl}
            onChangeText={(v) => void ai.setConfig({ baseUrl: v })}
            placeholder="Dirección: http://192.168.0.10:11434/v1"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={s.input}
            value={ai.config.model}
            onChangeText={(v) => void ai.setConfig({ model: v })}
            placeholder="Modelo: dolphin3"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Preset Ollama"
                variant="ghost"
                onPress={() => void ai.setConfig({ baseUrl: 'http://localhost:11434/v1', model: 'dolphin3' })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Preset OpenRouter"
                variant="ghost"
                onPress={() => void ai.setConfig({ baseUrl: 'https://openrouter.ai/api/v1', model: 'openrouter/free' })}
              />
            </View>
          </View>
          <Text style={s.small}>OpenRouter gratis usa modelos con filtros; la clave es opcional para tu propio servidor.</Text>
        </View>
      ) : null}

      {!own ? (
        <View style={{ marginTop: space.md, gap: 8 }}>
          <TextInput
            style={s.input}
            value={ai.config.cloudModel}
            onChangeText={(v) => void ai.setConfig({ cloudModel: v })}
            placeholder={ai.config.provider === 'groq' ? 'Modelo (vacío = llama-3.1-8b-instant)' : 'Modelo (vacío = gemini-2.0-flash)'}
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {ai.config.provider === 'groq' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['llama-3.1-8b-instant', 'openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'llama-3.3-70b-versatile'].map((m) => (
                <Button key={m} label={m} variant="ghost" onPress={() => void ai.setConfig({ cloudModel: m })} />
              ))}
            </View>
          ) : null}
          <Text style={s.small}>
            Si «Probar conexión» da error de modelo o de acceso, probá con otro de la lista (la cuenta gratuita no incluye todos).
          </Text>
        </View>
      ) : null}

      {local ? null : (
        <>
          <SectionTitle icon="KeyRound" color="#E9A23B">
            {own ? 'Clave (opcional)' : 'Clave'}
          </SectionTitle>
          <TextInput
            style={s.input}
            value={key}
            onChangeText={setKey}
            placeholder={
              ai.hasKey
                ? 'Clave guardada (pegá otra para reemplazarla)'
                : own
                  ? 'Solo si tu servidor la pide (OpenRouter sí)'
                  : 'Pegá tu clave acá'
            }
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </>
      )}
      <View style={{ gap: 8, marginTop: 8 }}>
        {local ? null : (
          <Button
            label="Guardar clave"
            disabled={!key.trim()}
            onPress={() => {
              void ai.saveKey(key);
              setKey('');
            }}
          />
        )}
        {!local && ai.hasKey ? <Button label="Borrar clave" variant="ghost" onPress={() => void ai.saveKey('')} /> : null}
        <Button
          label={ai.busy ? 'Probando…' : 'Probar conexión'}
          variant="ghost"
          disabled={ai.busy || !canUse}
          onPress={() => void ai.testConnection()}
        />
      </View>

      <View style={s.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Modo narrador</Text>
          <Text style={s.small}>
            Reescribe el texto de los eventos con tu contexto (si tarda más de 3 segundos o no conserva los hechos, se muestra el original).
            Además te deja responder las situaciones escribiendo: la IA decide qué pasa y cuántos puntos ganás o perdés.
          </Text>
        </View>
        <Switch
          value={ai.config.narrator}
          onValueChange={(v) => void ai.setConfig({ narrator: v })}
          trackColor={{ true: colors.accent }}
          disabled={!ai.config.enabled}
        />
      </View>

      <SectionTitle icon="Sparkles" color="#2A9D6F">
        Eventos generados · {ai.poolCount}
      </SectionTitle>
      <View style={{ gap: 8 }}>
        <Button
          label={ai.busy ? 'Generando…' : 'Generar 5 ahora'}
          variant="ghost"
          disabled={ai.busy || !canUse || !ai.config.enabled}
          onPress={() => void ai.generate(5)}
        />
        {__DEV__ ? (
          <Button
            label="Generar evento de prueba (simulado)"
            variant="ghost"
            disabled={ai.busy}
            onPress={() => void ai.generate(1, true)}
          />
        ) : null}
        <Button label="Vaciar pool" variant="danger" disabled={ai.poolCount === 0} onPress={() => void ai.clearPool()} />
      </View>
      {ai.status ? <Text style={[s.small, { marginTop: 8, color: colors.text }]}>{ai.status}</Text> : null}

      <SectionTitle icon="ShieldCheck" color="#3A86B4">
        Diagnóstico
      </SectionTitle>
      <Button
        label={showLog ? 'Ocultar rechazos' : `Ver rechazos (${ai.audit.length})`}
        variant="ghost"
        onPress={() => setShowLog((v) => !v)}
      />
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
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
