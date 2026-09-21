import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GLOSSARY, HELP } from '../../content/help';
import { Card, IconTile, SectionTitle } from '../components';
import { Icon } from '../Icon';
import { colors, radius, space } from '../theme';

/** "Cómo se juega": secciones plegables y glosario. */
export function HelpScreen() {
  const [open, setOpen] = useState<string | null>('stats');
  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
      {HELP.map((h) => {
        const isOpen = open === h.id;
        return (
          <Card key={h.id} style={{ marginBottom: 8, padding: 0 }}>
            <Pressable onPress={() => setOpen(isOpen ? null : h.id)} style={s.head} accessibilityRole="button">
              <IconTile name={h.icon} color={colors.accent} size={38} solid />
              <Text style={s.title}>{h.title}</Text>
              <Icon name="ChevronRight" size={18} color={colors.muted} />
            </Pressable>
            {isOpen ? (
              <View style={s.body}>
                {h.body.map((p, i) => (
                  <Text key={i} style={s.p}>
                    {p}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        );
      })}
      <SectionTitle icon="BookOpen" color="#9B5DE5">
        Glosario
      </SectionTitle>
      <Card>
        {GLOSSARY.map((g) => (
          <View key={g.term} style={{ marginBottom: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>{g.term}</Text>
            <Text style={s.p}>{g.def}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  title: { flex: 1, color: colors.text, fontWeight: '800', fontSize: 15 },
  body: { paddingHorizontal: 14, paddingBottom: 14, gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  p: { color: colors.muted, fontSize: 13.5, lineHeight: 19, borderRadius: radius.sm },
});
