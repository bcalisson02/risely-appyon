import React, { useCallback, useEffect } from 'react';
import { webCursor } from '../../theme/motion';
import { Platform, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Svg, { Circle } from 'react-native-svg';
import { C } from '../../theme/tokens';
import { T } from '../../theme/type';
import { tick } from '../../components/anim';
import { useNumberBump } from './Bars';

/**
 * Circular dial (O07): 280pt, draggable 36pt knob, 5 → 60 min in steps of 5.
 * Wrap-around rules ported from proto-widgets.js → dial.
 */
const SIZE = 280;
const R = 118;
const SW = 26;
const CIRC = 2 * Math.PI * R;

export function Dial({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const cur = useSharedValue(value);
  const pressed = useSharedValue(0);
  useEffect(() => {
    cur.set(value);
  }, [value]);
  const emit = useCallback(
    (n: number) => {
      tick();
      onChange(n);
    },
    [onChange]
  );
  const at = (x: number, y: number) => {
    'worklet';
    let f = (Math.atan2(y - SIZE / 2, x - SIZE / 2) + Math.PI / 2) / (2 * Math.PI);
    if (f < 0) f += 1;
    let n = Math.round((f * 60) / 5) * 5;
    const o = cur.value;
    if (n === 0) n = o > 30 ? 60 : 5;
    if (o >= 50 && n <= 15) n = 60;
    if (o <= 10 && n >= 45) n = 5;
    n = Math.max(5, Math.min(60, n));
    if (n !== o) {
      cur.set(n);
      scheduleOnRN(emit, n);
    }
  };
  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (e) => {
      pressed.set(withTiming(1, { duration: 200 }));
      at(e.x, e.y);
    },
    onUpdate: (e) => at(e.x, e.y),
    onFinalize: () => {
      pressed.set(withTiming(0, { duration: 200 }));
    },
  });
  const f = value / 60;
  const a = f * 2 * Math.PI - Math.PI / 2;
  const knob = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pressed.value * 0.12 }] }));
  const bump = useNumberBump(value);
  const shadow: ViewStyle = Platform.select<ViewStyle>({
    web: { boxShadow: '0 0.5px 4px rgba(0,0,0,0.12), 0 6px 13px rgba(0,0,0,0.14)' } as any,
    default: { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  })!;
  return (
    <GestureDetector gesture={pan}>
      <View
        style={{ width: SIZE, height: SIZE, alignSelf: 'center', ...webCursor('grab') } as any}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Session length"
        accessibilityValue={{ text: `${value} minutes` }}
      >
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={C.bg} strokeWidth={SW} />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={C.violet}
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={`${(CIRC * f).toFixed(1)} ${CIRC.toFixed(1)}`}
          />
        </Svg>
        <Animated.View
          pointerEvents="none"
          style={[
            { position: 'absolute', left: SIZE / 2 + R * Math.cos(a) - 18, top: SIZE / 2 + R * Math.sin(a) - 18, width: 36, height: 36, borderRadius: 999, backgroundColor: '#FFFFFF' },
            shadow,
            knob,
          ]}
        />
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={bump}>
            <T size={72} lh={72} w="600" rounded ls={-0.03}>
              {value}
            </T>
          </Animated.View>
          <T size={17} color={C.secondary}>
            minutes
          </T>
        </View>
      </View>
    </GestureDetector>
  );
}
