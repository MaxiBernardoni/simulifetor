import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { getScenario } from '../../content/scenarios';
import type { Gender, Look } from '../../engine/types';
import { randomLook } from '../../engine/life';
import { FEMALE_NAMES, MALE_NAMES, SURNAMES } from '../../content/names';
import { EYE_COLORS, EYE_NAMES, HAIR_COLORS, HAIRS, hairForGender, hairStylesFor, SKIN_NAMES, SKIN_TONES } from '../../content/look';
import { Avatar } from '../Avatar';
import { Button, IconTile, SectionTitle } from '../components';
import { Icon } from '../Icon';
import { colors, radius, space } from '../theme';

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const rint = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

function Swatches({
  palette,
  value,
  onChange,
  names,
}: {
  palette: string[];
  value: number;
  onChange: (i: number) => void;
  names?: string[];
}) {
  return (
    <View style={s.swatchRow}>
      {palette.map((c, i) => (
        <Pressable
          key={c}
          accessibilityLabel={names?.[i]}
          onPress={() => onChange(i)}
          style={[s.swatch, { backgroundColor: c }, value === i && s.swatchOn]}
        >
          {value === i ? <Icon name="Check" size={16} color={i === 4 && palette === HAIR_COLORS ? '#000' : '#fff'} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

export function CreateScreen() {
  const newLife = useGame((st) => st.newLife);
  const cancel = useGame((st) => st.cancelCreate);
  const creating = useGame((st) => st.creating);
  const scenario = creating?.scenarioId ? getScenario(creating.scenarioId) : undefined;

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [gender, setGender] = useState<Gender>('M');
  const [look, setLook] = useState<Look>({ skin: 1, eyes: 0, hairStyle: 0, hairColor: 1 });
  const changeGender = (g: Gender) => {
    setGender(g);
    setLook((l) => ({ ...l, hairStyle: hairForGender(l.hairStyle, g) }));
  };
  const set = (patch: Partial<Look>) => setLook((l) => ({ ...l, ...patch }));

  const randomize = () => {
    const g: Gender = Math.random() < 0.5 ? 'M' : 'F';
    setGender(g);
    setName(pick(g === 'M' ? MALE_NAMES : FEMALE_NAMES));
    setSurname(pick(SURNAMES));
    setLook(randomLook({ int: rint }, g));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {scenario ? (
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              backgroundColor: scenario.color + '18',
              borderColor: scenario.color + '55',
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              marginBottom: space.lg,
            }}
          >
            <IconTile name={scenario.icon} color={scenario.color} size={42} solid />
            <View style={{ flex: 1 }}>
              <Text style={{ color: scenario.color, fontWeight: '800' }}>{scenario.title}</Text>
              <Text style={{ color: colors.text, fontSize: 13, marginTop: 2 }}>{scenario.goal}</Text>
            </View>
          </View>
        ) : null}
        <View style={{ alignItems: 'center', marginBottom: space.lg }}>
          <Avatar look={look} size={150} animated />
        </View>

        <Button label="Aleatorio" icon="Dices" variant="ghost" onPress={randomize} />

        <SectionTitle icon="IdCard" color="#0E7C7B">
          Nombre
        </SectionTitle>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre (vacío = al azar)"
          placeholderTextColor={colors.muted}
          maxLength={16}
          autoCapitalize="words"
        />
        <TextInput
          style={[s.input, { marginTop: 8 }]}
          value={surname}
          onChangeText={setSurname}
          placeholder="Apellido (vacío = al azar)"
          placeholderTextColor={colors.muted}
          maxLength={18}
          autoCapitalize="words"
        />

        <SectionTitle icon="Users" color="#9B5DE5">
          Género
        </SectionTitle>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['M', 'F'] as Gender[]).map((g) => (
            <Pressable key={g} onPress={() => changeGender(g)} style={[s.choice, s.half, gender === g && s.choiceOn]}>
              <Text style={[s.choiceText, gender === g && { color: '#fff' }]}>{g === 'M' ? 'Masculino' : 'Femenino'}</Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle icon="Palette" color="#E76F51">
          Color de piel · {SKIN_NAMES[look.skin]}
        </SectionTitle>
        <Swatches palette={SKIN_TONES} value={look.skin} onChange={(i) => set({ skin: i })} names={SKIN_NAMES} />

        <SectionTitle icon="Eye" color="#3A86B4">
          Color de ojos · {EYE_NAMES[look.eyes]}
        </SectionTitle>
        <Swatches palette={EYE_COLORS} value={look.eyes} onChange={(i) => set({ eyes: i })} names={EYE_NAMES} />

        <SectionTitle icon="Scissors" color="#E0517A">
          Peinado
        </SectionTitle>
        <View style={s.hairGrid}>
          {hairStylesFor(gender === 'F' ? 'F' : 'M').map((i) => (
            <Pressable key={i} onPress={() => set({ hairStyle: i })} style={[s.hairCard, look.hairStyle === i && s.hairCardOn]}>
              <Avatar look={{ ...look, hairStyle: i }} size={64} />
              <Text style={[s.hairName, look.hairStyle === i && { color: colors.accent }]} numberOfLines={1}>
                {HAIRS[i].name}
              </Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle icon="Droplet" color="#E9A23B">
          Color de pelo
        </SectionTitle>
        <Swatches palette={HAIR_COLORS} value={look.hairColor} onChange={(i) => set({ hairColor: i })} />

        <View style={{ marginTop: space.xl, gap: 10 }}>
          <Button
            label={scenario ? 'Comenzar escenario' : 'Comenzar vida'}
            icon="Baby"
            onPress={() => newLife({ name, surname, gender, look })}
          />
          <Button label="Cancelar" variant="ghost" onPress={cancel} />
        </View>
        <Text style={s.hint}>El año de nacimiento, la familia y los stats iniciales se sortean al azar.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  title: { color: colors.text, fontSize: 26, fontWeight: '800' },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  choice: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  choiceText: { color: colors.muted, fontWeight: '700' },
  hairGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hairCard: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hairCardOn: { borderColor: colors.accent },
  hairName: { color: colors.muted, fontSize: 10.5, fontWeight: '700', marginTop: 3 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9 },
  half: { flex: 1 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchOn: { borderColor: '#fff' },
  hint: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: space.md },
});
