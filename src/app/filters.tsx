import React from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { C } from '../theme/tokens';
import { T } from '../theme/type';
import { Sheet } from '../components/Sheet';
import { Chip } from '../components/Controls';
import { Press } from '../components/Press';
import { PrimaryButton } from '../components/Button';
import { tick } from '../components/anim';
import { DURATIONS, EQUIPMENT, FOCUS, LEVELS, matchCount, useWorkouts, Filters } from '../store/workouts';

const Label = ({ children }: { children: string }) => (
  <T size={15} w="600" style={{ paddingTop: 22, paddingHorizontal: 4, paddingBottom: 10 }}>
    {children}
  </T>
);

/** W2 · Filters — sheet over the library. The count on the button updates live. */
export default function FiltersSheet() {
  const filters = useWorkouts((s) => s.filters);
  const setFilters = useWorkouts((s) => s.setFilters);
  const resetFilters = useWorkouts((s) => s.resetFilters);
  const n = matchCount(filters);
  const { from } = useLocalSearchParams<{ from?: string }>();

  const toggle = (k: Exclude<keyof Filters, 'duration'>, i: number) => {
    const arr = filters[k];
    setFilters({ [k]: arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i] } as Partial<Filters>);
  };
  const group = (k: Exclude<keyof Filters, 'duration'>, opts: string[]) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {opts.map((o, i) => (
        <Chip key={o} label={o} on={filters[k].includes(i)} onPress={() => toggle(k, i)} height={38} />
      ))}
    </View>
  );
  const shadow: ViewStyle = Platform.select<ViewStyle>({
    web: { boxShadow: '0 3px 8px rgba(0,0,0,0.12)' } as any,
    default: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  })!;

  return (
    <Sheet
      title="Filters"
      topOffset={150}
      left={
        <Press onPress={resetFilters} accessibilityRole="button" hitSlop={8} style={{ width: 70 }}>
          <T size={17} color={C.violet}>
            Reset
          </T>
        </Press>
      }
      footer={<PrimaryButton title={`Show ${n} workouts`} onPress={() => (from === 'category' ? router.back() : router.replace('/category?name=Pilates'))} />}
    >
      <Label>Duration</Label>
      <View style={{ flexDirection: 'row', padding: 2, backgroundColor: C.fill, borderRadius: 10 }}>
        {DURATIONS.map((d, i) => {
          const on = filters.duration === i;
          return (
            <Press
              key={d}
              plain
              onPress={() => {
                tick();
                setFilters({ duration: i });
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[{ flex: 1, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, on ? [{ backgroundColor: '#FFFFFF' }, shadow] : null]}
            >
              <T size={15} w={on ? '600' : '500'}>
                {d}
              </T>
            </Press>
          );
        })}
      </View>
      <Label>Level</Label>
      {group('level', LEVELS)}
      <Label>Equipment</Label>
      {group('equipment', EQUIPMENT)}
      <Label>Focus</Label>
      {group('focus', FOCUS)}
    </Sheet>
  );
}
