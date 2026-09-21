import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { summarize, useGame } from '../../store/gameStore';
import type { LifeSummary, Look } from '../../engine/types';
import { formatMoney } from '../../engine/format';
import { Avatar } from '../Avatar';
import { Card, PersonAvatar, SectionTitle } from '../components';
import { Icon } from '../Icon';
import { FadeIn } from '../anim';
import { colors, space } from '../theme';

const DEFAULT_LOOK: Look = { skin: 1, eyes: 0, hairStyle: 0, hairColor: 1 };

export function FamilyTreeScreen() {
  const life = useGame((st) => st.life)!;
  const history = useGame((st) => st.history);

  const { nodes, others } = useMemo(() => {
    const mine = history.filter((h) => (h.lineageId ?? h.id) === life.lineageId);
    const list: LifeSummary[] = [...mine];
    if (life.alive && !list.some((h) => h.id === life.id)) list.push(summarize(life));
    list.sort((a, b) => (a.generation ?? 1) - (b.generation ?? 1) || a.birthYear - b.birthYear);
    const groups = new Map<string, LifeSummary[]>();
    for (const h of history) {
      const k = h.lineageId ?? h.id;
      if (k === life.lineageId) continue;
      groups.set(k, [...(groups.get(k) ?? []), h]);
    }
    return { nodes: list, others: [...groups.values()] };
  }, [history, life]);

  const total = nodes.reduce((sum, n) => sum + (n.legacy ?? 0), 0);
  const kids = life.people.filter((p) => p.kind === 'child');
  const partner = life.people.find((p) => p.kind === 'partner' && p.alive);

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
      <Card style={{ alignItems: 'center', backgroundColor: colors.accentSoft, borderColor: colors.accent }}>
        <Icon name="Crown" size={30} color="#B77A12" />
        <Text style={s.dyn}>Dinastía {life.surname}</Text>
        <Text style={s.dynSub}>
          {nodes.length} {nodes.length === 1 ? 'generación' : 'generaciones'} · Legado total {total} pts
        </Text>
      </Card>

      <SectionTitle icon="Users" color="#9B5DE5">Generaciones</SectionTitle>
      {nodes.map((n, i) => {
        const current = n.id === life.id;
        return (
          <React.Fragment key={n.id}>
            {i > 0 ? (
              <View style={s.link}>
                <View style={s.line} />
                <Icon name="ChevronDown" size={16} color={colors.border} />
              </View>
            ) : null}
            <FadeIn delay={i * 90}>
              <Card style={current ? { borderColor: colors.accent, borderWidth: 2 } : undefined}>
                <View style={s.row}>
                  <Avatar look={n.look ?? DEFAULT_LOOK} size={60} />
                  <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                      <Text style={s.name}>{n.name}</Text>
                      {current ? <Text style={s.you}>{life.alive ? 'VOS' : 'ÚLTIMA'}</Text> : null}
                    </View>
                    <Text style={s.sub}>
                      Gen. {n.generation ?? 1} · {n.birthYear} – {life.alive && current ? '…' : n.deathYear}
                    </Text>
                    <Text style={s.sub}>
                      {n.job} · {formatMoney(n.netWorth ?? n.money)}
                    </Text>
                  </View>
                  <View style={s.legacy}>
                    <Icon name="Award" size={16} color="#B77A12" />
                    <Text style={s.legacyText}>{n.legacy ?? '–'}</Text>
                  </View>
                </View>
                {!(life.alive && current) ? <Text style={s.cause}>Murió de {n.cause}</Text> : null}
              </Card>
            </FadeIn>
          </React.Fragment>
        );
      })}

      <SectionTitle icon="Baby" color="#F4A261">Familia actual</SectionTitle>
      {!partner && kids.length === 0 ? (
        <Text style={{ color: colors.muted }}>Sin pareja ni hijos por ahora. Ellos serían tus herederos.</Text>
      ) : (
        <View style={s.family}>
          {partner ? (
            <View style={s.member}>
              <PersonAvatar person={partner} life={life} size={54} />
              <Text style={s.mName} numberOfLines={1}>{partner.name.split(' ')[0]}</Text>
              <Text style={s.mSub}>{partner.married ? 'Pareja (casados)' : 'Pareja'} · {partner.age}</Text>
            </View>
          ) : null}
          {kids.map((k) => (
            <View key={k.id} style={[s.member, !k.alive && { opacity: 0.5 }]}>
              <PersonAvatar person={k} life={life} size={54} />
              <Text style={s.mName} numberOfLines={1}>{k.name.split(' ')[0]}</Text>
              <Text style={s.mSub}>{k.alive ? `Hijo/a · ${k.age}` : 'Fallecido/a'}</Text>
            </View>
          ))}
        </View>
      )}

      {others.length > 0 ? (
        <>
          <SectionTitle icon="Ghost" color="#5B6572">Otras dinastías</SectionTitle>
          {others.map((g) => (
            <View key={g[0].lineageId ?? g[0].id} style={s.other}>
              <Icon name="Crown" size={18} color="#B77A12" />
              <Text style={{ flex: 1, color: colors.text, fontWeight: '700' }}>
                {g[0].name.split(' ').slice(1).join(' ') || g[0].name}
              </Text>
              <Text style={{ color: colors.muted }}>
                {g.length} {g.length === 1 ? 'vida' : 'vidas'} · {g.reduce((a, x) => a + (x.legacy ?? 0), 0)} pts
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  dyn: { color: colors.nameBlue, fontSize: 22, fontWeight: '900', marginTop: 4 },
  dynSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  link: { alignItems: 'center', marginVertical: 2 },
  line: { width: 3, height: 14, backgroundColor: colors.border, borderRadius: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: colors.text, fontSize: 17, fontWeight: '800', flexShrink: 1 },
  you: { color: '#fff', backgroundColor: colors.accent, fontSize: 10, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  sub: { color: colors.muted, fontSize: 13, marginTop: 1 },
  cause: { color: colors.bad, fontSize: 12, fontWeight: '600', marginTop: 8 },
  legacy: { alignItems: 'center', backgroundColor: '#FFF3D6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, gap: 2 },
  legacyText: { color: '#B77A12', fontWeight: '900', fontSize: 15 },
  family: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  member: { width: 96, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: colors.border, gap: 3 },
  mName: { color: colors.text, fontWeight: '700', fontSize: 13 },
  mSub: { color: colors.muted, fontSize: 11, textAlign: 'center' },
  other: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
});
