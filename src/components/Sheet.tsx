import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { C } from '../theme/tokens';
import { EASE } from '../theme/motion';
import { T } from '../theme/type';
import { Icon } from './Icon';
import { Press } from './Press';
import { useScreen } from './Frame';

/**
 * Bottom sheet body (N2, W2). The navigator animates the rise (560 ms) and the 0.28 dim;
 * this adds the 36×5 grabber, the header and drag-to-dismiss on the top area.
 */
export function Sheet({
  title,
  children,
  left,
  topOffset = 190,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  left?: React.ReactNode;
  topOffset?: number;
  footer?: React.ReactNode;
}) {
  const { height, bottom } = useScreen();
  const top = Math.min(topOffset, Math.max(60, height - 640));
  const y = useSharedValue(0);
  const close = () => router.back();
  const pan = usePanGesture({
    activeOffsetY: [-8, 8],
    onUpdate: (e) => {
      y.set(Math.max(0, e.translationY) + Math.min(0, e.translationY) * 0.15);
    },
    onDeactivate: (e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        scheduleOnRN(close);
      } else y.set(withTiming(0, { duration: 300, easing: EASE }));
    },
  });
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={{ flex: 1 }}>
      <Pressable accessibilityLabel="Close" onPress={close} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: top + 10 }} />
      <Animated.View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0, top, backgroundColor: C.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
          st,
        ]}
      >
        <GestureDetector gesture={pan}>
          <View style={{ paddingTop: 8, paddingHorizontal: 16 }}>
            <View style={{ alignSelf: 'center', width: 36, height: 5, borderRadius: 999, backgroundColor: '#C7C7CC', marginBottom: 10 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 14 }}>
              {left ?? (
                <T size={22} w="700" ls={-0.015} accessibilityRole="header">
                  {title}
                </T>
              )}
              {left ? (
                <T size={17} w="600" style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center' }} pointerEvents="none">
                  {title}
                </T>
              ) : null}
              <Press onPress={close} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close" style={{ width: 30, height: 30, borderRadius: 999, backgroundColor: C.fill, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="x" size={14} color={C.secondary} weight="bold" />
              </Press>
            </View>
          </View>
        </GestureDetector>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: footer ? 16 : bottom + 8 }} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        {footer ? <View style={{ paddingHorizontal: 16, paddingBottom: bottom, paddingTop: 8 }}>{footer}</View> : null}
      </Animated.View>
    </View>
  );
}
