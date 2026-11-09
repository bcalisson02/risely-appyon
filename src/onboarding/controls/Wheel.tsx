import React, { useCallback, useEffect, useMemo } from 'react';
import { webCursor } from '../../theme/motion';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, useAnimatedReaction, cancelAnimation, Easing, SharedValue, useDerivedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { C } from '../../theme/tokens';
import { T } from '../../theme/type';
import { tick } from '../../components/anim';

/**
 * Wheel picker (O11): rows 36pt, 216pt tall, 3D rotateX per row, snap with inertia,
 * tap a row to jump to it (port of proto-widgets.js → wheel).
 */
const H = 36;
const VIEW_H = 216;
const OUT = Easing.out(Easing.cubic);

export function Wheel({
  values,
  value,
  onChange,
  format = (v: number) => String(v),
  label,
}: {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  label: string;
}) {
  const N = values.length;
  const idx = Math.max(0, values.indexOf(value));
  const pos = useSharedValue(idx);
  const p0 = useSharedValue(idx);
  const last = useSharedValue(idx);
  const lastMove = useSharedValue(0);
  const [centerState, setCenter] = React.useState(idx);
  // follows the gesture; falls back to the prop when the value is set from outside
  const center = values[centerState] === value ? centerState : idx;

  const emit = useCallback(
    (i: number) => {
      tick();
      setCenter(i);
      onChange(values[i]);
    },
    [onChange, values]
  );
  useEffect(() => {
    if (values[last.value] !== value) {
      last.set(idx);
      pos.set(withTiming(idx, { duration: 320, easing: OUT }));
    }
  }, [value]);

  useAnimatedReaction(
    () => Math.max(0, Math.min(N - 1, Math.round(pos.value))),
    (c) => {
      if (c !== last.value) {
        last.set(c);
        scheduleOnRN(emit, c);
      }
    }
  );

  const clamp = (p: number) => {
    'worklet';
    return Math.max(0, Math.min(N - 1, p));
  };
  const animTo = (t: number, ms: number) => {
    'worklet';
    pos.set(withTiming(t, { duration: ms, easing: OUT }));
  };
  const pan = usePanGesture({
    minDistance: 0,
    onBegin: () => {
      cancelAnimation(pos);
      p0.set(pos.value);
    },
    onUpdate: (e) => {
      lastMove.set(Date.now());
      let p = p0.value - e.translationY / H;
      if (p < 0) p *= 0.3;
      if (p > N - 1) p = N - 1 + (p - N + 1) * 0.3;
      pos.set(p);
    },
    onDeactivate: (e) => {
      const moved = Math.abs(e.translationY) > 5;
      if (!moved) {
        const off = (e.y - 108) / H;
        animTo(clamp(Math.round(pos.value + off)), 320);
        return;
      }
      const vel = Date.now() - lastMove.value > 60 ? 0 : Math.max(-60, Math.min(60, -e.velocityY / H)); // items per second (capped)
      const tgt = clamp(Math.round(pos.value + vel * 0.22));
      animTo(tgt, Math.min(1100, 320 + Math.abs(tgt - pos.value) * 45));
    },
  });

  const track = useAnimatedStyle(() => ({ transform: [{ translateY: -pos.value * H }] }));

  // render a window of rows around the center (rows farther than 4.5 are hidden anyway)
  const rows = useMemo(() => {
    const lo = Math.max(0, center - 9);
    const hi = Math.min(N - 1, center + 9);
    const out: number[] = [];
    for (let i = lo; i <= hi; i++) out.push(i);
    return out;
  }, [center, N]);

  return (
    <GestureDetector gesture={pan}>
      <View
        style={{ flex: 1, height: VIEW_H, overflow: 'hidden', ...webCursor('grab') } as any}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: format(value) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => animTo(clamp(Math.round(pos.value) + (e.nativeEvent.actionName === 'increment' ? 1 : -1)), 320)}
      >
        <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 90 }, track]}>
          {rows.map((i) => (
            <Row key={i} i={i} pos={pos} text={format(values[i])} on={i === center} />
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

function Row({ i, pos, text, on }: { i: number; pos: SharedValue<number>; text: string; on: boolean }) {
  const st = useAnimatedStyle(() => {
    const d = i - pos.value;
    const a = Math.abs(d);
    if (a > 4.5) return { opacity: 0 };
    return {
      opacity: Math.max(0.12, 1 - a * 0.24),
      transform: [{ perspective: 500 }, { rotateX: `${(-d * 21).toFixed(1)}deg` }, { scale: 1 - a * 0.035 }],
    };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: i * H, height: H, alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden' }, st]}>
      <T size={21} w={on ? '600' : '400'} color={on ? C.ink : C.tertiary}>
        {text}
      </T>
    </Animated.View>
  );
}

export const _u = useDerivedValue;
