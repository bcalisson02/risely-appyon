import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C } from '../theme/tokens';
import { easeFill, useTween } from './anim';

/**
 * Progress ring. Fills on mount over 1000 ms with cubic-bezier(0.22,1,0.36,1) (README → Numbers).
 */
export function Ring({
  size,
  stroke,
  value,
  track = C.violetTint,
  color = C.violet,
  animate = true,
  duration = 1000,
  delay = 160,
  children,
  style,
  easing,
  fillOnMount = true,
}: {
  size: number;
  stroke: number;
  value: number; // 0..1
  track?: string;
  color?: string;
  animate?: boolean;
  duration?: number;
  delay?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  easing?: 'linear' | ((x: number) => number);
  /** rings fill from 0 on mount; countdown rings start full */
  fillOnMount?: boolean;
}) {
  const target = Math.max(0, Math.min(1, value));
  const v = useTween(target, {
    duration: animate ? duration : 0,
    delay: animate ? delay : 0,
    easing: easing === 'linear' ? (x: number) => x : easing ?? easeFill,
    from: fillOnMount ? 0 : target,
  });
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const shown = animate ? v : value;
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        {shown > 0.0005 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(c * shown).toFixed(2)} ${c.toFixed(2)}`}
          />
        )}
      </Svg>
      {children ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}
