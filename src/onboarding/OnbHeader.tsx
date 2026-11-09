import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, SharedValue } from 'react-native-reanimated';
import { C } from '../theme/tokens';
import { EASE, isReduceMotion } from '../theme/motion';
import { RoundButton } from '../components/Button';
import { useScreen } from '../components/Frame';
import { STEP_PROGRESS, HIDE_BACK } from './progress';

/**
 * Shared header on every question screen: 44pt back button, 5-segment progress bar
 * (4pt high, 4pt gaps, track #E9E9EE, violet fill), 44pt spacer.
 * It lives outside the stack so it stays fixed during push; only its fill animates
 * (650 ms, 180 ms delay).
 */
export function OnbHeader({ step, onBack }: { step: number; onBack: () => void }) {
  const { top } = useScreen();
  const p = useSharedValue(STEP_PROGRESS[step] ?? 0);
  const vis = useSharedValue(step > 0 ? 1 : 0);
  const backVis = useSharedValue(step > 0 && !HIDE_BACK.has(step) ? 1 : 0);

  useEffect(() => {
    const rm = isReduceMotion();
    p.set(rm ? STEP_PROGRESS[step] : withDelay(180, withTiming(STEP_PROGRESS[step] ?? 0, { duration: 650, easing: EASE })));
    vis.set(withTiming(step > 0 ? 1 : 0, { duration: 340, easing: EASE }));
    backVis.set(withTiming(step > 0 && !HIDE_BACK.has(step) ? 1 : 0, { duration: 260 }));
  }, [step]);

  const wrap = useAnimatedStyle(() => ({ opacity: vis.value }));
  const back = useAnimatedStyle(() => ({ opacity: backVis.value }));

  return (
    <Animated.View
      pointerEvents={step > 0 ? 'box-none' : 'none'}
      style={[{ position: 'absolute', top: top + 6, left: 16, right: 16, height: 44, flexDirection: 'row', alignItems: 'center', gap: 14, zIndex: 50 }, wrap]}
    >
      <Animated.View style={back} pointerEvents={HIDE_BACK.has(step) ? 'none' : 'auto'}>
        <RoundButton icon="caret-left" onPress={onBack} label="Back" />
      </Animated.View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Seg key={i} i={i} p={p} />
        ))}
      </View>
      <View style={{ width: 44 }} />
    </Animated.View>
  );
}

function Seg({ i, p }: { i: number; p: SharedValue<number> }) {
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, p.value - i)) * 100}%` }));
  return (
    <View style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: C.progressTrack, overflow: 'hidden' }}>
      <Animated.View style={[{ height: '100%', backgroundColor: C.violet, borderRadius: 999 }, fill]} />
    </View>
  );
}
