import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { EASE, isReduceMotion } from '../theme/motion';

/**
 * Entrance used by the onboarding content: opacity 0 → 1, translateY 10 → 0, 460 ms,
 * staggered 60 ms apart (README → Push).
 */
export function Rise({
  index = 0,
  base = 200,
  gap = 60,
  dy = 10,
  duration = 460,
  style,
  children,
  easing = EASE,
}: {
  index?: number;
  base?: number;
  gap?: number;
  dy?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  easing?: any;
}) {
  const rm = isReduceMotion();
  const k = useSharedValue(rm ? 1 : 0);
  useEffect(() => {
    if (!rm) k.set(withDelay(base + index * gap, withTiming(1, { duration, easing })));
  }, [base, duration, easing, gap, index, k, rm]);
  const st = useAnimatedStyle(() => ({ opacity: k.value, transform: [{ translateY: (1 - k.value) * dy }] }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}
