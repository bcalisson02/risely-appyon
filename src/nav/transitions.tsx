import React from 'react';
import { Animated } from 'react-native';
import type { StackCardStyleInterpolator, StackNavigationOptions } from 'expo-router/js-stack';
import { DUR, RN_EASE } from '../theme/motion';

/**
 * Screen transitions (README → Interactions & motion), for the JS stack so they also run on web.
 *  - push:   new screen slides in from the right; the old one moves to −30% under an 8% black shade.
 *  - modal:  full-screen modal slides up; the screen behind dims to 85% brightness.
 *  - sheet:  dim fades to rgba(0,0,0,0.28) while the sheet rises from the bottom.
 *  - fade:   used for Reduce Motion and in-place swaps.
 * All with cubic-bezier(0.32,0.72,0,1).
 */
const spec = (duration: number, closeDuration = duration) => ({
  open: { animation: 'timing' as const, config: { duration, easing: RN_EASE } },
  close: { animation: 'timing' as const, config: { duration: closeDuration, easing: RN_EASE } },
});

const clamp = 'clamp' as const;

export const forPush: StackCardStyleInterpolator = ({ current, next, layouts }) => {
  const W = layouts.screen.width;
  const enter = current.progress.interpolate({ inputRange: [0, 1], outputRange: [W, 0], extrapolate: clamp });
  const under = next ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [0, -W * 0.3], extrapolate: clamp }) : 0;
  return {
    cardStyle: { transform: [{ translateX: Animated.add(enter, under) }] },
    overlayStyle: { opacity: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.08], extrapolate: clamp }) },
  };
};

export const forModal: StackCardStyleInterpolator = ({ current, next, layouts }) => {
  if (next) return {}; // the screen behind stays in place (the overlay dims it)
  const H = layouts.screen.height;
  return {
    cardStyle: { transform: [{ translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [H, 0], extrapolate: clamp }) }] },
    overlayStyle: { opacity: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.15], extrapolate: clamp }) },
  };
};

export const forSheet: StackCardStyleInterpolator = ({ current, layouts }) => {
  const H = layouts.screen.height;
  return {
    cardStyle: { transform: [{ translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [H, 0], extrapolate: clamp }) }] },
    overlayStyle: { opacity: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28], extrapolate: clamp }) },
  };
};

export const forFade: StackCardStyleInterpolator = ({ current, next }) => {
  if (next) return {};
  return { cardStyle: { opacity: current.progress } };
};

/**
 * On web a stack card defaults to min-height:100% and grows with its content, so nothing inside
 * would ever scroll on a short screen. flex:1 pins it to the screen height.
 */
const CARD = { flex: 1 } as const;
const CARD_TRANSPARENT = { flex: 1, backgroundColor: 'transparent' } as const;

const BlackOverlay = ({ style }: { style: any }) => (
  <Animated.View pointerEvents="none" style={[{ flex: 1, backgroundColor: '#000' }, style]} />
);

export function pushOptions(reduce: boolean): StackNavigationOptions {
  return {
    headerShown: false,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    cardOverlayEnabled: !reduce,
    cardOverlay: BlackOverlay,
    cardShadowEnabled: false,
    transitionSpec: spec(reduce ? DUR.fade : DUR.push),
    cardStyleInterpolator: reduce ? forFade : forPush,
    cardStyle: CARD_TRANSPARENT,
  } as StackNavigationOptions;
}

export function modalOptions(reduce: boolean): StackNavigationOptions {
  return {
    headerShown: false,
    gestureEnabled: false,
    presentation: 'card',
    cardOverlayEnabled: !reduce,
    cardOverlay: BlackOverlay,
    cardShadowEnabled: false,
    transitionSpec: spec(reduce ? DUR.fade : DUR.modal, reduce ? DUR.fade : DUR.dismiss),
    cardStyleInterpolator: reduce ? forFade : forModal,
    cardStyle: CARD,
  } as StackNavigationOptions;
}

export function sheetOptions(reduce: boolean): StackNavigationOptions {
  return {
    headerShown: false,
    gestureEnabled: false,
    presentation: 'transparentModal',
    cardOverlayEnabled: true,
    cardOverlay: BlackOverlay,
    cardShadowEnabled: false,
    cardStyle: CARD_TRANSPARENT,
    transitionSpec: spec(reduce ? DUR.fade : DUR.sheet, reduce ? DUR.fade : DUR.unsheet),
    cardStyleInterpolator: reduce ? forFade : forSheet,
  } as StackNavigationOptions;
}

export function fadeOptions(): StackNavigationOptions {
  return {
    headerShown: false,
    gestureEnabled: false,
    cardOverlayEnabled: false,
    transitionSpec: spec(DUR.fade),
    cardStyleInterpolator: forFade,
    cardStyle: CARD,
  } as StackNavigationOptions;
}
