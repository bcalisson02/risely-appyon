import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../../theme/tokens';
import { EASE } from '../../theme/motion';
import { T } from '../../theme/type';
import { Glass } from '../../components/Glass';
import { Icon, IconName } from '../../components/Icon';
import { Press } from '../../components/Press';
import { InsetList, Row } from '../../components/List';
import { GlassButton, SectionTitle } from '../../components/Bits';
import { PrimaryButton } from '../../components/Button';
import { useScreen, useLightStatusBar } from '../../components/Frame';
import { CATALOG, EXERCISES } from '../../data/workouts';
import { useWorkouts } from '../../store/workouts';

/** W4 · Workout detail — full-bleed hero, facts as capsules, exercise list; Start stays pinned. */
export default function WorkoutDetail() {
  const { top, bottom } = useScreen();
  useLightStatusBar(true);
  const { id } = useLocalSearchParams<{ id: string }>();
  const w = CATALOG[id ?? 'fullbody'] ?? CATALOG.fullbody;
  const isPlan = w.id === 'fullbody';
  const [min, level, equip] = w.meta.split(' · ');
  const bookmarked = useWorkouts((s) => s.bookmarks.includes(w.id));
  const toggleBookmark = useWorkouts((s) => s.toggleBookmark);
  const bs = useSharedValue(1);
  const bSt = useAnimatedStyle(() => ({ transform: [{ scale: bs.value }] }));

  const fact = (icon: IconName, label: string) => (
    <View key={label} style={{ height: 32, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={16} />
      <T size={15} w="500">
        {label}
      </T>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 + bottom }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 330 }}>
          <Image source={w.img} style={{ width: '100%', height: 330 }} contentFit="cover" contentPosition={isPlan ? { left: '42%', top: '60%' } : 'center'} />
        </View>
        <View style={{ marginTop: -28, backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 22, paddingHorizontal: 16 }}>
          <View style={{ gap: 2, paddingHorizontal: 4, paddingBottom: 14 }}>
            <T size={28} lh={34} w="700" ls={-0.02} accessibilityRole="header">
              {w.title}
            </T>
            <T size={15} color={C.secondary}>
              {isPlan ? 'Pilates · Day 9 of 28' : `Pilates · ${level}`}
            </T>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 14 }}>
            {fact('clock', min)}
            {fact('chart-bar', level)}
            {fact('house-simple', equip ?? 'Mat')}
          </View>
          <T size={17} lh={23} color={C.label3C} style={{ paddingHorizontal: 4 }}>
            Low-impact moves for core, glutes and posture. Gentle on the joints, done on a mat at home.
          </T>
          <SectionTitle>8 exercises</SectionTitle>
          <InsetList>
            {EXERCISES.map(([n, d], i) => (
              <Row
                key={n}
                leadPad={14}
                padV={14}
                leading={
                  <T size={17} color={C.tertiary} style={{ width: 20, fontVariant: ['tabular-nums'] }}>
                    {i + 1}
                  </T>
                }
                title={n}
                trailing={
                  <T size={15} w="500" rounded color={C.secondary}>
                    {d}
                  </T>
                }
              />
            ))}
          </InsetList>
        </View>
      </ScrollView>

      <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }} />
      <View style={{ position: 'absolute', top, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <GlassButton icon="caret-left" weight="bold" iconSize={18} label="Back" onPress={() => router.back()} />
        <Press
          onPress={() => {
            bs.set(withSequence(withTiming(0.5, { duration: 0 }), withTiming(1.15, { duration: 250, easing: EASE }), withTiming(1, { duration: 170, easing: EASE })));
            toggleBookmark(w.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          accessibilityState={{ selected: bookmarked }}
        >
          <Glass style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={bSt}>
              <Icon name="bookmark-simple" size={20} color={bookmarked ? C.violet : C.ink} weight={bookmarked ? 'fill' : 'regular'} />
            </Animated.View>
          </Glass>
        </Press>
      </View>
      <LinearGradient
        colors={['rgba(242,242,247,0)', '#F2F2F7', '#F2F2F7']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 40, paddingHorizontal: 16, paddingBottom: bottom }}
      >
        <PrimaryButton title="Start workout" icon="play" onPress={() => router.push('/session')} />
      </LinearGradient>
    </View>
  );
}
