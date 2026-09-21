import React, { useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, useWindowDimensions, View } from 'react-native';
import { NATIVE } from './anim';
import { colors } from './theme';

/** Verdadero justo después de volver con el gesto: la pantalla de destino aparece de una, sin fundido (ya hubo animación). */
export const swipe = { justBack: false };

const EDGE = 32; // el gesto solo arranca cerca del borde izquierdo (no pisa los scrolls horizontales)

/** Deslizá desde el borde izquierdo hacia la derecha para volver atrás: la pantalla sigue al dedo, como en Instagram. */
export function SwipeBack({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const x = useRef(new Animated.Value(0)).current;
  const back = useRef(onBack);
  back.current = onBack;

  const pan = useMemo(() => {
    const reset = () => Animated.spring(x, { toValue: 0, useNativeDriver: NATIVE, bounciness: 0 }).start();
    return PanResponder.create({
      // "Capture": el gesto en el borde gana aunque debajo haya un ScrollView.
      onMoveShouldSetPanResponderCapture: (_e, g) => g.x0 <= EDGE && g.dx > 12 && g.dx > Math.abs(g.dy) * 2,
      onPanResponderMove: (_e, g) => x.setValue(Math.max(0, g.dx)),
      onPanResponderRelease: (_e, g) => {
        if (g.dx > width * 0.33 || g.vx > 0.6) {
          Animated.timing(x, { toValue: width, duration: 160, useNativeDriver: NATIVE }).start(() => {
            swipe.justBack = true;
            back.current();
            // Esperamos a que la pantalla nueva esté dibujada antes de traer la página a su lugar.
            requestAnimationFrame(() => requestAnimationFrame(() => x.setValue(0)));
          });
        } else reset();
      },
      onPanResponderTerminate: reset,
    });
  }, [width, x]);

  return (
    <View style={s.behind}>
      <Animated.View style={[s.page, { transform: [{ translateX: x }] }]} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  behind: { flex: 1, backgroundColor: colors.surface2 },
  page: {
    flex: 1,
    backgroundColor: colors.bg,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: -4, height: 0 },
    elevation: 8,
  },
});
