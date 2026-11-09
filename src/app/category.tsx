import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, ZoomOut, LinearTransition } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { C } from '../theme/tokens';
import { EASE } from '../theme/motion';
import { T } from '../theme/type';
import { Aura } from '../components/Aura';
import { Icon } from '../components/Icon';
import { Press } from '../components/Press';
import { InsetList } from '../components/List';
import { GlassButton } from '../components/Bits';
import { WorkoutRow } from '../components/WorkoutRow';
import { useScreen } from '../components/Frame';
import { CATALOG, CATEGORY_LIST } from '../data/workouts';
import { activeCapsules, matchCount, useWorkouts } from '../store/workouts';

/** W3 · Category — active filters as removable capsules. */
export default function Category() {
  const { top } = useScreen();
  const { name } = useLocalSearchParams<{ name?: string }>();
  const filters = useWorkouts((s) => s.filters);
  const clearFilter = useWorkouts((s) => s.clearFilter);
  const caps = activeCapsules(filters);
  const n = matchCount(filters);
  return (
    <View style={{ flex: 1 }}>
      <Aura />
      <ScrollView contentContainerStyle={{ paddingTop: top, paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, paddingBottom: 8 }}>
          <GlassButton icon="caret-left" weight="bold" iconSize={18} label="Back" onPress={() => router.back()} />
          <GlassButton icon="sliders-horizontal" label="Filters" onPress={() => router.push('/filters?from=category')} />
        </View>
        <View style={{ gap: 2, paddingTop: 4, paddingHorizontal: 4, paddingBottom: 14 }}>
          <T size={34} lh={41} w="700" ls={-0.02} accessibilityRole="header">
            {name || 'Pilates'}
          </T>
          <T size={15} color={C.secondary}>
            {n} workouts match your filters
          </T>
        </View>
        {caps.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 14 }}>
            {caps.map((c) => (
              <Animated.View key={c.key} entering={FadeIn.duration(200)} exiting={ZoomOut.duration(220).easing(EASE as any)} layout={LinearTransition.duration(260)}>
                <Press
                  onPress={() => clearFilter(c.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove filter ${c.label}`}
                  style={{ height: 32, paddingLeft: 12.5, paddingRight: 8.5, borderRadius: 999, backgroundColor: C.violetTint, borderWidth: 1.5, borderColor: C.violet, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <T size={15} w="600" color={C.violetDark}>
                    {c.label}
                  </T>
                  <Icon name="x" size={12} color={C.violetDark} weight="bold" />
                </Press>
              </Animated.View>
            ))}
          </View>
        ) : null}
        <InsetList>
          {CATEGORY_LIST.map((id) => (
            <WorkoutRow key={id} {...CATALOG[id]} />
          ))}
        </InsetList>
      </ScrollView>
    </View>
  );
}
