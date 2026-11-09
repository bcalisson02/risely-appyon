import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { O00, O01, O02, O03, O04, O05, O06, O07, O08, O09 } from '../../onboarding/steps/StepsA';
import { O10, O11, O12, O13, O14, O15, O16, O17 } from '../../onboarding/steps/StepsB';

const STEPS = [O00, O01, O02, O03, O04, O05, O06, O07, O08, O09, O10, O11, O12, O13, O14, O15, O16, O17];

export default function OnboardingStep() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const i = Math.max(0, Math.min(STEPS.length - 1, Number(step) || 0));
  const Step = STEPS[i];
  return <Step />;
}
