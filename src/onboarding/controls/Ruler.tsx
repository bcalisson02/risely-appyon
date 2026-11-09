import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, useAnimatedReaction, cancelAnimation } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../../theme/tokens';
import { T } from '../../theme/type';
import { FILL , webCursor } from '../../theme/motion';
import { tick } from '../../components/anim';

/**
 * Horizontal ruler (O02/O03): 8pt per 0.1 kg, minor tick every 0.1, mid every 0.5,
 * major with label every 1 kg. Fixed violet indicator 3×58 in the center, faded edges.
 * Drag + flick with momentum, snapping to 0.1 (port of proto-widgets.js → ruler).
 */
const MIN = 40;
const MAX = 150;
const STEP = 0.1;
const PX = 8;
const WINDOW = 60; // ticks rendered each side of the current value (virtualized)

const snap = (v: number) => {
  'worklet';
  const c = Math.max(MIN, Math.min(MAX, v));
  return +(MIN + Math.round((c - MIN) / STEP) * STEP).toFixed(2);
};

export function Ruler({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [w, setW] = useState(0);
  const pos = useSharedValue(value); // continuous value under the indicator
  const start = useSharedValue(value);
  const last = useSharedValue(value);
  const lastMove = useSharedValue(0);
  const [center, setCenter] = useState(value); // window center for rendering ticks

  const emit = useCallback(
    (v: number) => {
      tick();
      onChange(v);
    },
    [onChange]
  );
  const recenter = useCallback((v: number) => setCenter(v), []);
  // a value set from outside (e.g. O03 starting from current) re-centers the window directly
  const renderCenter = Math.abs(value - center) > 5 ? value : center;

  // keep in sync if the value changes from outside (e.g. O03 starting from current)
  useEffect(() => {
    if (Math.abs(snap(pos.value) - value) > 0.001) {
      pos.set(value);
      last.set(value);
    }
  }, [value]);

  useAnimatedReaction(
    () => snap(pos.value),
    (n, prev) => {
      if (prev !== null && n !== last.value) {
        last.set(n);
        scheduleOnRN(emit, n);
      }
      // re-center the rendered window every whole kg
      if (prev !== null && Math.floor(n) !== Math.floor(prev)) scheduleOnRN(recenter, n);
    }
  );

  const pan = usePanGesture({
    minDistance: 2,
    onBegin: () => {
      cancelAnimation(pos);
      start.set(snap(pos.value));
    },
    onUpdate: (e) => {
      lastMove.set(Date.now());
      pos.set(Math.max(MIN, Math.min(MAX, start.value - (e.translationX / PX) * STEP)));
    },
    onDeactivate: (e) => {
      // a pause before release means no flick
      const vx = Date.now() - lastMove.value > 60 ? 0 : Math.max(-3, Math.min(3, e.velocityX / 1000)); // px per ms, like the prototype (capped)
      const fling = ((-vx * 260) / PX) * STEP;
      const from = snap(pos.value);
      const end = snap(from + fling);
      const dist = Math.abs(end - pos.value);
      const ms = Math.min(900, 260 + (dist / STEP) * 6);
      pos.set(withTiming(end, { duration: ms, easing: FILL }));
    },
  });

  const track = useAnimatedStyle(() => ({
    transform: [{ translateX: -((pos.value - MIN) / STEP) * PX - 1 }],
  }));

  const ticks = useMemo(() => {
    const ci = Math.round((renderCenter - MIN) / STEP);
    const lo = Math.max(0, ci - WINDOW);
    const hi = Math.min(Math.round((MAX - MIN) / STEP), ci + WINDOW);
    const out: React.ReactNode[] = [];
    for (let i = lo; i <= hi; i++) {
      const major = i % 10 === 0;
      const mid = !major && i % 5 === 0;
      out.push(
        <View
          key={i}
          style={{
            position: 'absolute',
            left: i * PX,
            top: 0,
            width: major ? 2 : mid ? 1.5 : 1,
            height: major ? 40 : mid ? 26 : 14,
            backgroundColor: major ? '#8E8E93' : mid ? '#C7C7CC' : '#D8D8DC',
          }}
        />
      );
      if (major) {
        const kg = MIN + i / 10;
        const five = kg % 5 === 0;
        out.push(
          <T
            key={'l' + i}
            size={13}
            w={five ? '600' : '400'}
            color={five ? C.secondary : C.tertiary}
            rounded={false}
            center
            style={{ position: 'absolute', top: 54, left: i * PX - 19, width: 40, fontVariant: ['tabular-nums'] }}
          >
            {kg}
          </T>
        );
      }
    }
    return out;
  }, [renderCenter]);

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
        style={{ marginHorizontal: -16, height: 96, overflow: 'hidden', ...webCursor('grab') } as any}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Weight"
        accessibilityValue={{ text: `${value} kg` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          const n = snap(value + (e.nativeEvent.actionName === 'increment' ? 1 : -1));
          pos.set(withTiming(n, { duration: 300, easing: FILL }));
        }}
      >
        <Animated.View style={[{ position: 'absolute', top: 8, left: w / 2, height: 80, width: ((MAX - MIN) / STEP) * PX + 2 }, track]}>
          {ticks}
        </Animated.View>
        <View pointerEvents="none" style={{ position: 'absolute', left: w / 2 - 1.5, top: 0, width: 3, height: 58, borderRadius: 2, backgroundColor: C.violet }} />
        <LinearGradient pointerEvents="none" colors={['#FFFFFF', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20%' }} />
        <LinearGradient pointerEvents="none" colors={['rgba(255,255,255,0)', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20%' }} />
      </View>
    </GestureDetector>
  );
}
