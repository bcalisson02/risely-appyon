import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { C, IMG } from '../theme/tokens';
import { EASE, SPRING } from '../theme/motion';
import { T } from '../theme/type';
import { Glass } from '../components/Glass';
import { Icon, IconName } from '../components/Icon';
import { Press } from '../components/Press';
import { Ring } from '../components/Ring';
import { Aura } from '../components/Aura';
import { PrimaryButton, TextButton } from '../components/Button';
import { CountUp, GlassButton, PopIn } from '../components/Bits';
import { useScreen, useLightStatusBar } from '../components/Frame';
import { tick, success } from '../components/anim';
import { comingSoon } from '../components/ComingSoon';
import { useWorkouts } from '../store/workouts';
import { closeTo, goBack } from '../nav/back';

type Phase = 'work' | 'rest' | 'done';
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** W5 Session ↔ W6 Rest → W7 Complete. Timers count down each second, with pause/resume. */
export default function Session() {
  const [phase, setPhase] = useState<Phase>('work');
  useLightStatusBar(phase !== 'done');
  return (
    <View style={{ flex: 1, backgroundColor: phase === 'done' ? C.bg : C.ink }}>
      {phase === 'work' && (
        <Animated.View key="w" entering={FadeIn.duration(340)} style={{ flex: 1 }}>
          <Work onNext={() => setPhase('rest')} />
        </Animated.View>
      )}
      {phase === 'rest' && (
        <Animated.View key="r" entering={FadeIn.duration(340)} style={{ flex: 1 }}>
          <Rest onDone={() => setPhase('done')} />
        </Animated.View>
      )}
      {phase === 'done' && (
        <Animated.View key="d" entering={FadeIn.duration(340)} style={{ flex: 1 }}>
          <Complete />
        </Animated.View>
      )}
    </View>
  );
}

/** Countdown hook: decrements every second unless paused. */
function useCountdown(start: number, paused: boolean, onEnd?: () => void) {
  const [sec, setSec] = useState(start);
  const end = useRef(onEnd);
  useEffect(() => {
    end.current = onEnd;
  });
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          if (s === 1) setTimeout(() => end.current?.(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [paused]);
  return [sec, setSec] as const;
}

function usePulse(sec: number) {
  const s = useSharedValue(1);
  useEffect(() => {
    if (sec <= 3 && sec > 0) s.set(withSequence(withTiming(1.06, { duration: 0 }), withTiming(1, { duration: 300 })));
  }, [s, sec]);
  return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}

function Ctrl({ icon, onPress, label }: { icon: IconName; onPress: () => void; label: string }) {
  return (
    <Press onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ width: 56, height: 56, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} color="#FFFFFF" weight="fill" />
    </Press>
  );
}

/** W5 · Session — dark for focus. Big timer, next move, three controls. */
function Work({ onNext }: { onNext: () => void }) {
  const { top, bottom, width, height } = useScreen();
  // 440pt on an 852pt phone; shorter phones keep room for the timer and controls
  const PH = Math.min(440, Math.round(height * 0.52));
  const [paused, setPaused] = useState(false);
  const TOTAL = 90; // 0:42 left of a 1:30 block (prototype: sec + 48)
  const [sec, setSec] = useCountdown(42, paused, onNext);
  const pulse = usePulse(sec);
  const icon = useSharedValue(1);
  const iconSt = useAnimatedStyle(() => ({ transform: [{ scale: icon.value }] }));
  const progress = 1 - sec / TOTAL;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: PH, overflow: 'hidden', backgroundColor: C.ink }}>
        <Image source={IMG.woSession} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" contentPosition={{ left: '50%', top: '40%' }} />
        <LinearGradient
          colors={['rgba(10,10,15,0.55)', 'rgba(10,10,15,0)', 'rgba(10,10,15,0)', 'rgba(10,10,15,0.55)', '#0A0A0F']}
          locations={[0, 0.26, 0.48, 0.72, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <Svg width="100%" height={PH} style={{ position: 'absolute', top: 0, left: 0 }} viewBox={`0 0 ${width} ${PH}`} preserveAspectRatio="none">
          <Defs>
            <RadialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor="rgb(91,59,245)" stopOpacity={0.22} />
              <Stop offset="0.7" stopColor="rgb(91,59,245)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={width / 2} cy={PH} rx={width * 0.9} ry={PH * 0.6} fill="url(#glow)" />
        </Svg>
        <View style={{ position: 'absolute', top, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <GlassButton dark icon="x" weight="bold" iconSize={18} label="End workout" onPress={() => goBack('/workout/fullbody')} />
          <Glass dark shadow="none" style={{ height: 32, paddingHorizontal: 12, justifyContent: 'center' }}>
            <T size={15} w="600" color="#FFFFFF">
              3 of 8
            </T>
          </Glass>
          <GlassButton dark icon="speaker-high" label="Sound" onPress={comingSoon} />
        </View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: bottom + 10, gap: 22 }}>
        <View style={{ flexDirection: 'row', gap: 4 }} accessibilityLabel="Exercise 3 of 8">
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${i < 2 ? 100 : i === 2 ? progress * 100 : 0}%`, backgroundColor: '#FFFFFF', borderRadius: 999 }} />
            </View>
          ))}
        </View>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Animated.View style={pulse}>
            <T size={84} lh={84} w="600" rounded color="#FFFFFF" accessibilityLiveRegion="polite">
              {fmt(sec)}
            </T>
          </Animated.View>
          <T size={22} w="600" color="#FFFFFF">
            Glute bridge
          </T>
          <T size={15} color="#A1A1A6">
            Next: Side plank
          </T>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <Ctrl icon="skip-back" label="Restart exercise" onPress={() => setSec(42)} />
          <Press
            onPress={() => {
              tick();
              icon.set(withSequence(withTiming(0.6, { duration: 0 }), withTiming(1, { duration: 350, easing: SPRING })));
              setPaused((p) => !p);
            }}
            accessibilityRole="button"
            accessibilityLabel={paused ? 'Resume' : 'Pause'}
            style={{ width: 80, height: 80, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}
          >
            <Animated.View style={iconSt}>
              <Icon name={paused ? 'play' : 'pause'} size={32} weight="fill" />
            </Animated.View>
          </Press>
          <Ctrl icon="skip-forward" label="Next" onPress={onNext} />
        </View>
      </View>
    </View>
  );
}

/** W6 · Rest — 15 s countdown ring, "+15 s", "Skip rest", up-next preview. */
function Rest({ onDone }: { onDone: () => void }) {
  const { top, bottom } = useScreen();
  const [total, setTotal] = useState(15);
  const [sec, setSec] = useCountdown(15, false, onDone);
  const pulse = usePulse(sec);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: top, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <GlassButton dark icon="x" weight="bold" iconSize={18} label="End workout" onPress={() => goBack('/workout/fullbody')} />
        <T size={15} color="#A1A1A6">
          3 of 8 done
        </T>
        <View style={{ width: 44 }} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, paddingHorizontal: 20 }}>
        <Ring size={220} stroke={10} value={sec / total} track="rgba(255,255,255,0.14)" color="#FFFFFF" duration={1000} delay={0} easing="linear" fillOnMount={false}>
          <Animated.View style={[{ alignItems: 'center' }, pulse]}>
            <T size={64} lh={64} w="600" rounded color="#FFFFFF" accessibilityLiveRegion="polite">
              {fmt(sec)}
            </T>
          </Animated.View>
          <T size={17} color="#A1A1A6" style={{ marginTop: 6 }}>
            Rest
          </T>
        </Ring>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Press
            onPress={() => {
              tick();
              setSec((s) => {
                const n = s + 15;
                setTotal((t) => Math.max(t, n));
                return n;
              });
            }}
            accessibilityRole="button"
            style={{ height: 40, paddingHorizontal: 18, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center' }}
          >
            <T size={15} w="600" color="#FFFFFF">
              +15 s
            </T>
          </Press>
          <Press onPress={onDone} accessibilityRole="button" style={{ height: 40, paddingHorizontal: 18, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', justifyContent: 'center' }}>
            <T size={15} w="600" color="#FFFFFF">
              Skip rest
            </T>
          </Press>
        </View>
      </View>
      <View style={{ marginHorizontal: 16, marginBottom: bottom + 10, backgroundColor: '#1C1C22', borderRadius: 22, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image source={IMG.thWallsculpt} style={{ width: 56, height: 56, borderRadius: 14 }} contentFit="cover" />
        <View style={{ flex: 1, gap: 2 }}>
          <T size={13} color="#A1A1A6">
            Up next
          </T>
          <T size={17} w="600" color="#FFFFFF">
            Side plank
          </T>
          <T size={15} color="#A1A1A6">
            1:30 · 45 s each side
          </T>
        </View>
      </View>
    </View>
  );
}

const FEEL = ['Too easy', 'Just right', 'Too hard'];

/** W7 · Complete — celebrate, show stats, ask how it felt. */
function Complete() {
  const { top, bottom, height } = useScreen();
  const feel = useWorkouts((s) => s.feel);
  const setFeel = useWorkouts((s) => s.setFeel);
  useEffect(() => success(), []);
  return (
    <View style={{ flex: 1 }}>
      <Aura />
      <View style={{ flex: 1, paddingTop: top, paddingHorizontal: 16, paddingBottom: bottom }}>
        <View style={{ alignItems: 'center', gap: 18, paddingTop: height >= 800 ? 72 : 24 }}>
          <PopIn delay={200}>
            <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: C.violet, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={34} color="#FFFFFF" weight="bold" />
            </View>
          </PopIn>
          <T size={30} lh={36} w="700" ls={-0.025} center accessibilityRole="header">
            <T size={30} lh={36} w="700" ls={-0.025} color={C.gray2}>
              Nice work, Sofia.
            </T>
            {'\n'}Day 9 is done.
          </T>
          <View style={{ height: 34, paddingLeft: 12, paddingRight: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 0.5, borderColor: 'rgba(60,60,67,0.10)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="flame" size={16} color={C.fat} weight="fill" />
            <T size={15} w="500">
              13-day streak
            </T>
          </View>
        </View>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, paddingVertical: 16, marginTop: 22, flexDirection: 'row' }}>
          {(
            [
              ['20:14', 'Time'],
              [142, 'kcal'],
              [8, 'Exercises'],
            ] as const
          ).map(([v, l], i) => (
            <View key={l} style={{ flex: 1, alignItems: 'center', gap: 2, borderLeftWidth: i ? 0.5 : 0, borderLeftColor: C.separator }}>
              {typeof v === 'number' ? (
                <CountUp value={v} size={22} />
              ) : (
                <T size={22} w="600" rounded>
                  {v}
                </T>
              )}
              <T size={13} color={C.secondary}>
                {l}
              </T>
            </View>
          ))}
        </View>
        <T size={15} w="600" style={{ paddingTop: 22, paddingHorizontal: 4, paddingBottom: 10 }}>
          How did it feel?
        </T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {FEEL.map((f, i) => {
            const on = feel === i;
            return (
              <Press
                key={f}
                onPress={() => {
                  tick();
                  setFeel(i);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                style={{ flex: 1, height: 48, borderRadius: 16, backgroundColor: on ? C.violetTint : '#FFFFFF', borderWidth: 1.5, borderColor: on ? C.violet : 'transparent', alignItems: 'center', justifyContent: 'center' }}
              >
                <T size={15} w={on ? '600' : '400'} color={on ? C.violetDark : C.ink}>
                  {f}
                </T>
              </Press>
            );
          })}
        </View>
        <T size={13} lh={18} color={C.secondary} style={{ paddingTop: 8, paddingHorizontal: 16 }}>
          {"We'll use this to adjust Day 10."}
        </T>
        <View style={{ flex: 1 }} />
        <PrimaryButton
          title="Done"
          onPress={() => {
            closeTo('/workouts');
          }}
        />
        <TextButton title="Share" onPress={comingSoon} />
      </View>
    </View>
  );
}

export const _e = EASE;
