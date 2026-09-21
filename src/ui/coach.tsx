import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { create } from 'zustand';
import { COACH_STEPS } from '../content/help';
import { useGame } from '../store/gameStore';
import { Icon } from './Icon';
import { FadeIn } from './anim';
import { colors } from './theme';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CoachState {
  active: boolean;
  step: number;
  rects: Record<string, Rect>;
  setRect: (id: string, r: Rect) => void;
  start: () => void;
  go: (delta: number) => void;
  stop: () => void;
}

/** Guía de la primera vida: oscurece la pantalla y resalta, de a una, las partes de la app. */
export const useCoach = create<CoachState>((set) => ({
  active: false,
  step: 0,
  rects: {},
  setRect: (id, r) =>
    set((s) => {
      const p = s.rects[id];
      return p && p.x === r.x && p.y === r.y && p.w === r.w && p.h === r.h ? s : { rects: { ...s.rects, [id]: r } };
    }),
  start: () => set({ active: true, step: 0 }),
  go: (delta) => set((s) => ({ step: Math.max(0, Math.min(COACH_STEPS.length - 1, s.step + delta)) })),
  stop: () => set({ active: false }),
}));

/** Marca una parte de la pantalla como destino de la guía (se mide solo cuando le toca). */
export function CoachTarget({ id, style, children }: { id: string; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const ref = useRef<View>(null);
  const setRect = useCoach((s) => s.setRect);
  const mine = useCoach((s) => s.active && COACH_STEPS[s.step]?.target === id);
  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, w, h) => {
      if (w > 0 && h > 0) setRect(id, { x, y, w, h });
    });
  }, [id, setRect]);
  useEffect(() => {
    if (!mine) return;
    measure();
    const t = setInterval(measure, 250); // por si la pantalla todavía se está acomodando
    return () => clearInterval(t);
  }, [mine, measure]);
  return (
    <View ref={ref} collapsable={false} onLayout={measure} style={style}>
      {children}
    </View>
  );
}

const PAD = 6;

/** Capa oscura con un "agujero" sobre el destino, un aro coral y el globo de texto con los botones. */
export function CoachOverlay() {
  const { active, step, rects, go, stop } = useCoach();
  const markSeen = useGame((s) => s.markTutorialSeen);
  const { width, height } = useWindowDimensions();
  if (!active) return null;
  const def = COACH_STEPS[step];
  const r = rects[def.target];
  const last = step === COACH_STEPS.length - 1;
  const finish = () => {
    stop();
    markSeen();
  };

  const hole = r ? { x: Math.max(0, r.x - PAD), y: Math.max(0, r.y - PAD), w: r.w + PAD * 2, h: r.h + PAD * 2 } : null;
  const showBelow = hole ? hole.y + hole.h / 2 < height * 0.5 : false;
  const scrim = { position: 'absolute', backgroundColor: 'rgba(8,18,22,0.82)' } as const;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto" onStartShouldSetResponder={() => true}>
      {hole ? (
        <>
          <View style={[scrim, { left: 0, top: 0, width, height: hole.y }]} />
          <View style={[scrim, { left: 0, top: hole.y + hole.h, width, height: Math.max(0, height - hole.y - hole.h) }]} />
          <View style={[scrim, { left: 0, top: hole.y, width: hole.x, height: hole.h }]} />
          <View style={[scrim, { left: hole.x + hole.w, top: hole.y, width: Math.max(0, width - hole.x - hole.w), height: hole.h }]} />
          <View pointerEvents="none" style={[s.ring, { left: hole.x, top: hole.y, width: hole.w, height: hole.h }]} />
        </>
      ) : (
        <View style={[scrim, { left: 0, top: 0, width, height }]} />
      )}

      <View
        style={[
          s.bubbleWrap,
          hole && showBelow ? { top: hole.y + hole.h + 18 } : hole ? { bottom: height - hole.y + 18 } : { top: height * 0.35 },
        ]}
      >
        <FadeIn key={step} from={10}>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Icon name={def.icon} size={34} color="#FFE082" />
            <Text style={s.text}>{def.text}</Text>
            <View style={s.dots}>
              {COACH_STEPS.map((_, i) => (
                <View key={i} style={[s.dot, i === step && s.dotOn]} />
              ))}
            </View>
            <View style={s.row}>
              {step > 0 ? (
                <Pressable onPress={() => go(-1)} style={[s.btn, s.btnGhost]} accessibilityRole="button">
                  <Text style={[s.btnText, { color: '#fff' }]}>Atrás</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={last ? finish : () => go(1)} style={s.btn} accessibilityRole="button">
                <Text style={s.btnText}>{last ? '¡A vivir!' : 'Siguiente'}</Text>
              </Pressable>
            </View>
            {!last ? (
              <Pressable onPress={finish} hitSlop={10}>
                <Text style={s.skip}>Saltar guía</Text>
              </Pressable>
            ) : null}
          </View>
        </FadeIn>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  ring: { position: 'absolute', borderWidth: 4, borderColor: colors.ageButton, borderRadius: 18 },
  bubbleWrap: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
  text: { color: '#FFE082', fontSize: 20, fontWeight: '800', textAlign: 'center', lineHeight: 28 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotOn: { width: 20, backgroundColor: '#FFE082' },
  row: { flexDirection: 'row', gap: 10 },
  btn: { backgroundColor: '#FFE082', paddingHorizontal: 26, paddingVertical: 12, borderRadius: 999 },
  btnGhost: { backgroundColor: 'rgba(255,255,255,0.14)' },
  btnText: { color: '#3B2F00', fontWeight: '900', fontSize: 16 },
  skip: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecorationLine: 'underline' },
});
