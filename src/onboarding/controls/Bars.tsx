import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { C } from '../../theme/tokens';
import { EASE, SPRING, isReduceMotion , webCursor } from '../../theme/motion';
import { Icon, IconName } from '../../components/Icon';
import { T } from '../../theme/type';
import { tick } from '../../components/anim';

/**
 * Daily activity (O05): 4 vertical bars (72, 108, 144, 180), tap or drag across.
 * Bars below the selection are light violet, the selected one violet, the rest gray.
 */
const H = [72, 108, 144, 180];
const ICONS: IconName[] = ['desktop-tower', 'person-simple-walk', 'bicycle', 'person-simple-run'];

export function ActivityBars({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  const width = useSharedValue(0);
  const cur = useSharedValue(value);
  useEffect(() => {
    cur.set(value);
  }, [value]);
  const emit = useCallback(
    (i: number) => {
      tick();
      onChange(i);
    },
    [onChange]
  );
  const at = (x: number) => {
    'worklet';
    if (width.value <= 0) return;
    const i = Math.max(0, Math.min(3, Math.floor((x / width.value) * 4)));
    if (i !== cur.value) {
      cur.set(i);
      scheduleOnRN(emit, i);
    }
  };
  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (e) => at(e.x),
    onUpdate: (e) => at(e.x),
  });
  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={(e) => width.set(e.nativeEvent.layout.width)}
        style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end', height: 180, ...webCursor('pointer') } as any}
        accessibilityRole="adjustable"
      >
        {H.map((h, i) => (
          <Bar key={i} i={i} h={h} sel={value} />
        ))}
      </View>
    </GestureDetector>
  );
}

function Bar({ i, h, sel }: { i: number; h: number; sel: number }) {
  const rm = isReduceMotion();
  const enter = useSharedValue(rm ? 1 : 0);
  const pop = useSharedValue(1);
  useEffect(() => {
    if (!rm) enter.set(withDelay(260 + i * 70, withTiming(1, { duration: 560, easing: SPRING })));
  }, []);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (sel === i) pop.set(withSequence(withTiming(0.85, { duration: 0 }), withTiming(1.06, { duration: 216, easing: EASE }), withTiming(1, { duration: 144, easing: EASE })));
  }, [sel]);
  const st = useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.value),
    transform: [{ translateY: (h * (1 - (0.2 + 0.8 * enter.value) * pop.value)) / 2 }, { scaleY: (0.2 + 0.8 * enter.value) * pop.value }, { scaleX: pop.value }],
  }));
  const below = i < sel;
  const on = i === sel;
  return (
    <Animated.View
      style={[
        {
          flex: 1,
          height: h,
          borderRadius: 20,
          backgroundColor: below ? C.violetSoft : on ? C.violet : C.bg,
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 16,
        },
        st,
      ]}
    >
      <Icon name={ICONS[i]} size={26} weight="fill" color={below ? C.violet : on ? '#FFFFFF' : C.tertiary} />
    </Animated.View>
  );
}

/** Day pills (O06): 7 × 64pt, radius 20, toggled on/off; at least 1 stays on (refused toggle shakes). */
const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
export function DayPicker({ days, onToggle }: { days: number[]; onToggle: (i: number) => boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {LETTERS.map((l, i) => (
        <DayPill key={i} i={i} label={l} on={days.includes(i)} onToggle={onToggle} />
      ))}
    </View>
  );
}

function DayPill({ i, label, on, onToggle }: { i: number; label: string; on: boolean; onToggle: (i: number) => boolean }) {
  const rm = isReduceMotion();
  const enter = useSharedValue(rm ? 1 : 0);
  const s = useSharedValue(1);
  const x = useSharedValue(0);
  useEffect(() => {
    if (!rm) enter.set(withDelay(260 + i * 40, withTiming(1, { duration: 460, easing: SPRING })));
  }, []);
  const st = useAnimatedStyle(() => ({
    opacity: Math.min(1, enter.value),
    transform: [{ translateY: (1 - enter.value) * 12 }, { translateX: x.value }, { scale: s.value }],
  }));
  return (
    <Animated.View style={[{ flex: 1 }, st]}>
      <View
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => {
          const ok = onToggle(i);
          if (!ok) {
            x.set(withSequence(withTiming(-4, { duration: 65 }), withTiming(4, { duration: 130 }), withTiming(0, { duration: 65 })));
            return;
          }
          tick();
          s.set(withSequence(withTiming(0.85, { duration: 0 }), withTiming(1.06, { duration: 216, easing: EASE }), withTiming(1, { duration: 144, easing: EASE })));
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: on }}
        style={{ height: 64, borderRadius: 20, backgroundColor: on ? C.violet : C.bg, alignItems: 'center', justifyContent: 'center', ...webCursor('pointer') } as any}
      >
        <T size={17} w="600" color={on ? '#FFFFFF' : C.ink}>
          {label}
        </T>
      </View>
    </Animated.View>
  );
}

/** Small bump on a number when it changes (scale 1 → 1.04 → 1, 180 ms). */
export function useNumberBump(dep: unknown) {
  const s = useSharedValue(1);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    s.set(withSequence(withTiming(1.04, { duration: 90 }), withTiming(1, { duration: 90 })));
  }, [dep]);
  return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}
