import { scaleText } from '../../content/eras';
import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useGame } from '../../store/gameStore';
import { activityStatus } from '../../engine/actions';
import { allActivities } from '../../engine/registry';
import { Row, SectionTitle } from '../components';
import { CATEGORY_STYLE } from '../../content/icons';
import { colors, space } from '../theme';
import type { Activity } from '../../engine/types';

const ORDER: { id: Activity['category']; label: string }[] = [
  { id: 'salud', label: 'Salud' },
  { id: 'ocio', label: 'Ocio' },
  { id: 'social', label: 'Social' },
  { id: 'estudio', label: 'Estudio' },
  { id: 'dinero', label: 'Dinero' },
  { id: 'crimen', label: 'Crimen' },
];

export function ActivitiesScreen() {
  const life = useGame((st) => st.life)!;
  const activity = useGame((st) => st.activity);
  const blocked = life.pending.length > 0 || !life.alive;

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
      <Text style={{ color: colors.muted, marginTop: 2 }}>Cada una se puede hacer una vez por año.</Text>
      {ORDER.map((cat) => {
        const items = allActivities()
          .filter((a) => a.category === cat.id)
          .map((a) => ({ a, st: activityStatus(life, a) }))
          .filter((x) => x.st.visible);
        if (!items.length) return null;
        return (
          <React.Fragment key={cat.id}>
            <SectionTitle icon={CATEGORY_STYLE[cat.id].icon} color={CATEGORY_STYLE[cat.id].color}>{cat.label}</SectionTitle>
            {items.map(({ a, st }) => (
              <Row
                key={a.id}
                icon={a.icon}
                tint={CATEGORY_STYLE[cat.id].color}
                title={a.label}
                subtitle={st.reason ?? scaleText(a.desc, life.year)}
                disabled={blocked || !!st.reason}
                onPress={() => activity(a.id)}
              />
            ))}
          </React.Fragment>
        );
      })}
    </ScrollView>
  );
}
