import { router } from 'expo-router';
import { useOnboarding } from '../store/onboarding';

/**
 * Onboarding navigation rules from proto-engine.js:
 *  - Continue pushes the next step.
 *  - O16 cards edit their source answer; Continue on that step returns to O16.
 *  - Back with no history goes to the previous step.
 */
let returnTo: number | null = null;

export const onb = {
  next(step: number) {
    if (returnTo !== null && step !== returnTo && router.canGoBack()) {
      returnTo = null;
      router.back();
      return;
    }
    router.push(`/onboarding/${step + 1}`);
  },
  go(step: number) {
    router.push(`/onboarding/${step}`);
  },
  edit(step: number) {
    returnTo = 16;
    router.push(`/onboarding/${step}`);
  },
  back(step: number) {
    if (router.canGoBack()) router.back();
    else if (step > 0) router.replace(`/onboarding/${step - 1}`);
  },
  arrivedAt(step: number) {
    if (step === returnTo) returnTo = null;
  },
  finish() {
    returnTo = null;
    useOnboarding.getState().finish();
    router.replace('/(tabs)');
  },
  /** O16 "Adjust answers": back to O01 with the steps in between removed from history */
  restart() {
    returnTo = null;
    if (router.canDismiss()) router.dismissAll();
    router.push('/onboarding/1');
  },
};
