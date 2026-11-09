import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { C, IMG } from '../../theme/tokens';
import { EASE, SPRING, isReduceMotion } from '../../theme/motion';
import { T } from '../../theme/type';
import { PrimaryButton, TextButton } from '../../components/Button';
import { Segmented, Switch } from '../../components/Controls';
import { InsetList, IconTile, Row, Chevron } from '../../components/List';
import { Icon } from '../../components/Icon';
import { Press } from '../../components/Press';
import { Rise } from '../../components/Rise';
import { Ring } from '../../components/Ring';
import { Aura } from '../../components/Aura';
import { useScreen } from '../../components/Frame';
import { fmtInt, useTween, easeFill } from '../../components/anim';
import { useOnboarding, usePlan } from '../../store/onboarding';
import { TONE } from '../../logic/derive';
import { OnbScreen } from '../OnbScreen';
import { onb } from '../nav';
import { SwipeCards, DietCard } from '../controls/SwipeCards';
import { Wheel } from '../controls/Wheel';
import { router } from 'expo-router';

const Continue = ({ step }: { step: number }) => <PrimaryButton title="Continue" onPress={() => onb.next(step)} />;

const DIETS: DietCard[] = [
  { title: 'No preference', sub: 'Everything on the menu', img: IMG.dietAny },
  { title: 'Vegetarian', sub: 'No meat or fish', img: IMG.dietVegetarian },
  { title: 'Vegan', sub: 'Plant-based only', img: IMG.dietVegan },
  { title: 'Pescatarian', sub: 'Fish, no meat', img: IMG.dietPescatarian },
  { title: 'Low carb', sub: 'Fewer carbs, more protein', img: IMG.dietLowcarb },
];

/** O10 · Eating style — swipe cards; the centered one is selected. */
export function O10() {
  const diet = useOnboarding((s) => s.diet);
  const set = useOnboarding((s) => s.set);
  return (
    <OnbScreen title="How do you like to eat?" subtitle="Swipe to choose." footer={<Continue step={10} />} gap={20}>
      <SwipeCards cards={DIETS} value={diet} onChange={(i) => set({ diet: i })} />
    </OnbScreen>
  );
}

const HEIGHTS = Array.from({ length: 71 }, (_, i) => 140 + i);
const YEARS = Array.from({ length: 59 }, (_, i) => 1950 + i);

/** O11 · About you — segmented sex + height and birth-year wheels. */
export function O11() {
  const { sex, height, year, set } = useOnboarding();
  return (
    <OnbScreen title="A bit about you" subtitle="Used to set your calorie target." footer={<Continue step={11} />} gap={28}>
      <Segmented options={['Female', 'Male', 'Other']} value={sex} onChange={(i) => set({ sex: i })} />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row' }}>
          <T size={15} color={C.secondary} center style={{ flex: 1 }}>
            Height
          </T>
          <T size={15} color={C.secondary} center style={{ flex: 1 }}>
            Born in
          </T>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: 90, height: 36, borderRadius: 10, backgroundColor: C.bg }} />
          <Wheel label="Height" values={HEIGHTS} value={height} onChange={(v) => set({ height: v })} format={(v) => `${v} cm`} />
          <Wheel label="Born in" values={YEARS} value={year} onChange={(v) => set({ year: v })} />
          <LinearGradient pointerEvents="none" colors={['#FFFFFF', 'rgba(255,255,255,0)']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 216 * 0.28 }} />
          <LinearGradient pointerEvents="none" colors={['rgba(255,255,255,0)', '#FFFFFF']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 216 * 0.28 }} />
        </View>
      </View>
    </OnbScreen>
  );
}

/** Typing dots: bounce, 160 ms stagger. */
export function TypingDots({ color = C.gray2, period = 900, stagger = 150, lift = 3 }: { color?: string; period?: number; stagger?: number; lift?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 7, paddingHorizontal: 2 }}>
      {[0, 1, 2].map((j) => (
        <Dot key={j} j={j} color={color} period={period} stagger={stagger} lift={lift} />
      ))}
    </View>
  );
}
function Dot({ j, color, period, stagger, lift }: { j: number; color: string; period: number; stagger: number; lift: number }) {
  const k = useSharedValue(0);
  useEffect(() => {
    if (isReduceMotion()) {
      k.set(0.5);
      return;
    }
    k.set(withDelay(j * stagger, withRepeat(withSequence(withTiming(1, { duration: period / 2, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: period / 2, easing: Easing.inOut(Easing.ease) })), -1)));
  }, []);
  const st = useAnimatedStyle(() => ({ opacity: 0.3 + 0.7 * k.value, transform: [{ translateY: -lift * k.value }] }));
  return <Animated.View style={[{ width: 8, height: 8, borderRadius: 999, backgroundColor: color }, st]} />;
}

/** O12 · Coach style — tone segment; reply rewrites after 700 ms of typing dots. */
export function O12() {
  const tone = useOnboarding((s) => s.tone);
  const set = useOnboarding((s) => s.set);
  const [typing, setTyping] = useState(false);
  const [shown, setShown] = useState(tone);
  const timer = useRef<any>(null);
  const descO = useSharedValue(1);
  const replyK = useSharedValue(1);
  useEffect(() => () => clearTimeout(timer.current), []);
  const change = (i: number) => {
    set({ tone: i });
    descO.set(0);
    descO.set(withTiming(1, { duration: 250 }));
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown(i);
      setTyping(false);
      replyK.set(0);
      replyK.set(withTiming(1, { duration: 320, easing: EASE }));
    }, 700);
  };
  const descSt = useAnimatedStyle(() => ({ opacity: descO.value }));
  const replySt = useAnimatedStyle(() => ({ opacity: replyK.value, transform: [{ translateY: (1 - replyK.value) * 6 }] }));
  return (
    <OnbScreen title="How should your coach talk to you?" footer={<Continue step={12} />} gap={22}>
      <Segmented options={['Gentle', 'Balanced', 'Direct']} value={tone} onChange={change} />
      <Animated.View style={[{ marginTop: -10 }, descSt]}>
        <T size={15} color={C.secondary} center>
          {TONE[tone][0]}
        </T>
      </Animated.View>
      <View style={{ gap: 10, paddingTop: 16 }}>
        <View style={{ alignSelf: 'flex-end', maxWidth: '78%', backgroundColor: C.violet, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 20, borderBottomRightRadius: 6 }}>
          <T size={17} lh={22} color="#FFFFFF">
            I skipped my workout today.
          </T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <CoachAvatar size={30} />
          <View style={{ maxWidth: '78%', minHeight: 22, backgroundColor: C.bg, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 20, borderBottomLeftRadius: 6 }}>
            {typing ? (
              <TypingDots />
            ) : (
              <Animated.View style={replySt}>
                <T size={17} lh={22}>
                  {TONE[shown][1]}
                </T>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </OnbScreen>
  );
}

/** Risely mark on a white circle with a hairline (the AI Coach avatar). */
export function CoachAvatar({ size = 30 }: { size?: number }) {
  const mw = Math.round(size * 0.46);
  return (
    <View style={{ width: size, height: size, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: C.separator }}>
      <Image source={IMG.mark} style={{ width: mw, height: Math.round(mw * 1.08) }} contentFit="contain" />
    </View>
  );
}

/** O13 · Reminders — a notification preview drops in, then 3 switch rows. */
export function O13() {
  const reminders = useOnboarding((s) => s.reminders);
  const set = useOnboarding((s) => s.set);
  const rm = isReduceMotion();
  const k = useSharedValue(rm ? 1 : 0);
  useEffect(() => {
    if (!rm) k.set(withDelay(500, withTiming(1, { duration: 620, easing: SPRING })));
  }, []);
  const drop = useAnimatedStyle(() => ({ opacity: Math.min(1, k.value), transform: [{ translateY: (1 - k.value) * -40 }, { scale: 0.92 + 0.08 * k.value }] }));
  const sw = (key: keyof typeof reminders) => <Switch value={reminders[key]} onChange={(v) => set({ reminders: { ...reminders, [key]: v } })} />;
  return (
    <OnbScreen
      title="Stay on track"
      subtitle="A nudge at the right time, never more."
      footer={
        <>
          <PrimaryButton title="Turn on reminders" onPress={() => onb.next(13)} />
          <TextButton title="Not now" onPress={() => onb.next(13)} />
        </>
      }
    >
      <Animated.View style={[{ backgroundColor: C.bg, borderRadius: 22, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }, drop]}>
        <Image source={IMG.appIcon} style={{ width: 38, height: 38, borderRadius: 9 }} />
        <View style={{ flex: 1, gap: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T size={15} w="600">
              Risely
            </T>
            <T size={13} color={C.secondary}>
              now
            </T>
          </View>
          <T size={15} lh={20}>
            Time for Full Body Pilates. 20 minutes, mat ready?
          </T>
        </View>
      </Animated.View>
      <InsetList bg={C.bg}>
        <Row leading={<IconTile tone="lilac" icon="barbell" />} title="Workout" subtitle="7:30 AM" trailing={sw('workout')} padR={12} />
        <Row leading={<IconTile tone="food" icon="fork-knife" />} title="Log meals" subtitle="12:30 & 7:00 PM" trailing={sw('meals')} padR={12} />
        <Row leading={<IconTile tone="sky" icon="chart-line-up" />} title="Weekly check-in" subtitle="Sunday" trailing={sw('checkin')} padR={12} />
      </InsetList>
    </OnbScreen>
  );
}

/** O14 · Apple Health — optional, what is shared in plain words. */
export function O14() {
  const set = useOnboarding((s) => s.set);
  const val = (t: string) => (
    <T size={15} color={C.secondary}>
      {t}
    </T>
  );
  return (
    <OnbScreen
      gap={32}
      footer={
        <>
          <PrimaryButton
            title="Connect"
            onPress={() => {
              set({ health: true });
              onb.next(14);
            }}
          />
          <TextButton title="Not now" onPress={() => onb.next(14)} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 20 }}>
        <View style={{ width: 88, height: 88, borderRadius: 24, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="heart" size={46} color="#FF2D55" weight="fill" />
        </View>
        <View style={{ gap: 8 }}>
          <T size={30} lh={36} w="700" ls={-0.03} center>
            Connect Apple Health
          </T>
          <T size={17} lh={23} color={C.secondary} center style={{ paddingHorizontal: 12 }}>
            Steps and workouts count toward your day automatically.
          </T>
        </View>
      </View>
      <InsetList bg={C.bg}>
        <Row leading={<IconTile tone="sage" icon="sneaker-move" />} title="Steps" trailing={val('Read')} padV={13} />
        <Row leading={<IconTile tone="lilac" icon="barbell" />} title="Workouts" trailing={val('Read & write')} padV={13} />
        <Row leading={<IconTile tone="sky" icon="scales" />} title="Weight" trailing={val('Read & write')} padV={13} />
      </InsetList>
    </OnbScreen>
  );
}

const BUILD_STEPS = ['Setting your calorie target', 'Balancing your macros', 'Picking your workouts', 'Scheduling your week'];

/** O15 · Building your plan — ring fills over 3 s while 4 steps cycle, then auto-advances. */
export function O15() {
  const { top, bottom } = useScreen();
  const [q, setQ] = useState(0);
  const bump = useSharedValue(1);
  const txt = useSharedValue(1);
  const si = Math.min(3, Math.floor(q * 4));
  const lastSi = useRef(-1);
  useEffect(() => {
    let raf = 0;
    let t0 = 0;
    const f = (now: number) => {
      if (!t0) t0 = now;
      const k = Math.min(1, (now - t0) / 3000);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setQ(e);
      if (k < 1) raf = requestAnimationFrame(f);
      else bump.set(withSequence(withTiming(1.05, { duration: 200, easing: SPRING }), withTiming(1, { duration: 200, easing: SPRING })));
    };
    raf = requestAnimationFrame(f);
    const t = setTimeout(() => router.replace('/onboarding/16'), 3600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);
  useEffect(() => {
    if (si !== lastSi.current) {
      lastSi.current = si;
      txt.set(0);
      txt.set(withTiming(1, { duration: 300, easing: EASE }));
    }
  }, [si]);
  const bumpSt = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));
  const txtSt = useAnimatedStyle(() => ({ opacity: txt.value, transform: [{ translateY: (1 - txt.value) * 6 }] }));
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: top + 50, paddingBottom: bottom, paddingHorizontal: 16, justifyContent: 'center', gap: 32 }}>
      <Animated.View style={[{ alignSelf: 'center' }, bumpSt]}>
        <Ring size={200} stroke={14} value={q} track={C.bg} animate={false}>
          <T size={48} w="600" rounded>
            {Math.round(q * 100)}%
          </T>
        </Ring>
      </Animated.View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <T size={28} w="700" ls={-0.025} center>
          Building your plan
        </T>
        <Animated.View style={txtSt}>
          <T size={17} color={C.secondary} center>
            {BUILD_STEPS[si]}
          </T>
        </Animated.View>
      </View>
    </View>
  );
}

/** O16 · Plan ready — every number derived from the answers; each card edits its source. */
export function O16() {
  const { top, bottom } = useScreen();
  const d = usePlan();
  const days = useOnboarding((s) => s.days);
  const rm = isReduceMotion();
  const pop = useSharedValue(rm ? 1 : 0);
  useEffect(() => {
    onb.arrivedAt(16);
    if (!rm) pop.set(withDelay(250, withSequence(withTiming(1.08, { duration: 434, easing: EASE }), withTiming(1, { duration: 186, easing: EASE }))));
  }, []);
  const popSt = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value * 1.4), transform: [{ scale: 0.3 + 0.7 * pop.value }] }));
  const kcal = useTween(d.kcalN, { duration: 800 });
  const bar = useTween(1, { duration: 900, delay: 220, easing: easeFill });

  return (
    <View style={{ flex: 1 }}>
      <Aura />
      <ScrollView style={{ flex: 1, marginTop: top + 50 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 150 + bottom, gap: 10 }} showsVerticalScrollIndicator={false}>
        <Rise index={0} style={{ gap: 10, paddingTop: 22, paddingHorizontal: 4, paddingBottom: 14 }}>
          <Animated.View style={[{ width: 52, height: 52, borderRadius: 999, backgroundColor: C.violet, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }, popSt]}>
            <Icon name="check" size={26} color="#FFFFFF" weight="bold" />
          </Animated.View>
          <T size={34} lh={40} w="700" ls={-0.03}>
            Your plan is ready
          </T>
          <T size={17} lh={23} color={C.secondary}>
            Built from your answers. Tap any part to change it.
          </T>
        </Rise>

        <Rise index={1}>
          <PlanCard title="Goal" onPress={() => onb.edit(3)}>
            <View style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <T size={34} lh={40} w="600" rounded ls={-0.02}>
                  {d.goalBig}
                </T>
                {d.goalDate ? (
                  <T size={17} color={C.secondary}>
                    {d.goalDate}
                  </T>
                ) : null}
              </View>
              <T size={15} color={C.secondary}>
                {d.goalSub}
              </T>
            </View>
            <Svg width="100%" height={64} viewBox="0 20 329 100" preserveAspectRatio="none">
              <Path d={d.area} fill="rgba(91,59,245,0.08)" />
              <Path d={d.curve} fill="none" stroke={C.violet} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </Svg>
          </PlanCard>
        </Rise>

        <Rise index={2}>
          <PlanCard title="Daily target" onPress={() => onb.edit(4)}>
            <View style={{ gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <T size={34} lh={40} w="600" rounded ls={-0.02}>
                  {fmtInt(kcal)}
                </T>
                <T size={17} color={C.secondary}>
                  kcal a day
                </T>
              </View>
              <T size={15} color={C.secondary}>
                {d.kcalWhy}
              </T>
            </View>
            <View style={{ flexDirection: 'row', gap: 3, height: 6, borderRadius: 999, overflow: 'hidden' }}>
              <View style={{ width: `${d.proW * 100 * bar}%`, backgroundColor: C.protein, borderRadius: 999 }} />
              <View style={{ width: `${d.carbW * 100 * bar}%`, backgroundColor: C.carbs, borderRadius: 999 }} />
              <View style={{ width: `${d.fatW * 100 * bar}%`, backgroundColor: C.fat, borderRadius: 999 }} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              {(
                [
                  ['Protein', C.protein, d.proG],
                  ['Carbs', C.carbs, d.carbG],
                  ['Fat', C.fat, d.fatG],
                ] as const
              ).map(([l, c, v]) => (
                <View key={l} style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: c }} />
                    <T size={13} color={C.secondary}>
                      {l}
                    </T>
                  </View>
                  <T size={17} w="600" style={{ fontVariant: ['tabular-nums'] }}>
                    {v}
                  </T>
                </View>
              ))}
            </View>
          </PlanCard>
        </Rise>

        <Rise index={3}>
          <PlanCard title="Workouts" onPress={() => onb.edit(6)}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => {
                const on = days.includes(i);
                return (
                  <View key={i} style={{ flex: 1, height: 36, borderRadius: 12, backgroundColor: on ? C.violet : C.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <T size={15} w="600" color={on ? '#FFFFFF' : C.tertiary}>
                      {l}
                    </T>
                  </View>
                );
              })}
            </View>
            <T size={15} color={C.secondary}>
              {d.workLine}
            </T>
          </PlanCard>
        </Rise>

        <Rise index={4}>
          <T size={20} w="700" ls={-0.02} style={{ paddingTop: 18, paddingHorizontal: 4, paddingBottom: 4 }}>
            Your first week
          </T>
        </Rise>
        <Rise index={5}>
          <InsetList>
            {(
              [
                [d.dA, 'Full Body Pilates', d.wkA, 'person-simple-tai-chi'],
                [d.dB, 'Strength Basics', d.wkB, 'barbell'],
                [d.dC, 'Core & Glutes', d.wkC, 'fire'],
              ] as const
            ).map(([day, t, s, ic]) => (
              <Row
                key={t}
                leading={
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <T size={13} w="600">
                      {day}
                    </T>
                  </View>
                }
                title={t}
                subtitle={s}
                trailing={<Icon name={ic} size={20} color={C.tertiary} />}
              />
            ))}
          </InsetList>
        </Rise>

        <Rise index={6} style={{ marginTop: 10 }}>
          <Press big onPress={() => onb.edit(12)} style={{ backgroundColor: '#FFFFFF', borderRadius: 22, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <CoachAvatar size={40} />
            <View style={{ flex: 1, gap: 1 }}>
              <T size={17}>Your coach</T>
              <T size={15} color={C.secondary}>
                {d.toneLine}
              </T>
            </View>
            <Chevron />
          </Press>
        </Rise>
        <Rise index={7}>
          <T size={13} lh={18} color={C.secondary} style={{ paddingTop: 12, paddingHorizontal: 4 }}>
            Targets are estimates and adjust as you log meals and workouts. Not medical advice.
          </T>
        </Rise>
      </ScrollView>
      <LinearGradient
        colors={['rgba(242,242,247,0)', '#F2F2F7', '#F2F2F7']}
        locations={[0, 0.32, 1]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 36, paddingHorizontal: 16, paddingBottom: bottom, gap: 4 }}
      >
        <PrimaryButton title="Start my plan" onPress={() => onb.go(17)} />
        <TextButton title="Adjust answers" onPress={() => onb.restart()} />
      </LinearGradient>
    </View>
  );
}

function PlanCard({ title, onPress, children }: { title: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Press big onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}, edit`} style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T size={15} w="600" color={C.secondary}>
          {title}
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <T size={15} color={C.violet}>
            Edit
          </T>
          <Icon name="caret-right" size={12} color={C.violet} weight="bold" />
        </View>
      </View>
      {children}
    </Press>
  );
}

/** O17 · Save your plan — account last, after value is shown. */
export function O17() {
  return (
    <OnbScreen
      gap={24}
      footer={
        <View style={{ gap: 10 }}>
          <PrimaryButton title="Continue with Apple" icon="apple-logo" onPress={() => onb.finish()} />
          <PrimaryButton title="Continue with Google" icon="google-logo" variant="gray" onPress={() => onb.finish()} />
          <TextButton title="Use email instead" onPress={() => onb.finish()} />
        </View>
      }
    >
      <View style={{ alignItems: 'center', gap: 12 }}>
        <T size={30} lh={36} w="700" ls={-0.03} center>
          Save your plan
        </T>
        <T size={17} lh={23} color={C.secondary} center style={{ paddingHorizontal: 16 }}>
          Create an account so your progress is never lost.
        </T>
      </View>
    </OnbScreen>
  );
}
