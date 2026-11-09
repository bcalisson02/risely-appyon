import React from 'react';
import { View } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';
import { Stack } from 'expo-router/js-stack';
import { OnbHeader } from '../../onboarding/OnbHeader';
import { onb } from '../../onboarding/nav';
import { fadeOptions, pushOptions } from '../../nav/transitions';
import { useReduceMotion } from '../../theme/motion';

export default function OnboardingLayout() {
  const params = useGlobalSearchParams<{ step?: string }>();
  const step = Math.max(0, Math.min(17, Number(params.step ?? 0) || 0));
  const reduce = useReduceMotion();
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Stack
        screenOptions={({ route }: any) => {
          const s = Number(route?.params?.step);
          // O14 → O15 and O15 → O16 are fades in the prototype
          return s === 15 || s === 16 ? fadeOptions() : pushOptions(reduce);
        }}
      />
      <OnbHeader step={step} onBack={() => onb.back(step)} />
    </View>
  );
}
