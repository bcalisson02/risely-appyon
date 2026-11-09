import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, Line, LinearGradient as SvgGrad, Path, Stop, Text as SvgText } from 'react-native-svg';
import { C } from '../../theme/tokens';
import { T, fontFor } from '../../theme/type';
import { FILL , webCursor } from '../../theme/motion';
import { tick } from '../../components/anim';
import type { Derived } from '../../logic/derive';
import { useGestureScale } from '../../components/Frame';

/**
 * Pace chart (O04): SVG 329×160. Plot x 10→290, y 30 (higher weight) → 120 (lower weight),
 * axis at y=132. 26 weeks from today; month gridlines; dashed weight gridlines; ease-out cubic curve
 * with a violet area; dashed maintenance tail; goal point with halo and drop line; black date capsule.
 */
const PX = 280 / 26;
// month starts after Wed Nov 4 2026: Dec 1, Jan 1, Feb 1, Mar 1, Apr 1, May 1
const MONTHS: [string, number][] = [
  ['Dec', 27],
  ['Jan', 58],
  ['Feb', 89],
  ['Mar', 117],
  ['Apr', 148],
  ['May', 178],
].map(([m, d]) => [m as string, 10 + ((d as number) / 7) * PX]);

const svgFont = Platform.OS === 'web' ? '-apple-system, BlinkMacSystemFont, Inter, sans-serif' : undefined;

export function PaceChart({ d }: { d: Derived }) {
  const [w, setW] = useState(329);
  const k = w / 329;
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => {
        const iw = e.nativeEvent.layout.width - 32;
        if (iw > 0) setW(iw);
      }}
      style={{ backgroundColor: '#F6F6F9', borderRadius: 24, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 10 }}
    >
      <Svg width={w} height={160 * k} viewBox="0 0 329 160" style={{ overflow: 'visible' }}>
        <Defs>
          <SvgGrad id="paceFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.violet} stopOpacity={0.22} />
            <Stop offset="1" stopColor={C.violet} stopOpacity={0} />
          </SvgGrad>
        </Defs>
        {MONTHS.map(([m, x]) => (
          <React.Fragment key={m}>
            <Line x1={x} y1={14} x2={x} y2={132} stroke="#F2F2F7" strokeWidth={1} />
            <SvgText x={x} y={152} fontSize={12} fill={C.gray2} textAnchor="middle" fontFamily={svgFont}>
              {m}
            </SvgText>
          </React.Fragment>
        ))}
        <Line x1={10} y1={30} x2={290} y2={30} stroke="#E5E5EA" strokeWidth={1} strokeDasharray="2 4" />
        <Line x1={10} y1={120} x2={290} y2={120} stroke="#E5E5EA" strokeWidth={1} strokeDasharray="2 4" />
        <Line x1={10} y1={132} x2={290} y2={132} stroke="#E5E5EA" strokeWidth={1} />
        <SvgText x={300} y={34} fontSize={13} fill={C.secondary} fontFamily={svgFont}>
          {d.yHi}
        </SvgText>
        <SvgText x={300} y={124} fontSize={13} fill={C.secondary} fontFamily={svgFont}>
          {d.yLo}
        </SvgText>
        <Path d={d.area} fill="url(#paceFill)" />
        <Path d={d.tail} fill="none" stroke={C.violet} strokeOpacity={0.35} strokeWidth={2.5} strokeDasharray="4 5" strokeLinecap="round" />
        <Line x1={d.endX} y1={d.endY} x2={d.endX} y2={132} stroke={C.violet} strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="2 3" />
        <Path d={d.curve} fill="none" stroke={C.violet} strokeWidth={3.5} strokeLinecap="round" />
        <Circle cx={10} cy={d.startY} r={5} fill={C.violet} stroke="#FFFFFF" strokeWidth={2} />
        <Circle cx={d.endX} cy={d.endY} r={13} fill={C.violet} fillOpacity={0.14} />
        <Circle cx={d.endX} cy={d.endY} r={6.5} fill="#FFFFFF" stroke={C.violet} strokeWidth={3} />
      </Svg>
      {/* date capsule, centered above the point (below it when gaining) */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 16 + (d.labelX - 16) * k - 70,
          top: 16 + (d.labelY - 16) * k - (d.labelBelow ? 0 : 26),
          width: 140,
          alignItems: 'center',
        }}
      >
        <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: C.ink, justifyContent: 'center' }}>
          <T size={13} w="600" color="#FFFFFF" style={{ letterSpacing: 0 }} numberOfLines={1}>
            {d.endLabel}
          </T>
        </View>
      </View>
    </View>
  );
}

/** Slider 0.25 → 1.0 kg/week in 0.05 steps. The thumb follows the finger; the value snaps. */
const SMIN = 0.25;
const SMAX = 1;
const SSTEP = 0.05;
const ssnap = (v: number) => {
  'worklet';
  const c = Math.max(SMIN, Math.min(SMAX, v));
  return +(SMIN + Math.round((c - SMIN) / SSTEP) * SSTEP).toFixed(2);
};

export function PaceSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [w, setW] = useState(0);
  const width = useSharedValue(0);
  const raw = useSharedValue(value);
  const pressed = useSharedValue(0);
  const last = useSharedValue(value);
  const emit = useCallback(
    (v: number) => {
      tick();
      onChange(v);
    },
    [onChange]
  );
  // follow outside changes (accessibility actions) when the thumb isn't being dragged
  useEffect(() => {
    if (pressed.get() === 0) raw.set(withTiming(value, { duration: 300, easing: FILL }));
  }, [value, pressed, raw]);

  useAnimatedReaction(
    () => ssnap(raw.value),
    (n) => {
      if (n !== last.value) {
        last.set(n);
        scheduleOnRN(emit, n);
      }
    }
  );

  const at = (x: number) => {
    'worklet';
    if (width.value <= 0) return SMIN;
    return Math.max(SMIN, Math.min(SMAX, SMIN + (x / width.value) * (SMAX - SMIN)));
  };
  // pointer values arrive in screen px; divide by the frame scale to get layout points
  const gs = useGestureScale();
  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (e) => {
      pressed.set(withTiming(1, { duration: 200 }));
      raw.set(withTiming(at(e.x / gs.value), { duration: 300, easing: FILL }));
    },
    onUpdate: (e) => {
      raw.set(at(e.x / gs.value));
    },
    onFinalize: () => {
      pressed.set(withTiming(0, { duration: 200 }));
      raw.set(withTiming(ssnap(raw.value), { duration: 300, easing: FILL }));
    },
  });

  const fill = useAnimatedStyle(() => ({ width: ((raw.value - SMIN) / (SMAX - SMIN)) * width.value }));
  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: ((raw.value - SMIN) / (SMAX - SMIN)) * width.value - 14 }, { scale: 1 + pressed.value * 0.12 }],
  }));
  const shadow: ViewStyle = Platform.select<ViewStyle>({
    web: { boxShadow: '0 0.5px 4px rgba(0,0,0,0.12), 0 6px 13px rgba(0,0,0,0.12)' } as any,
    default: { shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 7, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  })!;

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={(e) => {
          setW(e.nativeEvent.layout.width);
          width.set(e.nativeEvent.layout.width);
        }}
        style={{ height: 44, ...webCursor('pointer') } as any}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Pace"
        accessibilityValue={{ text: `${value} kg per week` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => emit(ssnap(value + (e.nativeEvent.actionName === 'increment' ? SSTEP : -SSTEP)))}
      >
        <View style={{ position: 'absolute', left: 0, right: 0, top: 20, height: 4, borderRadius: 999, backgroundColor: '#E5E5EA' }} />
        <Animated.View style={[{ position: 'absolute', left: 0, top: 20, height: 4, borderRadius: 999, backgroundColor: C.violet }, fill]} />
        {w > 0 && <Animated.View style={[{ position: 'absolute', top: 8, left: 0, width: 28, height: 28, borderRadius: 999, backgroundColor: '#FFFFFF' }, shadow, thumb]} />}
      </View>
    </GestureDetector>
  );
}

export const _f = fontFor;
