import React from 'react';
import { Easing } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '../../components/TabBar';
import { DUR } from '../../theme/motion';

/** Tabs crossfade over 280 ms while the indicator slides (see TabBar). */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: any) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        transitionSpec: { animation: 'timing', config: { duration: DUR.tab, easing: Easing.bezier(0.32, 0.72, 0, 1) } },
        sceneStyle: { backgroundColor: '#F2F2F7' },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="workouts" />
    </Tabs>
  );
}
