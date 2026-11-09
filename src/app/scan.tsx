import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { C, IMG } from '../theme/tokens';
import { SPRING, isReduceMotion } from '../theme/motion';
import { T } from '../theme/type';
import { Glass } from '../components/Glass';
import { Icon } from '../components/Icon';
import { Press } from '../components/Press';
import { PrimaryButton } from '../components/Button';
import { InsetList, Row, Chevron } from '../components/List';
import { CountUp, GlassButton } from '../components/Bits';
import { useScreen, useLightStatusBar } from '../components/Frame';
import { tapImpact } from '../components/anim';
import { TERIYAKI, useNutrition } from '../store/nutrition';
import { comingSoon } from '../components/ComingSoon';
import { TERIYAKI_INGREDIENTS } from '../data/foods';

type Phase = 'camera' | 'analyzing' | 'result';

/** N3 → N4 → N5. Phases swap with a 340 ms fade like the prototype. */
export default function Scan() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [phase, setPhase] = useState<Phase>('camera');
  useLightStatusBar(true);
  useEffect(() => {
    if (phase !== 'analyzing') return;
    const t = setTimeout(() => setPhase('result'), 2900);
    return () => clearTimeout(t);
  }, [phase]);
  const fade = FadeIn.duration(340);
  return (
    <View style={{ flex: 1, backgroundColor: phase === 'camera' ? '#000' : C.bg }}>
      {phase === 'camera' && (
        <Animated.View key="cam" entering={fade} exiting={FadeOut.duration(200)} style={{ flex: 1 }}>
          <Camera initialMode={Number(mode ?? 0)} onShoot={() => setPhase('analyzing')} />
        </Animated.View>
      )}
      {phase === 'analyzing' && (
        <Animated.View key="an" entering={fade} style={{ flex: 1 }}>
          <Analyzing />
        </Animated.View>
      )}
      {phase === 'result' && (
        <Animated.View key="res" entering={fade} style={{ flex: 1 }}>
          <Result onRetake={() => setPhase('camera')} />
        </Animated.View>
      )}
    </View>
  );
}

function DarkGlass({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <Glass dark shadow="none" style={style}>
      {children}
    </Glass>
  );
}

/** N3 · Scan a meal — camera with framing guide. Modes: meal, barcode, nutrition label. */
function Camera({ initialMode, onShoot }: { initialMode: number; onShoot: () => void }) {
  const { top, bottom } = useScreen();
  const [mode, setMode] = useState(initialMode);
  const [flash, setFlash] = useState(false);
  const corner = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
    const t = pos[0] === 't';
    const l = pos[1] === 'l';
    return (
      <View
        style={{
          position: 'absolute',
          [t ? 'top' : 'bottom']: 0,
          [l ? 'left' : 'right']: 0,
          width: 56,
          height: 56,
          borderColor: '#FFFFFF',
          [t ? 'borderTopWidth' : 'borderBottomWidth']: 4,
          [l ? 'borderLeftWidth' : 'borderRightWidth']: 4,
          [`border${t ? 'Top' : 'Bottom'}${l ? 'Left' : 'Right'}Radius`]: 28,
        }}
      />
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <Image source={IMG.mealBowl} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.18)' }} />
      <View style={{ paddingTop: top, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <GlassButton dark icon="x" weight="bold" iconSize={18} label="Close" onPress={() => router.back()} />
        <GlassButton dark icon="lightning" weight={flash ? 'fill' : 'regular'} label="Flash" onPress={() => setFlash((f) => !f)} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <View style={{ width: 280, height: mode === 1 ? 180 : 280 }}>
          {corner('tl')}
          {corner('tr')}
          {corner('bl')}
          {corner('br')}
        </View>
        <DarkGlass style={{ height: 34, paddingHorizontal: 14, justifyContent: 'center' }}>
          <T size={15} color="#FFFFFF">
            Fit your whole plate in the frame
          </T>
        </DarkGlass>
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: bottom + 14, alignItems: 'center', gap: 22 }}>
        <DarkGlass style={{ padding: 3, flexDirection: 'row' }}>
          {['Meal', 'Barcode', 'Label'].map((m, i) => (
            <Press key={m} plain onPress={() => setMode(i)} accessibilityRole="tab" accessibilityState={{ selected: i === mode }} style={{ height: 32, paddingHorizontal: 16, borderRadius: 999, backgroundColor: i === mode ? '#FFFFFF' : 'transparent', justifyContent: 'center' }}>
              <T size={15} w="600" color={i === mode ? C.ink : '#FFFFFF'}>
                {m}
              </T>
            </Press>
          ))}
        </DarkGlass>
        <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }}>
          <Image source={IMG.mealSalmon} style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: '#FFFFFF' }} contentFit="cover" contentPosition={{ left: '60%', top: '50%' }} />
          <Press
            onPress={() => {
              tapImpact();
              onShoot();
            }}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            style={{ width: 78, height: 78, borderRadius: 999, borderWidth: 4, borderColor: '#FFFFFF', padding: 4 }}
          >
            <View style={{ flex: 1, borderRadius: 999, backgroundColor: '#FFFFFF' }} />
          </Press>
          <GlassButton dark icon="camera-rotate" label="Flip camera" onPress={comingSoon} />
        </View>
      </View>
    </View>
  );
}

const STEPS = ['Finding the foods', 'Estimating portions', 'Calculating macros'];

/** N4 · Analyzing — scan line sweeps; steps tick as the estimate builds; auto-advances (~2.9 s). */
function Analyzing() {
  const { top, bottom } = useScreen();
  const [cur, setCur] = useState(1); // index of the step in progress (0 is done on entry)
  useEffect(() => {
    const a = setTimeout(() => setCur(2), 1200);
    const b = setTimeout(() => setCur(3), 2300);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);
  const y = useSharedValue(-150);
  useEffect(() => {
    if (!isReduceMotion()) y.set(withRepeat(withTiming(110, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, []);
  const line = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: 430, overflow: 'hidden' }}>
        <Image source={IMG.mealBowl} style={{ width: '100%', height: 430 }} contentFit="cover" contentPosition={{ left: '50%', top: '45%' }} />
        <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 250 }, line]}>
          <View style={{ height: 2, backgroundColor: C.violet, boxShadow: '0 0 24px 6px rgba(91,59,245,0.45)' } as any} />
          <LinearGradient colors={['rgba(91,59,245,0.16)', 'rgba(91,59,245,0)']} style={{ height: 120 }} />
        </Animated.View>
        <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }} />
        <GlassButton icon="x" weight="bold" iconSize={18} label="Close" onPress={() => router.back()} style={{ position: 'absolute', top, left: 16 }} />
      </View>
      <View style={{ flex: 1, marginTop: -28, backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 28, paddingHorizontal: 24, paddingBottom: bottom, gap: 22 }}>
        <T size={28} lh={34} w="700" ls={-0.02} accessibilityRole="header">
          Analyzing your meal
        </T>
        <View style={{ gap: 16 }} accessibilityLiveRegion="polite">
          {STEPS.map((s, i) => (
            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {i < cur ? <DoneDot /> : i === cur ? <Spinner /> : <View style={{ width: 22, height: 22, borderRadius: 999, borderWidth: 1.5, borderColor: '#D1D1D6' }} />}
              <T size={17} w={i === cur ? '600' : '400'} color={i <= cur ? C.ink : C.tertiary}>
                {s}
              </T>
            </View>
          ))}
        </View>
        <View style={{ gap: 10, paddingTop: 6 }}>
          {['70%', '90%', '55%'].map((w) => (
            <View key={w} style={{ height: 14, width: w as any, borderRadius: 7, backgroundColor: C.fill }} />
          ))}
        </View>
      </View>
    </View>
  );
}

function DoneDot() {
  const s = useSharedValue(0.4);
  useEffect(() => {
    s.set(withTiming(1, { duration: 300, easing: SPRING }));
  }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={[{ width: 22, height: 22, borderRadius: 999, backgroundColor: C.violet, alignItems: 'center', justifyContent: 'center' }, st]}>
      <Icon name="check" size={12} color="#FFFFFF" weight="bold" />
    </Animated.View>
  );
}

function Spinner() {
  const r = useSharedValue(0);
  useEffect(() => {
    r.set(withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1));
  }, []);
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return <Animated.View style={[{ width: 22, height: 22, borderRadius: 999, borderWidth: 2.5, borderColor: C.fill, borderTopColor: C.violet }, st]} />;
}

/** N5 · Scan result — editable estimate. The photo fades into the background (mask, not overlay). */
function Result({ onRetake }: { onRetake: () => void }) {
  const { top, bottom } = useScreen();
  const addFood = useNutrition((s) => s.addFood);
  const finish = () => {
    addFood(TERIYAKI);
    router.dismissAll();
    router.navigate('/nutrition');
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ height: 290, overflow: 'hidden' }}>
        <Image source={IMG.mealBowl} style={{ width: '100%', height: 290 }} contentFit="cover" contentPosition={{ left: '50%', top: '45%' }} />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(242,242,247,0)', 'rgba(242,242,247,0)', 'rgba(242,242,247,0.4)', '#F2F2F7']}
          locations={[0, 0.45, 0.7, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }} />
        <View style={{ position: 'absolute', top, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <GlassButton
            icon="x"
            weight="bold"
            iconSize={18}
            label="Close"
            onPress={() => {
              router.dismissAll();
              router.navigate('/nutrition');
            }}
          />
          <Press onPress={onRetake} accessibilityRole="button" style={{ height: 34, paddingHorizontal: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.7)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="camera" size={16} />
            <T size={15} w="600">
              Retake
            </T>
          </Press>
        </View>
      </View>
      <View style={{ flex: 1, marginTop: -34, paddingHorizontal: 16, paddingBottom: bottom }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 2, paddingHorizontal: 4, paddingBottom: 14 }}>
            <T size={28} lh={34} w="700" ls={-0.02} accessibilityRole="header">
              Teriyaki chicken bowl
            </T>
            <T size={15} color={C.secondary}>
              Estimated from photo · Dinner
            </T>
          </View>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, paddingVertical: 14, flexDirection: 'row' }}>
            {(
              [
                [TERIYAKI.kcal, '', 'kcal'],
                [TERIYAKI.p, 'g', 'Protein'],
                [TERIYAKI.c, 'g', 'Carbs'],
                [TERIYAKI.f, 'g', 'Fat'],
              ] as const
            ).map(([v, suf, l], i) => (
              <View key={l} style={{ flex: 1, alignItems: 'center', gap: 2, borderLeftWidth: i ? 0.5 : 0, borderLeftColor: C.separator }}>
                <CountUp value={v} suffix={suf} size={20} />
                <T size={12} w="500" color={C.secondary}>
                  {l}
                </T>
              </View>
            ))}
          </View>
          <T size={15} w="600" style={{ paddingTop: 22, paddingHorizontal: 4, paddingBottom: 10 }}>
            Ingredients
          </T>
          <InsetList>
            {TERIYAKI_INGREDIENTS.map(([n, a]) => (
              <Row
                key={n}
                onPress={comingSoon}
                title={n}
                leadPad={16}
                padV={11}
                trailing={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <T size={15} color={C.secondary}>
                      {a}
                    </T>
                    <Chevron />
                  </View>
                }
              />
            ))}
          </InsetList>
        </ScrollView>
        <PrimaryButton title="Add to dinner" onPress={finish} />
      </View>
    </View>
  );
}

export const _s = withSequence;
