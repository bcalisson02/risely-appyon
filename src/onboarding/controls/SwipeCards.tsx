import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, useAnimatedReaction, cancelAnimation, SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../../theme/tokens';
import { T } from '../../theme/type';
import { EASE , webCursor } from '../../theme/motion';
import { tick } from '../../components/anim';
import { useGestureScale } from '../../components/Frame';

/**
 * Eating style (O10): horizontal swipe cards 260×360 with photos, snap to center; side cards
 * scale to 0.9 at 0.6 opacity; page dots. The centered card is the selection.
 */
const CW = 260;
const GAP = 12;
const SZ = CW + GAP;

export type DietCard = { title: string; sub: string; img: any };

export function SwipeCards({ cards, value, onChange }: { cards: DietCard[]; value: number; onChange: (i: number) => void }) {
  const [w, setW] = useState(0);
  const off = useSharedValue(value * SZ);
  const start = useSharedValue(0);
  const last = useSharedValue(value);
  const lastMove = useSharedValue(0);
  const width = useSharedValue(0);
  const active = useSharedValue(false);
  const N = cards.length;

  const emit = useCallback(
    (i: number) => {
      tick();
      onChange(i);
    },
    [onChange]
  );
  // owns its scroll offset (see Ruler); accessibility actions move it directly

  useAnimatedReaction(
    () => Math.max(0, Math.min(N - 1, Math.round(off.value / SZ))),
    (i) => {
      if (i !== last.value) {
        last.set(i);
        scheduleOnRN(emit, i);
      }
    }
  );

  // pointer values arrive in screen px; divide by the frame scale to get layout points
  const gs = useGestureScale();

  const pan = usePanGesture({
    activeOffsetX: [-6, 6],
    failOffsetY: [-14, 14],
    onBegin: () => {
      active.set(false);
      cancelAnimation(off);
      start.set(off.value);
    },
    onActivate: () => {
      active.set(true);
    },
    onUpdate: (e) => {
      lastMove.set(Date.now());
      let o = start.value - (e.translationX / gs.value);
      const max = (N - 1) * SZ;
      if (o < 0) o *= 0.35;
      if (o > max) o = max + (o - max) * 0.35;
      off.set(o);
    },
    onDeactivate: (e) => {
      const vx = Date.now() - lastMove.value > 60 ? 0 : Math.max(-2.5, Math.min(2.5, (e.velocityX / gs.value) / 1000));
      const i = Math.max(0, Math.min(N - 1, Math.round((off.value - vx * 200) / SZ)));
      off.set(withTiming(i * SZ, { duration: 450, easing: EASE }));
    },
    // a tap (no swipe) on a side card brings it to the center
    onFinalize: (e) => {
      if (active.value || width.value <= 0) return;
      const x = e.x / gs.value;
      const i = Math.max(0, Math.min(N - 1, Math.round((x - width.value / 2 + off.value) / SZ)));
      off.set(withTiming(i * SZ, { duration: 450, easing: EASE }));
    },
  });

  const row = useAnimatedStyle(() => ({ transform: [{ translateX: w / 2 - CW / 2 - off.value }] }));

  return (
    <View style={{ gap: 20 }}>
      <GestureDetector gesture={pan}>
        <View
          onLayout={(e) => {
            setW(e.nativeEvent.layout.width);
            width.set(e.nativeEvent.layout.width);
          }}
          style={{ marginHorizontal: -16, height: 376, overflow: 'hidden', ...webCursor('grab') } as any}
          accessibilityRole="adjustable"
          accessibilityLabel="Eating style"
          accessibilityValue={{ text: cards[value]?.title }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => off.set(withTiming(Math.max(0, Math.min(N - 1, value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))) * SZ, { duration: 450, easing: EASE }))}
        >
          <Animated.View style={[{ flexDirection: 'row', gap: GAP, paddingVertical: 8 }, row]}>
            {cards.map((c, j) => (
              <Card key={c.title} c={c} j={j} off={off} />
            ))}
          </Animated.View>
        </View>
      </GestureDetector>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        {cards.map((c, j) => (
          <Dot key={c.title} on={j === value} />
        ))}
      </View>
    </View>
  );
}

function Card({ c, j, off }: { c: DietCard; j: number; off: SharedValue<number> }) {
  const st = useAnimatedStyle(() => {
    const d = Math.min(1, Math.abs(j - off.value / SZ));
    return { transform: [{ scale: 1 - 0.1 * d }], opacity: 1 - 0.4 * d };
  });
  return (
    <Animated.View style={[{ width: CW, height: 360, borderRadius: 28, overflow: 'hidden', backgroundColor: C.bg }, st]}>
      {/* no touch targets inside: the pan detector handles swipe and tap */}
      <View pointerEvents="none" style={{ flex: 1 }}>
        <Image source={c.img} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" pointerEvents="none" draggable={false} />
        <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.62)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 }} />
        <View style={{ position: 'absolute', left: 20, right: 20, bottom: 18, gap: 2 }}>
          <T size={24} w="700" ls={-0.02} color="#FFFFFF">
            {c.title}
          </T>
          <T size={15} color="rgba(255,255,255,0.9)">
            {c.sub}
          </T>
        </View>
      </View>
    </Animated.View>
  );
}

function Dot({ on }: { on: boolean }) {
  const w = useSharedValue(on ? 18 : 6);
  useEffect(() => {
    w.set(withTiming(on ? 18 : 6, { duration: 300, easing: EASE }));
  }, [on, w]);
  const st = useAnimatedStyle(() => ({ width: w.value }));
  return <Animated.View style={[{ height: 6, borderRadius: 999, backgroundColor: on ? C.violet : '#D1D1D6' }, st]} />;
}
