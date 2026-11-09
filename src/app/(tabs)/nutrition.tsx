import React from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { C, IMG } from '../../theme/tokens';
import { T } from '../../theme/type';
import { Aura } from '../../components/Aura';
import { Ring } from '../../components/Ring';
import { Icon } from '../../components/Icon';
import { IconTile, InsetList, Row, Chevron } from '../../components/List';
import { CountUp, GlassButton, MacroBar, SectionTitle, Toast } from '../../components/Bits';
import { useScreen } from '../../components/Frame';
import { BASE_MEALS, useDay, useNutrition } from '../../store/nutrition';
import { comingSoon } from '../../components/ComingSoon';
import { fmtInt } from '../../components/anim';

const STRIP = [
  ['M', 2, 'past'],
  ['T', 3, 'past'],
  ['W', 4, 'today'],
  ['T', 5, 'future'],
  ['F', 6, 'future'],
  ['S', 7, 'future'],
  ['S', 8, 'future'],
] as const;

/** N1 · Daily summary (and N7 · Logged, once dinner is added). Ring = share of goal eaten. */
export default function Nutrition() {
  const { top } = useScreen();
  const day = useDay();
  const toastFood = useNutrition((s) => s.toastFood);
  const toastKey = useNutrition((s) => s.toastKey);
  const toastAt = useNutrition((s) => s.toastAt);
  // shown only right after an add (N5 / N6 → N7); a stale request is dropped
  const [now] = React.useState(() => Date.now());
  const undo = useNutrition((s) => s.undo);
  const clearToast = useNutrition((s) => s.clearToast);
  const hasDinner = day.dinner.length > 0;
  const dinnerPhoto = day.dinner.some((d) => d.photo);

  return (
    <View style={{ flex: 1 }}>
      <Aura />
      <ScrollView contentContainerStyle={{ paddingTop: top, paddingHorizontal: 16, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingTop: 12, paddingHorizontal: 4, paddingBottom: 16 }}>
          <T size={34} lh={41} w="700" ls={-0.02} style={{ flex: 1 }} accessibilityRole="header">
            Nutrition
          </T>
          <GlassButton icon="calendar-blank" label="Calendar" onPress={comingSoon} />
        </View>

        <View style={{ flexDirection: 'row', paddingBottom: 14 }}>
          {STRIP.map(([l, n, kind], i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <T size={12} w="600" color={C.gray2}>
                {l}
              </T>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: kind === 'today' ? C.violet : 'transparent',
                  borderWidth: kind === 'past' ? 1.5 : 0,
                  borderColor: C.violetTint,
                }}
                accessibilityState={{ selected: kind === 'today' }}
              >
                <T size={17} w={kind === 'today' ? '600' : '400'} color={kind === 'today' ? '#FFFFFF' : kind === 'past' ? C.ink : C.tertiary}>
                  {n}
                </T>
              </View>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 22 }}>
            <Ring size={128} stroke={14} value={day.ring}>
              <CountUp value={day.left} size={34} lh={38} ls={-0.02} />
              <T size={13} color={C.secondary}>
                kcal left
              </T>
            </Ring>
            <View style={{ flex: 1 }}>
              {(
                [
                  ['Goal', day.goal],
                  ['Eaten', day.eaten],
                  ['Burned', day.burned],
                ] as const
              ).map(([l, v], i) => (
                <View
                  key={l}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingTop: i === 0 ? 0 : 10,
                    paddingBottom: 10,
                    borderBottomWidth: i < 2 ? 0.5 : 0,
                    borderBottomColor: C.separator,
                  }}
                >
                  <T size={15} color={C.secondary}>
                    {l}
                  </T>
                  <CountUp value={v} size={17} />
                </View>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 14, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: C.separator }}>
            {(
              [
                ['Protein', day.p, day.pGoal, C.protein],
                ['Carbs', day.c, day.cGoal, C.carbs],
                ['Fat', day.f, day.fGoal, C.fat],
              ] as const
            ).map(([l, v, g, color]) => (
              <View key={l} style={{ flex: 1, gap: 6 }}>
                <T size={13} w="500" color={C.secondary}>
                  {l}
                </T>
                <T size={20} w="600" rounded>
                  <CountUp value={v} size={20} />
                  <T size={13} w="500" color={C.gray2}>
                    /{g}g
                  </T>
                </T>
                <MacroBar value={v / g} color={color} />
              </View>
            ))}
          </View>
        </View>

        <SectionTitle>Meals</SectionTitle>
        <InsetList>
          {BASE_MEALS.map((m) => (
            <Row
              key={m.id}
              onPress={comingSoon}
              leading={<IconTile tone={m.tone} icon={m.icon} size={48} />}
              title={m.title}
              subtitle={
                <T size={15} color={C.secondary} numberOfLines={1}>
                  {m.desc}
                </T>
              }
              trailing={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T size={15} w="500" rounded color={C.secondary}>
                    {m.kcal}
                  </T>
                  <Chevron />
                </View>
              }
            />
          ))}
          {hasDinner ? (
            <Row
              onPress={() => router.push('/log-food')}
              leading={
                dinnerPhoto ? (
                  <Image source={IMG.mealBowl} style={{ width: 48, height: 48, borderRadius: 12 }} contentFit="cover" contentPosition={{ left: '60%', top: '50%' }} />
                ) : (
                  <IconTile tone="sky" icon="fork-knife" size={48} />
                )
              }
              title="Dinner"
              subtitle={
                <T size={15} color={C.secondary} numberOfLines={1}>
                  {day.dinner.map((d) => d.name).join(', ')}
                </T>
              }
              trailing={
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <T size={15} w="500" rounded color={C.secondary}>
                    {day.dinnerKcal}
                  </T>
                  <Chevron />
                </View>
              }
            />
          ) : (
            <Row
              onPress={() => router.push('/log-food')}
              leading={
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="plus" size={20} color={C.violet} />
                </View>
              }
              title="Add dinner"
              titleColor={C.violet}
              subtitle="Suggested: around 600 kcal"
            />
          )}
        </InsetList>
      </ScrollView>
      {toastFood && toastAt > now - 8000 ? (
        <Toast
          key={toastKey}
          top={top + 4}
          title={`Added to dinner`}
          detail={`· ${fmtInt(toastFood.kcal)} kcal`}
          action="Undo"
          onAction={() => setTimeout(undo, 250)}
          onHidden={clearToast}
        />
      ) : null}
    </View>
  );
}
