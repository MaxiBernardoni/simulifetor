import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../store/gameStore';
import { IconTile } from './components';
import { NATIVE } from './anim';
import { colors } from './theme';

/** Aviso animado que baja desde arriba cuando desbloqueás un logro. */
export function AchievementToast() {
  const toast = useGame((s) => s.toast);
  const pending = useGame((s) => (s.life?.pending.length ?? 0) > 0);
  const clear = useGame((s) => s.clearToast);
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(-160)).current;
  const visible = !!toast && !pending;

  useEffect(() => {
    if (!visible) return;
    y.setValue(-160);
    const anim = Animated.sequence([
      Animated.spring(y, { toValue: 0, friction: 6, tension: 90, useNativeDriver: NATIVE }),
      Animated.delay(2600),
      Animated.timing(y, { toValue: -160, duration: 320, easing: Easing.in(Easing.cubic), useNativeDriver: NATIVE }),
    ]);
    anim.start(({ finished }) => {
      if (finished) clear();
    });
    return () => anim.stop();
  }, [visible, toast?.id, y, clear]);

  if (!visible || !toast) return null;
  return (
    <Animated.View pointerEvents="none" style={[s.wrap, { top: insets.top + 8, transform: [{ translateY: y }] }]}>
      <IconTile name={toast.icon} color="#E9A23B" size={44} solid />
      <View style={{ flex: 1 }}>
        <Text style={s.kicker}>Logro desbloqueado</Text>
        <Text style={s.title}>{toast.title}</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 2, borderColor: '#E9A23B',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 10,
  },
  kicker: { color: '#B77A12', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 17, fontWeight: '800' },
});
