import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { C, IMG } from '../../theme/tokens';
import { FILL, isReduceMotion } from '../../theme/motion';
import { T, TwoTone } from '../../theme/type';
import { PrimaryButton, TextButton } from '../../components/Button';
import { SelectTile, Chip } from '../../components/Controls';
import { useScreen } from '../../components/Frame';
import { Rise } from '../../components/Rise';
import { useOnboarding, usePlan } from '../../store/onboarding';
import { OnbScreen, BigValue } from '../OnbScreen';
import { onb } from '../nav';
import { Ruler } from '../controls/Ruler';
import { PaceChart, PaceSlider } from '../controls/Pace';
import { ActivityBars, DayPicker, useNumberBump } from '../controls/Bars';
import { Dial } from '../controls/Dial';
import type { IconName } from '../../components/Icon';

const Continue = ({ step }: { step: number }) => <PrimaryButton title="Continue" onPress={() => onb.next(step)} />;

/** O00 · Welcome — full-bleed photo fading into white, slow Ken Burns zoom. */
export function O00() {
  const { top, bottom, height } = useScreen();
  const rm = isReduceMotion();
  const s = useSharedValue(rm ? 1 : 1.12);
  useEffect(() => {
    if (!rm) s.set(withTiming(1, { duration: 2400, easing: FILL }));
  }, []);
  const kb = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const photoH = Math.min(600, height * 0.7);
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: -30, height: photoH, overflow: 'hidden' }}>
        <Animated.View style={[{ flex: 1, transformOrigin: '50% 60%' } as any, kb]}>
          <Image source={IMG.welcome} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </Animated.View>
        {/* equivalent of mask-image: linear-gradient(#000 50%, rgba(0,0,0,.5) 72%, transparent 94%) on white */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', '#FFFFFF', '#FFFFFF']}
          locations={[0, 0.5, 0.72, 0.94, 1]}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingTop: top, paddingHorizontal: 16, paddingBottom: bottom }}>
        <Rise index={0} base={250} style={{ gap: 12, paddingHorizontal: 4, paddingBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={IMG.mark} style={{ width: 22, height: 24 }} contentFit="contain" />
            <T size={17} w="600">
              Risely
            </T>
          </View>
          <TwoTone gray="A plan that fits" ink="the life you already have." size={36} lh={41} ls={-0.03} />
          <T size={17} lh={23} color={C.secondary}>
            Home workouts, simple meal tracking and a coach. Setup takes about two minutes.
          </T>
        </Rise>
        <Rise index={1} base={250} style={{ paddingTop: 16, gap: 4 }}>
          <PrimaryButton title="Get started" onPress={() => onb.go(1)} />
          <TextButton title="I already have an account" onPress={() => onb.finish()} />
        </Rise>
      </View>
    </View>
  );
}

const GOALS: [string, IconName][] = [
  ['Lose weight', 'scales'],
  ['Get stronger', 'barbell'],
  ['Eat better', 'carrot'],
  ['More energy', 'lightning'],
];

/** O01 · Main goal — 2×2 tiles, single select. */
export function O01() {
  const goal = useOnboarding((s) => s.goal);
  const set = useOnboarding((s) => s.set);
  return (
    <OnbScreen title="What's your main goal?" subtitle="We'll shape your plan around it." footer={<Continue step={1} />}>
      <View style={{ gap: 10 }}>
        {[0, 2].map((r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 10 }}>
            {[r, r + 1].map((i) => (
              <SelectTile key={i} on={goal === i} onPress={() => set({ goal: i })} icon={GOALS[i][1]} label={GOALS[i][0]} />
            ))}
          </View>
        ))}
      </View>
    </OnbScreen>
  );
}

/** O02 · Current weight — ruler. */
export function O02() {
  const current = useOnboarding((s) => s.current);
  const set = useOnboarding((s) => s.set);
  return (
    <OnbScreen title="What's your current weight?" subtitle="Your best guess is fine. You can update it anytime." footer={<Continue step={2} />} gap={40}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <BigValue value={String(Math.round(current * 10) / 10)} unit="kg" />
      </View>
      <Ruler value={current} onChange={(v) => set({ current: v })} />
    </OnbScreen>
  );
}

/** O03 · Target weight — same ruler, key target. */
export function O03() {
  const target = useOnboarding((s) => s.target);
  const set = useOnboarding((s) => s.set);
  const d = usePlan();
  return (
    <OnbScreen
      title="What's your target weight?"
      subtitle={
        <T size={17} lh={23} color={C.secondary}>
          You weigh{' '}
          <T size={17} lh={23} w="600">
            {d.curW}
          </T>{' '}
          kg today.
        </T>
      }
      footer={<Continue step={3} />}
      gap={40}
    >
      <View style={{ alignItems: 'center', gap: 12 }}>
        <BigValue value={d.target} unit="kg" />
        <T size={17} color={C.secondary} center>
          {d.togo}
        </T>
      </View>
      <Ruler value={target} onChange={(v) => set({ target: v })} />
    </OnbScreen>
  );
}

/** O04 · Pace — slider with the live projection chart, goal date and kcal per day. */
export function O04() {
  const rate = useOnboarding((s) => s.rate);
  const set = useOnboarding((s) => s.set);
  const d = usePlan();
  return (
    <OnbScreen title="How fast do you want to get there?" footer={<Continue step={4} />} gap={18}>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <BigValue value={d.rate} unit="kg / week" size={64} />
        <T size={17} color={C.secondary} center>
          {d.paceLabel}
        </T>
      </View>
      <PaceChart d={d} />
      <View style={{ gap: 8 }}>
        <PaceSlider value={rate} onChange={(v) => set({ rate: v })} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {['Gentle', 'Steady', 'Fast'].map((l) => (
            <T key={l} size={13} color={C.secondary}>
              {l}
            </T>
          ))}
        </View>
        <T size={15} color={C.secondary} center style={{ paddingTop: 8 }}>
          About{' '}
          <T size={15} w="600">
            {d.kcal}
          </T>{' '}
          kcal a day
        </T>
      </View>
    </OnbScreen>
  );
}

/** O05 · Daily activity — 4 bars, tap or drag across. */
export function O05() {
  const activity = useOnboarding((s) => s.activity);
  const set = useOnboarding((s) => s.set);
  const d = usePlan();
  return (
    <OnbScreen title="How active is your day?" subtitle="Outside of workouts." footer={<Continue step={5} />} gap={32}>
      <ActivityBars value={activity} onChange={(i) => set({ activity: i })} />
      <View style={{ alignItems: 'center', gap: 4, minHeight: 56 }}>
        <T size={22} w="700" ls={-0.02} center>
          {d.actTitle}
        </T>
        <T size={17} color={C.secondary} center>
          {d.actDesc}
        </T>
      </View>
    </OnbScreen>
  );
}

/** O06 · Workout days — big count + 7 day pills. */
export function O06() {
  const days = useOnboarding((s) => s.days);
  const toggleDay = useOnboarding((s) => s.toggleDay);
  const d = usePlan();
  const bump = useNumberBump(days.length);
  return (
    <OnbScreen title="Which days can you work out?" footer={<Continue step={6} />} gap={32}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <Animated.View style={bump}>
          <T size={88} lh={88} w="600" rounded ls={-0.03}>
            {d.daysN}
          </T>
        </Animated.View>
        <T size={17} color={C.secondary}>
          {d.daysWord}
        </T>
      </View>
      <DayPicker days={days} onToggle={toggleDay} />
      <T size={15} color={C.secondary} center>
        {d.daysList}
      </T>
    </OnbScreen>
  );
}

/** O07 · Session length — circular dial. */
export function O07() {
  const minutes = useOnboarding((s) => s.minutes);
  const set = useOnboarding((s) => s.set);
  const d = usePlan();
  return (
    <OnbScreen title="How long per session?" footer={<Continue step={7} />} gap={28}>
      <Dial value={minutes} onChange={(v) => set({ minutes: v })} />
      <T size={17} color={C.secondary} center>
        {d.minHint}
      </T>
    </OnbScreen>
  );
}

const TYPES: [string, IconName][] = [
  ['Pilates', 'person-simple-tai-chi'],
  ['Yoga', 'flower-lotus'],
  ['Strength', 'barbell'],
  ['Cardio', 'heartbeat'],
  ['HIIT', 'lightning'],
  ['Walking', 'sneaker-move'],
];

/** O08 · Workout types — 2×3 tiles, multi-select. */
export function O08() {
  const types = useOnboarding((s) => s.types);
  const toggleIn = useOnboarding((s) => s.toggleIn);
  return (
    <OnbScreen title="What do you enjoy?" subtitle="Pick as many as you like." footer={<Continue step={8} />}>
      <View style={{ gap: 10 }}>
        {[0, 2, 4].map((r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 10 }}>
            {[r, r + 1].map((i) => (
              <SelectTile
                key={i}
                on={types.includes(i)}
                onPress={() => toggleIn('types', i)}
                icon={TYPES[i][1]}
                iconSize={26}
                label={TYPES[i][0]}
                height={96}
                pad={16}
                padV={14}
              />
            ))}
          </View>
        ))}
      </View>
    </OnbScreen>
  );
}

const EQUIP = ['None', 'Mat', 'Wall', 'Dumbbells', 'Resistance bands', 'Chair', 'Kettlebell', 'Pull-up bar'];

/** O09 · Equipment — capsules 48pt, multi-select. */
export function O09() {
  const equipment = useOnboarding((s) => s.equipment);
  const toggleIn = useOnboarding((s) => s.toggleIn);
  return (
    <OnbScreen title="What do you have at home?" subtitle="No equipment works too." footer={<Continue step={9} />}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {EQUIP.map((e, i) => (
          <Chip key={e} label={e} on={equipment.includes(i)} onPress={() => toggleIn('equipment', i)} height={48} padH={20} size={17} bg={C.bg} />
        ))}
      </View>
    </OnbScreen>
  );
}
