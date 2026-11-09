import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SPRING } from '../theme/motion';
import { C } from '../theme/tokens';

const AP = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** large cards scale to 0.98, buttons and chips to 0.95 */
  big?: boolean;
  /** no scale, only the list-row highlight */
  row?: boolean;
  /** disable feedback entirely */
  plain?: boolean;
  children?: React.ReactNode;
};

/**
 * Press feedback (README → Interactions): scale to 0.95 (0.98 large) in 120 ms,
 * spring back in 380 ms. List rows highlight with #E5E5EA.
 */
export function Press({ big, row, plain, style, children, onPressIn, onPressOut, ...rest }: Props) {
  const s = useSharedValue(1);
  const o = useSharedValue(1);
  const hl = useSharedValue(0);
  const anim = useAnimatedStyle(() => {
    if (row) return { backgroundColor: hl.value ? `rgba(229,229,234,${hl.value})` : 'transparent' };
    return { transform: [{ scale: s.value }], opacity: o.value };
  });
  return (
    <AP
      {...rest}
      onPressIn={(e) => {
        if (!plain) {
          if (row) hl.set(withTiming(1, { duration: 90 }));
          else {
            s.set(withTiming(big ? 0.98 : 0.95, { duration: 120, easing: Easing.out(Easing.quad) }));
            if (!big) o.set(withTiming(0.85, { duration: 120 }));
          }
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!plain) {
          if (row) hl.set(withTiming(0, { duration: 260 }));
          else {
            s.set(withTiming(1, { duration: 380, easing: SPRING }));
            o.set(withTiming(1, { duration: 200 }));
          }
        }
        onPressOut?.(e);
      }}
      style={[style, plain ? null : anim]}
    >
      {children}
    </AP>
  );
}

export const ROW_HL = C.rowHighlight;
