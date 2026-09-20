import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { personActionStatus } from '../../engine/actions';
import { allPersonActions } from '../../engine/registry';
import type { Person, PersonKind } from '../../engine/types';
import { Bar, Row, SectionTitle } from '../components';
import { Icon } from '../Icon';
import { colors, radius, space } from '../theme';

const GROUPS: { title: string; kinds: PersonKind[] }[] = [
  { title: 'Familia', kinds: ['mother', 'father', 'sibling'] },
  { title: 'Pareja', kinds: ['partner'] },
  { title: 'Hijos', kinds: ['child'] },
  { title: 'Amigos', kinds: ['friend'] },
  { title: 'Ex parejas', kinds: ['ex'] },
];

const LABEL: Record<PersonKind, string> = {
  mother: 'Madre', father: 'Padre', sibling: 'Hermano/a', friend: 'Amigo/a', partner: 'Pareja', child: 'Hijo/a', ex: 'Ex',
};

export function PeopleScreen() {
  const life = useGame((st) => st.life)!;
  const doAction = useGame((st) => st.personAction);
  const [selected, setSelected] = useState<string | null>(null);
  const person = life.people.find((p) => p.id === selected);
  const blocked = life.pending.length > 0 || !life.alive;

  const kindLabel = (p: Person) => (p.kind === 'partner' && p.married ? (p.gender === 'F' ? 'Esposa' : 'Esposo') : LABEL[p.kind]);

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>Relaciones</Text>
        {GROUPS.map((g) => {
          const list = life.people.filter((p) => g.kinds.includes(p.kind));
          if (!list.length) return null;
          return (
            <React.Fragment key={g.title}>
              <SectionTitle>{g.title}</SectionTitle>
              {list.map((p) => (
                <Row
                  key={p.id}
                  icon={p.alive ? (p.kind === 'partner' ? 'Heart' : 'Users') : 'Ghost'}
                  title={p.name}
                  subtitle={`${kindLabel(p)} · ${p.age} años${p.alive ? '' : ' · Fallecido/a'}`}
                  disabled={!p.alive}
                  onPress={() => setSelected(p.id)}
                  right={
                    p.alive ? (
                      <View style={{ width: 54 }}>
                        <Bar value={p.closeness} color={p.closeness > 60 ? colors.good : p.closeness > 30 ? colors.warn : colors.bad} height={6} />
                      </View>
                    ) : undefined
                  }
                />
              ))}
            </React.Fragment>
          );
        })}
      </ScrollView>

      <Modal transparent animationType="slide" visible={!!person} onRequestClose={() => setSelected(null)}>
        <Pressable style={s.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={s.sheet} onPress={() => undefined}>
            {person ? (
              <>
                <Text style={s.title}>{person.name}</Text>
                <Text style={s.sub}>
                  {kindLabel(person)} · {person.age} años · Relación {person.closeness}/100
                </Text>
                <ScrollView style={{ maxHeight: 380, marginTop: 12 }}>
                  {allPersonActions()
                    .map((a) => ({ a, st: personActionStatus(life, a, person) }))
                    .filter((x) => x.st.visible)
                    .map(({ a, st }) => (
                      <Row
                        key={a.id}
                        icon={a.icon}
                        title={a.label}
                        subtitle={st.reason}
                        disabled={blocked || !!st.reason}
                        onPress={() => {
                          setSelected(null);
                          doAction(a.id, person.id);
                        }}
                      />
                    ))}
                </ScrollView>
                <Pressable onPress={() => setSelected(null)} style={s.close}>
                  <Icon name="X" size={18} color={colors.muted} />
                  <Text style={{ color: colors.muted }}>Cerrar</Text>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  sub: { color: colors.muted, marginTop: 2 },
  close: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingTop: 14 },
});
