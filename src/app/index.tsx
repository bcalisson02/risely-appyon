import { Redirect } from 'expo-router';
import { useOnboarding } from '../store/onboarding';

export default function Index() {
  const done = useOnboarding((s) => s.done);
  return <Redirect href={done ? '/(tabs)' : '/onboarding/0'} />;
}
