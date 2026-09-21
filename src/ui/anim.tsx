import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

// En web no hay driver nativo; en el celu sí (más fluido).
export const NATIVE = Platform.OS !== 'web';

interface Base {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Aparece desplazándose suavemente desde abajo. */
export function FadeIn({ children, style, delay = 0, duration = 380, from = 14 }: Base & { delay?: number; duration?: number; from?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE }).start();
  }, [v, delay, duration]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/** Aparece con rebote (resorte). */
export function Pop({ children, style, delay = 0, from = 0.3 }: Base & { delay?: number; from?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([Animated.delay(delay), Animated.spring(v, { toValue: 1, friction: 5, tension: 120, useNativeDriver: NATIVE })]).start();
  }, [v, delay]);
  return <Animated.View style={[style, { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [from, 1] }) }] }]}>{children}</Animated.View>;
}

/** Sube y baja suavemente, en bucle. */
export function Bob({ children, style, amp = 3, period = 1900, delay = 0 }: Base & { amp?: number; period?: number; delay?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: period / 2, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
        Animated.timing(v, { toValue: 0, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, period, delay]);
  return <Animated.View style={[style, { transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [amp, -amp] }) }] }]}>{children}</Animated.View>;
}

/** Se desplaza de lado a lado (nubes). */
export function Drift({ children, style, amp = 14, period = 7000 }: Base & { amp?: number; period?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
        Animated.timing(v, { toValue: 0, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, period]);
  return <Animated.View style={[style, { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-amp, amp] }) }] }]}>{children}</Animated.View>;
}

/** Pulso suave (escala) para llamar la atención. */
export function Pulse({ children, style, active = true, amount = 0.05, period = 1400 }: Base & { active?: boolean; amount?: number; period?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) {
      v.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
        Animated.timing(v, { toValue: 0, duration: period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, active, period]);
  return <Animated.View style={[style, { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + amount] }) }] }]}>{children}</Animated.View>;
}

/** Sacudida horizontal (malas noticias). */
export function Shake({ children, style, active = false }: Base & { active?: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    Animated.sequence([
      Animated.delay(250),
      ...[8, -8, 6, -6, 3, 0].map((to) => Animated.timing(v, { toValue: to, duration: 60, useNativeDriver: NATIVE })),
    ]).start();
  }, [v, active]);
  return <Animated.View style={[style, { transform: [{ translateX: v }] }]}>{children}</Animated.View>;
}

/** Botón que se achica al presionarlo. */
export function PressScale({ children, onPress, disabled, style, outerStyle, to = 0.9 }: Base & { onPress: () => void; disabled?: boolean; to?: number; outerStyle?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(1)).current;
  const animate = (toValue: number) => Animated.spring(v, { toValue, friction: 6, tension: 220, useNativeDriver: NATIVE }).start();
  return (
    <Pressable style={outerStyle} onPress={onPress} disabled={disabled} onPressIn={() => animate(to)} onPressOut={() => animate(1)}>
      <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Devuelve un estilo animado que "salta" cada vez que cambia `value`. */
export function useBump(value: unknown, peak = 1.14) {
  const v = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    Animated.sequence([
      Animated.timing(v, { toValue: peak, duration: 130, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE }),
      Animated.spring(v, { toValue: 1, friction: 4, tension: 140, useNativeDriver: NATIVE }),
    ]).start();
  }, [value, v, peak]);
  return { transform: [{ scale: v }] };
}

/** Salto vertical (el avatar "crece" un año). */
export function useHop(value: unknown, height = 8) {
  const v = useRef(new Animated.Value(0)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    Animated.sequence([
      Animated.timing(v, { toValue: -height, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE }),
      Animated.spring(v, { toValue: 0, friction: 4, tension: 160, useNativeDriver: NATIVE }),
    ]).start();
  }, [value, v, height]);
  return { transform: [{ translateY: v }] };
}
