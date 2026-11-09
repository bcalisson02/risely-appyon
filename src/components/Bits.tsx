import React, { useEffect } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { C } from '../theme/tokens';
import { EASE, SPRING, isReduceMotion } from '../theme/motion';
import { T, TProps } from '../theme/type';
import { easeFill, fmtInt, useTween } from './anim';
import { Glass } from './Glass';
import { Icon, IconName } from './Icon';
import { Press } from './Press';

/** Number that counts up from 0 (800 ms, ease-out cubic) and tweens on change. */
export function CountUp({ value, suffix = '', decimals = 0, ...t }: { value: number; suffix?: string; decimals?: number } & TProps) {
  const v = useTween(value, { duration: 800 });
  return (
    <T w="600" rounded {...t}>
      {(decimals ? v.toFixed(decimals) : fmtInt(v)) + suffix}
    </T>
  );
}

/** 4pt macro bar that fills on mount (900 ms). */
export function MacroBar({ value, color, track = '#EEEEF2', height = 4 }: { value: number; color: string; track?: string; height?: number }) {
  const v = useTween(Math.max(0, Math.min(1, value)), { duration: 900, delay: 220, easing: easeFill });
  return (
    <View style={{ height, borderRadius: 999, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${v * 100}%`, backgroundColor: color, borderRadius: 999 }} />
    </View>
  );
}

/** Glass circle button (floating chrome: bell, back over photos). */
export function GlassButton({
  icon,
  onPress,
  size = 44,
  iconSize = 20,
  weight = 'regular',
  dark,
  label,
  color,
  style,
}: {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  weight?: 'regular' | 'bold' | 'fill';
  dark?: boolean;
  label?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Press onPress={onPress} accessibilityRole="button" accessibilityLabel={label ?? icon} hitSlop={6} style={style}>
      <Glass dark={dark} shadow={dark ? 'none' : 'soft'} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={iconSize} color={color ?? (dark ? '#FFFFFF' : C.ink)} weight={weight} />
      </Glass>
    </Press>
  );
}

/** Element that pops in: scale 0.3 → 1.08 → 1 (620 ms). */
export function PopIn({ children, delay = 250, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const rm = isReduceMotion();
  const k = useSharedValue(rm ? 1 : 0);
  useEffect(() => {
    if (!rm) k.set(withDelay(delay, withSequence(withTiming(1.08, { duration: 434, easing: EASE }), withTiming(1, { duration: 186, easing: EASE }))));
  }, []);
  const st = useAnimatedStyle(() => ({ opacity: Math.min(1, k.value * 1.4), transform: [{ scale: 0.3 + 0.7 * k.value }] }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}

/** Glass toast that slides from the top and auto-hides after 3.4 s (N7). */
export function Toast({
  title,
  detail,
  action,
  onAction,
  onHidden,
  top,
  duration = 3400,
  icon = 'success',
}: {
  title: string;
  detail?: string;
  action?: string;
  onAction?: () => void;
  onHidden: () => void;
  top: number;
  duration?: number;
  icon?: 'success' | 'soon';
}) {
  const k = useSharedValue(0);
  useEffect(() => {
    k.set(withDelay(250, withTiming(1, { duration: 520, easing: SPRING })));
    const t = setTimeout(() => {
      k.set(withTiming(0, { duration: 380, easing: EASE }));
      setTimeout(onHidden, 400);
    }, duration);
    return () => clearTimeout(t);
  }, []);
  const st = useAnimatedStyle(() => ({ opacity: Math.min(1, k.value), transform: [{ translateY: (1 - k.value) * -90 }, { scale: 0.9 + 0.1 * k.value }] }));
  return (
    <Animated.View style={[{ position: 'absolute', top, left: 16, right: 16, zIndex: 40 }, st]} accessibilityLiveRegion="polite">
      <Glass shadow="bar" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingRight: 10, paddingLeft: 14 }}>
        <View style={{ width: 28, height: 28, borderRadius: 999, backgroundColor: icon === 'success' ? C.success : C.fill, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon === 'success' ? 'check' : 'clock'} size={14} color={icon === 'success' ? '#FFFFFF' : C.ink} weight="bold" />
        </View>
        <T size={15} style={{ flex: 1 }} numberOfLines={1}>
          <T size={15} w="600">
            {title}
          </T>
          {detail ? ' ' + detail : null}
        </T>
        {action ? (
          <Press
            onPress={() => {
              k.set(withTiming(0, { duration: 300, easing: EASE }));
              onAction?.();
            }}
            hitSlop={8}
            accessibilityRole="button"
          >
            <T size={15} w="600" color={C.violet} style={{ paddingRight: 6 }}>
              {action}
            </T>
          </Press>
        ) : null}
      </Glass>
    </Animated.View>
  );
}

/** Round + button that toggles to a filled violet check (N2 recent, N6 results). */
export function AddToggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Press
      plain
      hitSlop={8}
      onPress={() => {
        s.set(withSequence(withTiming(0.5, { duration: 0 }), withTiming(1.15, { duration: 228, easing: EASE }), withTiming(1, { duration: 152, easing: EASE })));
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={on ? 'Remove' : 'Add'}
      accessibilityState={{ selected: on }}
    >
      <Animated.View style={[{ width: 32, height: 32, borderRadius: 999, backgroundColor: on ? C.violet : C.violetTint, alignItems: 'center', justifyContent: 'center' }, st]}>
        <Icon name={on ? 'check' : 'plus'} size={16} color={on ? '#FFFFFF' : C.violetDark} weight="bold" />
      </Animated.View>
    </Press>
  );
}

export function SectionTitle({ children, style, size = 22 }: { children: React.ReactNode; style?: StyleProp<TextStyle>; size?: number }) {
  return (
    <T size={size} w="700" ls={-0.015} style={[{ paddingTop: 22, paddingHorizontal: 4, paddingBottom: 10 }, style]} accessibilityRole="header">
      {children}
    </T>
  );
}
