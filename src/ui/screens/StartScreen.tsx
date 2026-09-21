import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../../store/gameStore';
import { Button } from '../components';
import { colors, space } from '../theme';

export function StartScreen() {
  const start = useGame((st) => st.startCreating);
  return (
    <View style={s.wrap}>
      <Text style={s.title}>VidaSim</Text>
      <Text style={s.sub}>Una vida entera. Un año por vez. Muchas malas decisiones.</Text>
      <View style={{ width: '100%', marginTop: space.xl * 1.5 }}>
        <Button label="Empezar una vida" icon="Baby" onPress={start} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: 10, backgroundColor: colors.header },
  title: {
    color: colors.headerText, fontSize: 56, fontWeight: '900',
    textShadowColor: '#0A3A7A', textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0,
  },
  sub: { color: '#fff', fontSize: 16, textAlign: 'center', fontWeight: '600' },
});
