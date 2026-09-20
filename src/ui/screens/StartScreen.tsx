import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { Button } from '../components';
import { Icon } from '../Icon';
import { colors, space } from '../theme';

export function StartScreen() {
  const start = useGame((st) => st.startCreating);
  return (
    <View style={s.wrap}>
      <Icon name="Activity" size={56} color={colors.accent} />
      <Text style={s.title}>VidaSim</Text>
      <Text style={s.sub}>Una vida entera. Un año por vez. Muchas malas decisiones.</Text>
      <View style={{ width: '100%', marginTop: space.xl }}>
        <Button label="Empezar una vida" icon="Baby" onPress={start} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: 8 },
  title: { color: colors.text, fontSize: 40, fontWeight: '900', marginTop: 8 },
  sub: { color: colors.muted, fontSize: 15, textAlign: 'center' },
});
