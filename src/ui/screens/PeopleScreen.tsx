import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { personActionStatus } from '../../engine/actions';
import { allPersonActions } from '../../engine/registry';
import type { Person, PersonKind } from '../../engine/types';
import { isBadVibes } from '../../engine/people';
import { relationTitle } from '../../engine/relationTitle';
import type { TitleTone } from '../../engine/relationTitle';
import { ACTION_CATEGORIES, ACTION_CATEGORY } from '../../content/personActions';
import type { ActionCategory } from '../../content/personActions';
import { FriendIcon } from '../FriendIcon';
import { Bar, IconTile, PersonAvatar, Row, SectionTitle } from '../components';
import { Icon } from '../Icon';
import { colors, radius, space } from '../theme';

const GROUPS: { title: string; kinds: PersonKind[]; icon: string; color: string }[] = [
  { title: 'Familia', kinds: ['mother', 'father', 'sibling'], icon: 'House', color: '#E9A23B' },
  { title: 'Pareja', kinds: ['partner'], icon: 'Heart', color: '#E0517A' },
  { title: 'Hijos', kinds: ['child'], icon: 'Baby', color: '#F4A261' },
  { title: 'Amigos', kinds: ['friend'], icon: 'Handshake', color: '#9B5DE5' },
  { title: 'Ex parejas', kinds: ['ex'], icon: 'HeartCrack', color: '#7A7466' },
];

const LABEL: Record<PersonKind, string> = {
  mother: 'Madre',
  father: 'Padre',
  sibling: 'Hermano/a',
  friend: 'Amigo/a',
  partner: 'Pareja',
  child: 'Hijo/a',
  ex: 'Ex',
};

// Barra de amor rosa clarito con un corazón; la de amistad va en verde o amarillo, y roja si es enemistad.
const LOVE_BAR = '#F7B6CB';
const LOVE_ICON = '#EC6E96';

/** Color de la barra de amistad: verde (50+), amarillo (0–49) y rojo si es negativa (enemistad). */
const friendColor = (f: number) => (f >= 50 ? colors.good : f >= 0 ? colors.warn : colors.bad);

const TONE_COLOR: Record<TitleTone, string> = { good: colors.good, love: LOVE_ICON, bad: colors.bad, neutral: colors.muted };

/** Ícono de la amistad: los dos amigos abrazados en verde; si es enemistad, otro ícono en rojo. */
function FriendshipIcon({ friendship }: { friendship: number }) {
  return friendship < 0 ? <Icon name="Swords" size={22} color={colors.bad} /> : <FriendIcon size={24} color={colors.good} />;
}

export function PeopleScreen() {
  const life = useGame((st) => st.life)!;
  const doAction = useGame((st) => st.personAction);
  const [selected, setSelected] = useState<string | null>(null);
  // Subpestaña de acciones abierta: pertenece a la persona elegida (al cambiar de persona vuelve a las categorías).
  const [catState, setCatState] = useState<{ id: string | null; cat: ActionCategory | null }>({ id: null, cat: null });
  const openCat = catState.id === selected ? catState.cat : null;
  const setOpenCat = (cat: ActionCategory | null) => setCatState({ id: selected, cat });
  const person = life.people.find((p) => p.id === selected);
  const blocked = life.pending.length > 0 || !life.alive;

  const hasPartner = (p: Person) => life.people.some((x) => x.alive && x.kind === 'partner' && x !== p);
  const titleOf = (p: Person) => relationTitle(p, hasPartner(p));
  // "Amiga · 23 años" o "Madre · Familiar cercano · 55 años": el título resume amistad, amor y enemistad.
  const detail = (p: Person) => {
    const t = titleOf(p).title;
    const kind = kindLabel(p);
    const parts = p.kind === 'friend' || t.toLowerCase().startsWith(kind.toLowerCase()) ? [t] : [kind, t];
    return `${parts.join(' · ')} · ${p.age} años`;
  };
  const kindLabel = (p: Person) => (p.kind === 'partner' && p.married ? (p.gender === 'F' ? 'Esposa' : 'Esposo') : LABEL[p.kind]);

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
        {GROUPS.map((g) => {
          const list = life.people.filter((p) => g.kinds.includes(p.kind));
          if (!list.length) return null;
          return (
            <React.Fragment key={g.title}>
              <SectionTitle icon={g.icon} color={g.color}>
                {g.title}
              </SectionTitle>
              {list.map((p) => (
                <Row
                  key={p.id}
                  avatar={<PersonAvatar person={p} life={life} size={46} />}
                  title={p.name}
                  subtitle={`${detail(p)}${p.alive ? '' : ' · Fallecido/a'}`}
                  disabled={!p.alive}
                  onPress={() => setSelected(p.id)}
                  right={
                    p.alive ? (
                      <View style={{ width: 54, gap: 4 }}>
                        <Bar value={Math.abs(p.friendship)} color={friendColor(p.friendship)} height={6} />
                        {p.romance !== undefined ? <Bar value={p.romance} color={LOVE_BAR} height={6} /> : null}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <PersonAvatar person={person} life={life} size={60} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.title}>{person.name}</Text>
                    <Text style={s.sub}>
                      {kindLabel(person)} · {person.age} años
                    </Text>
                    <View style={[s.pill, { borderColor: TONE_COLOR[titleOf(person).tone] }]}>
                      <Text style={[s.pillText, { color: TONE_COLOR[titleOf(person).tone] }]}>{titleOf(person).title}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <FriendshipIcon friendship={person.friendship} />
                      <View style={{ flex: 1 }}>
                        <Bar value={Math.abs(person.friendship)} color={friendColor(person.friendship)} height={8} />
                      </View>
                      <Text style={{ color: friendColor(person.friendship), fontWeight: '800' }}>
                        {isBadVibes(person) ? `Mala onda ${person.friendship}` : person.friendship}
                      </Text>
                    </View>
                    {person.romance !== undefined ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Icon name="Heart" size={18} color={LOVE_ICON} />
                        <View style={{ flex: 1 }}>
                          <Bar value={person.romance} color={LOVE_BAR} height={8} />
                        </View>
                        <Text style={{ color: LOVE_ICON, fontWeight: '800' }}>{person.romance}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <ScrollView style={{ maxHeight: 400, marginTop: 12 }}>
                  {(() => {
                    const groups = ACTION_CATEGORIES.map((cat) => ({
                      cat,
                      items: allPersonActions()
                        .filter((a) => ACTION_CATEGORY[a.id] === cat.id)
                        .map((a) => ({ a, st: personActionStatus(life, a, person) }))
                        .filter((x) => x.st.visible),
                    })).filter((g) => g.items.length);
                    const current = groups.find((g) => g.cat.id === openCat);
                    if (!current) {
                      // Vista de categorías: se elige una y aparecen solo sus acciones.
                      return (
                        <View>
                          <View style={s.catGrid}>
                            {groups.map(({ cat, items }) => (
                              <Pressable key={cat.id} onPress={() => setOpenCat(cat.id)} style={s.catCard} accessibilityRole="button">
                                <IconTile name={cat.icon} color={cat.color} size={38} />
                                <Text style={s.catCardTitle}>{cat.label}</Text>
                                <Text style={s.catCardCount}>
                                  {items.length} {items.length === 1 ? 'acción' : 'acciones'}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                          {person.romance === undefined && person.friendship < 50 && person.age >= 18 && life.age >= 18 ? (
                            <Text style={s.hint}>
                              Con {50 - person.friendship} punto{50 - person.friendship === 1 ? '' : 's'} más de amistad se desbloquean las
                              acciones de amor.
                            </Text>
                          ) : null}
                        </View>
                      );
                    }
                    return (
                      <View>
                        <Pressable onPress={() => setOpenCat(null)} style={s.backRow} accessibilityRole="button">
                          <Icon name="ArrowLeft" size={18} color={current.cat.color} />
                          <Text style={[s.catTitle, { color: current.cat.color, fontSize: 14 }]}>{current.cat.label}</Text>
                          <Text style={s.backHint}>Volver a las categorías</Text>
                        </Pressable>
                        {current.items.map(({ a, st }) => (
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
                      </View>
                    );
                  })()}
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
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  sub: { color: colors.muted, marginTop: 2 },
  pill: { alignSelf: 'flex-start', borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2, marginTop: 6 },
  pillText: { fontSize: 12, fontWeight: '800' },
  hint: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 6,
  },
  catCardTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  catCardCount: { color: colors.muted, fontSize: 12 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, marginBottom: 4 },
  backHint: { color: colors.muted, fontSize: 12, marginLeft: 'auto' },
  catHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginBottom: 2 },
  catTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  close: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingTop: 14 },
});
