import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import type { LogEntry, StatKey } from '../../engine/types';
import { Button, Card, DeltaChips, StatBar } from '../components';
import { colors, space, toneColor } from '../theme';

const STATS: StatKey[] = ['happiness', 'health', 'smarts', 'looks'];

interface Group {
  age: number;
  year: number;
  entries: LogEntry[];
}

export function LifeScreen() {
  const life = useGame((st) => st.life)!;
  const ageUp = useGame((st) => st.ageUp);

  const groups = useMemo(() => {
    const out: Group[] = [];
    for (const e of life.log) {
      const last = out[out.length - 1];
      if (last && last.age === e.age) last.entries.push(e);
      else out.push({ age: e.age, year: e.year, entries: [e] });
    }
    return out.reverse();
  }, [life.log]);

  const blocked = life.pending.length > 0 || !life.alive;

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={s.name}>
          {life.name} {life.surname}
        </Text>
        <Text style={s.sub}>
          {life.age} {life.age === 1 ? 'año' : 'años'} · {life.year}
          {life.jailYears > 0 ? ` · Preso (${life.jailYears})` : ''}
        </Text>
      </View>
      <Card style={{ marginHorizontal: space.lg }}>
        {STATS.map((k) => (
          <StatBar key={k} stat={k} value={life.stats[k]} />
        ))}
        <DeltaChips deltas={life.lastDelta} />
      </Card>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: space.lg, paddingBottom: 110 }}
        data={groups}
        keyExtractor={(g) => String(g.age)}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 14 }}>
            <Text style={s.groupHead}>
              Edad {item.age} <Text style={{ color: colors.border }}>· {item.year}</Text>
            </Text>
            {item.entries.map((e, i) => (
              <View key={i} style={[s.entry, { borderLeftColor: toneColor[e.tone] }]}>
                {e.title ? <Text style={s.entryTitle}>{e.title}</Text> : null}
                <Text style={s.entryText}>{e.text}</Text>
              </View>
            ))}
          </View>
        )}
      />
      <View style={s.footer}>
        <Button label="Envejecer" icon="Zap" onPress={ageUp} disabled={blocked} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1 },
  header: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md },
  name: { color: colors.text, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.muted, fontSize: 14, marginTop: 2 },
  groupHead: { color: colors.text, fontWeight: '800', fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  entry: { borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 4, marginBottom: 6 },
  entryTitle: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 1 },
  entryText: { color: colors.text, fontSize: 15, lineHeight: 21 },
  footer: { position: 'absolute', left: space.lg, right: space.lg, bottom: space.lg },
});
