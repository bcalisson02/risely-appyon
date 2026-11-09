import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { C } from '../theme/tokens';
import { EASE, SPRING, DUR } from '../theme/motion';
import { Glass } from './Glass';
import { Icon, IconName } from './Icon';
import { Press } from './Press';
import { useScreen } from './Frame';
import { tick } from './anim';

/**
 * Custom floating tab bar (README → Tab bar): 16pt from the sides, 30pt above the bottom edge.
 * Glass capsule with 5pt padding holding four 52pt buttons (6pt gap). Active tab = black circle with
 * a white fill icon, no labels. The indicator slides with cubic-bezier(0.34,1.4,0.64,1) over 460 ms.
 * Plus = separate 62pt glass circle → Log food. Coach opens full screen as a modal, not as a tab.
 */
const TABS: { key: string; route: string; icon: IconName; label: string }[] = [
  { key: 'index', route: 'index', icon: 'house', label: 'Today' },
  { key: 'nutrition', route: 'nutrition', icon: 'fork-knife', label: 'Nutrition' },
  { key: 'workouts', route: 'workouts', icon: 'barbell', label: 'Workouts' },
  { key: 'coach', route: '', icon: 'chat-circle', label: 'Coach' },
];
const STEP = 52 + 6;

export function TabBar({ state, navigateToTab }: any) {
  const { bottom } = useScreen();
  const current = state.routes[state.index]?.name as string;
  const idx = Math.max(0, TABS.findIndex((t) => t.route === current));
  const x = useSharedValue(idx * STEP);
  useEffect(() => {
    x.set(withTiming(idx * STEP, { duration: DUR.tabIndicator, easing: SPRING }));
  }, [idx, x]);
  const ind = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(242,242,247,0)', 'rgba(242,242,247,0.92)', 'rgba(242,242,247,0.92)']}
        locations={[0, 0.55, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 }}
      />
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(16, bottom - 4), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Glass shadow="bar" style={{ padding: 5 }}>
          <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="tablist">
            <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: 52, height: 52, borderRadius: 999, backgroundColor: C.ink }, ind]} />
            {TABS.map((t, i) => (
              <TabButton
                key={t.key}
                t={t}
                on={i === idx}
                onPress={() => {
                  tick();
                  if (!t.route) {
                    router.push('/coach');
                    return;
                  }
                  if (t.route === current) return;
                  const r = state.routes.find((x: any) => x.name === t.route);
                  if (r) navigateToTab(r.key);
                }}
              />
            ))}
          </View>
        </Glass>
        <Press onPress={() => router.push('/log-food')} accessibilityRole="button" accessibilityLabel="Log food">
          <Glass shadow="bar" style={{ width: 62, height: 62, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={26} color={C.ink} />
          </Glass>
        </Press>
      </View>
    </>
  );
}

function TabButton({ t, on, onPress }: { t: (typeof TABS)[number]; on: boolean; onPress: () => void }) {
  const s = useSharedValue(1);
  const first = React.useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (on) s.set(withSequence(withTiming(0.85, { duration: 120 }), withTiming(1, { duration: 300, easing: EASE })));
  }, [on, s]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Press
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={t.label}
      accessibilityState={{ selected: on }}
      style={{ width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={st}>
        <Icon name={t.icon} size={22} color={on ? '#FFFFFF' : C.ink} weight={on ? 'fill' : 'regular'} />
      </Animated.View>
    </Press>
  );
}
