import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import type { Gender, Look } from '../../engine/types';
import { randomLook } from '../../engine/life';
import { FEMALE_NAMES, MALE_NAMES, SURNAMES } from '../../content/names';
import { Avatar } from '../Avatar';
import { Icon } from '../Icon';
import { FadeIn, Pop } from '../anim';

const rint = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

interface Candidate {
  name: string;
  surname: string;
  look: Look;
}

const CARD_COLORS = ['#2A9D6F', '#E9A23B', '#E76F51'];

function makeCandidates(gender: Gender): Candidate[] {
  return [0, 1, 2].map(() => ({
    name: pick(gender === 'M' ? MALE_NAMES : FEMALE_NAMES),
    surname: pick(SURNAMES),
    look: randomLook({ int: rint }, gender),
  }));
}

/** Primera vida guiada: 1) elegís un género, 2) elegís entre tres personajes al azar. */
export function GuidedStartScreen() {
  const newLife = useGame((st) => st.newLife);
  const setCreating = useGame((st) => st.setCreating);
  const [gender, setGender] = useState<Gender | null>(null);
  const [round, setRound] = useState(0);
  const candidates = useMemo(() => (gender ? makeCandidates(gender) : []), [gender, round]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!gender) {
    return (
      <View style={s.wrap}>
        <FadeIn style={{ alignItems: 'center', gap: 10 }}>
          <Icon name="Globe" size={40} color="#FFE082" />
          <Text style={s.title}>Convertite en otra persona.</Text>
          <Text style={s.sub}>Empezá eligiendo un género.</Text>
        </FadeIn>
        <View style={{ gap: 16, marginTop: 34 }}>
          <Pop delay={150}>
            <Pressable onPress={() => setGender('M')} style={[s.big, { backgroundColor: '#3A86B4' }]}>
              <Icon name="User" size={24} color="#fff" />
              <Text style={s.bigText}>Masculino</Text>
            </Pressable>
          </Pop>
          <Pop delay={280}>
            <Pressable onPress={() => setGender('F')} style={[s.big, { backgroundColor: '#E0517A' }]}>
              <Icon name="User" size={24} color="#fff" />
              <Text style={s.bigText}>Femenino</Text>
            </Pressable>
          </Pop>
        </View>
        <Pressable onPress={() => setCreating({ step: 'create' })} hitSlop={10} style={{ marginTop: 30 }}>
          <Text style={s.link}>Prefiero armar mi personaje a mano</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <FadeIn style={{ alignItems: 'center', gap: 10 }}>
        <Text style={s.title}>Ahora, elegí en quién convertirte.</Text>
      </FadeIn>
      <View style={{ gap: 14, marginTop: 30 }}>
        {candidates.map((c, i) => (
          <Pop key={`${round}-${i}`} delay={120 + i * 120}>
            <Pressable
              onPress={() => newLife({ name: c.name, surname: c.surname, gender, look: c.look })}
              style={[s.big, { backgroundColor: CARD_COLORS[i], justifyContent: 'flex-start', paddingLeft: 14 }]}
            >
              <Avatar look={c.look} size={52} />
              <Text style={[s.bigText, { flex: 1 }, i === 1 && { color: '#3B2F00' }]} numberOfLines={1}>
                {c.name} {c.surname}
              </Text>
            </Pressable>
          </Pop>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 22, marginTop: 26 }}>
        <Pressable onPress={() => setRound((r) => r + 1)} hitSlop={10}>
          <Text style={s.link}>Ver otros tres</Text>
        </Pressable>
        <Pressable onPress={() => setGender(null)} hitSlop={10}>
          <Text style={s.link}>Cambiar género</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#12343B', padding: 24, justifyContent: 'center' },
  title: { color: '#FFE082', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  sub: { color: '#FFE082', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  big: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  bigText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  link: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecorationLine: 'underline', textAlign: 'center' },
});
