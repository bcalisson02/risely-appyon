import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleProp, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { C } from '../theme/tokens';
import { EASE, SPRING } from '../theme/motion';
import { T } from '../theme/type';
import { Icon, IconName } from './Icon';
import { Press } from './Press';
import { tick } from './anim';

/** Pop: scale 0.5 → 1.15 → 1 over 380 ms (README → Selection). */
export function usePop(on: boolean, { from = 0 }: { from?: number } = {}) {
  const s = useSharedValue(on ? 1 : from);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (on) s.set(withSequence(withTiming(1.15, { duration: 230, easing: EASE }), withTiming(1, { duration: 150, easing: EASE })));
    else s.set(withTiming(from, { duration: 220, easing: EASE }));
  }, [on]);
  return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}

/** Small bounce used when a selection changes (scale 0.96 → 1 spring). */
export function useBump(dep: unknown, amount = 0.96) {
  const s = useSharedValue(1);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    s.set(amount);
    s.set(withTiming(1, { duration: 380, easing: SPRING }));
  }, [dep]);
  return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}

export function CheckBadge({ on, size = 24, style }: { on: boolean; size?: number; style?: StyleProp<ViewStyle> }) {
  const pop = usePop(on);
  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: 999, backgroundColor: C.violet, alignItems: 'center', justifyContent: 'center' },
        style,
        pop,
      ]}
    >
      <Icon name="check" size={13} color="#FFFFFF" weight="bold" />
    </Animated.View>
  );
}

/**
 * Selection tile: #F2F2F7, radius 24. Selected: violetTint + inset 2pt violet ring and a
 * 24pt check badge (top-right) that springs from 0 to 1.
 */
export function SelectTile({
  on,
  onPress,
  icon,
  iconSize = 30,
  label,
  height = 150,
  pad = 16,
  padV,
}: {
  on: boolean;
  onPress: () => void;
  icon: IconName;
  iconSize?: number;
  label: string;
  height?: number;
  pad?: number;
  padV?: number;
}) {
  const bump = useBump(on);
  return (
    <Press big onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={{ flex: 1 }}>
      <Animated.View
        style={[
          {
            height,
            borderRadius: 24,
            backgroundColor: on ? C.violetTint : C.bg,
            paddingHorizontal: pad,
            paddingVertical: padV ?? pad,
            justifyContent: 'space-between',
            borderWidth: 2,
            borderColor: on ? C.violet : 'transparent',
            margin: 0,
          },
          bump,
        ]}
      >
        <View style={{ marginLeft: -2, marginTop: -2 }}>
          <Icon name={icon} size={iconSize} color={on ? C.violet : C.ink} weight="regular" />
        </View>
        <T size={17} w="600" style={{ marginLeft: -2, marginBottom: -2 }}>
          {label}
        </T>
        <CheckBadge on={on} style={{ position: 'absolute', top: 12, right: 12 }} />
      </Animated.View>
    </Press>
  );
}

/** Chip / capsule. Selected: violetTint bg, violetDark 600 text, inset ring 1.5 violet. */
export function Chip({
  label,
  on,
  onPress,
  height = 34,
  padH = 14,
  size = 15,
  bg = C.white,
  check,
  style,
}: {
  label: string;
  on?: boolean;
  onPress?: () => void;
  height?: number;
  padH?: number;
  size?: number;
  bg?: string;
  check?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bump = usePopOnChange(on);
  return (
    <Press onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!on }}>
      <Animated.View
        style={[
          {
            height,
            paddingHorizontal: padH - 1.5,
            borderRadius: 999,
            backgroundColor: on ? C.violetTint : bg,
            borderWidth: 1.5,
            borderColor: on ? C.violet : 'transparent',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          },
          style,
          bump,
        ]}
      >
        {on && check ? <Icon name="check" size={15} color={C.violetDark} weight="bold" /> : null}
        <T size={size} w={on ? '600' : '500'} color={on ? C.violetDark : C.ink}>
          {label}
        </T>
      </Animated.View>
    </Press>
  );
}

function usePopOnChange(v: unknown) {
  const s = useSharedValue(1);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    s.set(withSequence(withTiming(0.92, { duration: 100 }), withTiming(1.06, { duration: 140, easing: EASE }), withTiming(1, { duration: 140, easing: EASE })));
  }, [v]);
  return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}

/** Switch 51×31, on = violet, off = fill, knob 27 white with shadow. */
export function Switch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const x = useSharedValue(value ? 20 : 0);
  useEffect(() => {
    x.set(withTiming(value ? 20 : 0, { duration: 300, easing: SPRING }));
  }, [value]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const track = useAnimatedStyle(() => ({ backgroundColor: x.value > 10 ? C.violet : C.fill }));
  return (
    <Press
      plain
      onPress={() => {
        tick();
        onChange(!value);
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
    >
      <Animated.View style={[{ width: 51, height: 31, borderRadius: 999, padding: 2 }, track]}>
        <Animated.View
          style={[
            {
              width: 27,
              height: 27,
              borderRadius: 999,
              backgroundColor: '#FFFFFF',
            },
            Platform.select<ViewStyle>({
              web: { boxShadow: '0 3px 8px rgba(0,0,0,0.15)' } as any,
              default: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
            }),
            knob,
          ]}
        />
      </Animated.View>
    </Press>
  );
}

/**
 * Segmented control: track #EEEEF0 radius 12, padding 3; sliding white indicator radius 9.
 */
export function Segmented({
  options,
  value,
  onChange,
  height = 38,
  style,
}: {
  options: string[];
  value: number;
  onChange: (i: number) => void;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [w, setW] = useState(0);
  const x = useSharedValue(value);
  useEffect(() => {
    x.set(withTiming(value, { duration: 320, easing: EASE }));
  }, [value]);
  const segW = w ? (w - 6) / options.length : 0;
  const ind = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * segW }] }));
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      style={[{ flexDirection: 'row', padding: 3, backgroundColor: C.segTrack, borderRadius: 12 }, style]}
    >
      {w > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 3,
              bottom: 3,
              left: 3,
              width: segW,
              borderRadius: 9,
              backgroundColor: '#FFFFFF',
            },
            Platform.select<ViewStyle>({
              web: { boxShadow: '0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)' } as any,
              default: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
            }),
            ind,
          ]}
        />
      )}
      {options.map((o, i) => (
        <Press
          plain
          key={o}
          onPress={() => {
            if (i !== value) {
              tick();
              onChange(i);
            }
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === value }}
          style={{ flex: 1, height, alignItems: 'center', justifyContent: 'center' }}
        >
          <T size={15} w={i === value ? '600' : '500'}>
            {o}
          </T>
        </Press>
      ))}
    </View>
  );
}

export const EASE_OUT = Easing.out(Easing.cubic);
