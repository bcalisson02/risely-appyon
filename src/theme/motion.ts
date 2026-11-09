import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing as RNEasing, Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';

// Curves and durations from README → "Interactions & motion".
export const BEZ = {
  ease: [0.32, 0.72, 0, 1] as const, // push / sheet / modal
  spring: [0.34, 1.4, 0.64, 1] as const, // tab indicator, chat, pops
  fill: [0.22, 1, 0.36, 1] as const, // rings, bars, ruler settle
};

export const EASE = Easing.bezier(...BEZ.ease);
export const SPRING = Easing.bezier(...BEZ.spring);
export const FILL = Easing.bezier(...BEZ.fill);
export const OUT_CUBIC = Easing.out(Easing.cubic);

// RN Animated versions (used by the JS stack navigator)
export const RN_EASE = RNEasing.bezier(...BEZ.ease);

export const DUR = {
  push: 540,
  modal: 560,
  sheet: 560,
  dismiss: 480,
  unsheet: 420,
  fade: 340,
  tab: 280,
  tabIndicator: 460,
  pressIn: 120,
  pressOut: 380,
  pop: 380,
  count: 800,
  ring: 1000,
  bar: 900,
  stagger: 460,
} as const;

let reduceMotionCache = false;
AccessibilityInfo.isReduceMotionEnabled?.()
  .then((v) => (reduceMotionCache = !!v))
  .catch(() => {});

/** Reduce Motion — replace slides with fades, skip decorative loops. */
export function useReduceMotion() {
  const [rm, setRm] = useState(reduceMotionCache);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => alive && setRm(!!v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => {
      reduceMotionCache = !!v;
      setRm(!!v);
    });
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return rm;
}
export const isReduceMotion = () => reduceMotionCache;

/** Pointer cursor hint — web only (native has no 'grab'). */
export const webCursor = (c: 'pointer' | 'grab'): object => (Platform.OS === 'web' ? { cursor: c } : {});
