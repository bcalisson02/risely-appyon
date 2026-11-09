import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { C } from '../theme/tokens';
import { T } from '../theme/type';
import { Sheet } from '../components/Sheet';
import { Icon, IconName } from '../components/Icon';
import { Press } from '../components/Press';
import { IconTile, InsetList, Row, Chevron } from '../components/List';
import { AddToggle } from '../components/Bits';
import { RECENT } from '../data/foods';
import { comingSoon } from '../components/ComingSoon';
import { useNutrition } from '../store/nutrition';

/** N2 · Log food — the + opens this sheet. Meal is preselected by time of day (Dinner). */
export default function LogFood() {
  const addFood = useNutrition((s) => s.addFood);
  const remove = useNutrition((s) => s.remove);
  const dinner = useNutrition((s) => s.dinner);
  // a Recent item is ticked while dinner holds an entry made from it (ids are '<food id>-<time>-<n>')
  const entriesOf = (foodId: string) => dinner.filter((d) => d.id.startsWith(foodId + '-')).map((d) => d.id);

  const big = (icon: IconName, title: string, sub: string, onPress: () => void) => (
    <Press big onPress={onPress} accessibilityRole="button" style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, gap: 22 }}>
      <Icon name={icon} size={26} />
      <View style={{ gap: 1 }}>
        <T size={17} w="600">
          {title}
        </T>
        <T size={13} color={C.secondary}>
          {sub}
        </T>
      </View>
    </Press>
  );

  return (
    <Sheet title="Log food" fallback="/nutrition">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 14 }}>
        <T size={15} color={C.secondary}>
          Adding to
        </T>
        <Press onPress={comingSoon} style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityRole="button" accessibilityLabel="Meal: Dinner">
          <T size={15} w="600">
            Dinner
          </T>
          <Icon name="caret-down" size={13} weight="bold" />
        </Press>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {big('camera', 'Scan a meal', 'Photo to calories', () => router.push('/scan'))}
        {big('barcode', 'Scan barcode', 'Packaged food', () => router.push('/scan?mode=1'))}
      </View>
      <View style={{ height: 10 }} />
      <InsetList>
        {(
          [
            ['magnifying-glass', 'Search food', () => router.push('/search-food')],
            ['lightning', 'Quick add calories', comingSoon],
            ['bookmark-simple', 'Saved meals', comingSoon],
          ] as const
        ).map(([icon, title, onPress]) => (
          <Row key={title} onPress={onPress} leading={<Icon name={icon} size={22} />} title={title} gap={14} leadPad={16} padV={13} trailing={<Chevron />} />
        ))}
      </InsetList>
      <T size={15} w="600" style={{ paddingTop: 22, paddingHorizontal: 4, paddingBottom: 10 }}>
        Recent
      </T>
      <InsetList>
        {RECENT.map((f) => {
          const on = entriesOf(f.id).length > 0;
          return (
            <Row
              key={f.id}
              leading={<IconTile tone={f.tone} icon={f.icon} size={40} />}
              title={f.name}
              subtitle={
                <T size={13} color={C.secondary}>
                  {f.serving}
                </T>
              }
              padV={10}
              padR={12}
              trailing={
                <AddToggle
                  on={on}
                  label={f.name}
                  onPress={() => (on ? remove(entriesOf(f.id)) : addFood(f, { toast: false }))}
                />
              }
            />
          );
        })}
      </InsetList>
    </Sheet>
  );
}
