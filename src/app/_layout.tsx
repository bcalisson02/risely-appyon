import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router/js-stack';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Frame } from '../components/Frame';
import { modalOptions, pushOptions, sheetOptions, fadeOptions } from '../nav/transitions';
import { useReduceMotion } from '../theme/motion';
import { useOnboarding } from '../store/onboarding';
import { useNutrition } from '../store/nutrition';
import { useWorkouts } from '../store/workouts';

if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('risely-fonts')) {
  // Inter for non-Apple browsers (README → Typography); Apple browsers resolve -apple-system / ui-rounded first.
  const l = document.createElement('link');
  l.id = 'risely-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap';
  document.head.appendChild(l);
  const s = document.createElement('style');
  s.textContent =
    'html,body,#root{height:100%;overscroll-behavior:none}body{-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;touch-action:manipulation}input,textarea{user-select:text;-webkit-user-select:text}*::-webkit-scrollbar{display:none}*{scrollbar-width:none}img{-webkit-user-drag:none}';
  document.head.appendChild(s);
}

function useHydrated() {
  const [h, setH] = useState(useOnboarding.persist.hasHydrated() && useNutrition.persist.hasHydrated() && useWorkouts.persist.hasHydrated());
  useEffect(() => {
    const check = () => setH(useOnboarding.persist.hasHydrated() && useNutrition.persist.hasHydrated() && useWorkouts.persist.hasHydrated());
    const a = useOnboarding.persist.onFinishHydration(check);
    const b = useNutrition.persist.onFinishHydration(check);
    const c = useWorkouts.persist.onFinishHydration(check);
    check();
    return () => {
      a();
      b();
      c();
    };
  }, []);
  return h;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(Platform.OS === 'android' ? { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } : {});
  const hydrated = useHydrated();
  const reduce = useReduceMotion();
  const ready = (fontsLoaded || Platform.OS !== 'android') && hydrated;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Frame>
          {ready ? (
            <Stack screenOptions={pushOptions(reduce)}>
              <Stack.Screen name="index" options={fadeOptions()} />
              <Stack.Screen name="onboarding" options={fadeOptions()} />
              <Stack.Screen name="(tabs)" options={fadeOptions()} />
              <Stack.Screen name="category" options={pushOptions(reduce)} />
              <Stack.Screen name="workout/[id]" options={pushOptions(reduce)} />
              <Stack.Screen name="log-food" options={sheetOptions(reduce)} />
              <Stack.Screen name="filters" options={sheetOptions(reduce)} />
              <Stack.Screen name="scan" options={modalOptions(reduce)} />
              <Stack.Screen name="search-food" options={modalOptions(reduce)} />
              <Stack.Screen name="session" options={modalOptions(reduce)} />
              <Stack.Screen name="coach" options={modalOptions(reduce)} />
            </Stack>
          ) : (
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
          )}
        </Frame>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
