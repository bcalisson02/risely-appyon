import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { C, IMG } from '../theme/tokens';
import { EASE, SPRING, isReduceMotion } from '../theme/motion';
import { T, TwoTone, fontFor } from '../theme/type';
import { Aura } from '../components/Aura';
import { Icon, IconName } from '../components/Icon';
import { Press } from '../components/Press';
import { GlassButton } from '../components/Bits';
import { useScreen } from '../components/Frame';
import { tick, success } from '../components/anim';
import { CoachAvatar, TypingDots } from '../onboarding/steps/StepsB';
import { Msg, SUGGESTIONS, useCoach, useCoachCtx } from '../store/coach';
import { useNutrition } from '../store/nutrition';
import { comingSoon } from '../components/ComingSoon';
import { useWorkouts } from '../store/workouts';
import { goBack } from '../nav/back';

const SALMON = { id: 'coach-salmon', name: 'Glazed salmon, sweet potato & broccoli', kcal: 560, p: 40, c: 52, f: 16 };

/** C1–C5 · AI Coach — full-screen modal, no tab bar. */
export default function Coach() {
  const { top, bottom } = useScreen();
  const { start } = useLocalSearchParams<{ start?: string }>();
  const ctx = useCoachCtx();
  const { messages, status, online, quick, send, stop } = useCoach();
  const [draft, setDraft] = useState('');
  const scroll = useRef<any>(null);
  const empty = messages.length === 0;
  const thinking = status === 'thinking';

  // opened from Today's "Dinner ideas": ask the dinner question once, with the values of that moment
  const boot = useRef({ start, ctx, send });
  useEffect(() => {
    const b = boot.current;
    if (b.start !== 'dinner' || useCoach.getState().messages.length) return;
    const t = setTimeout(() => b.send('What should I eat for dinner?', b.ctx), 350);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
  }, [messages.length, thinking]);

  const submit = (t: string) => {
    if (!t.trim()) return;
    tick();
    send(t, ctx);
    setDraft('');
  };

  return (
    <View style={{ flex: 1 }}>
      <Aura />
      <KeyboardAvoidingView behavior={Platform.OS === 'web' ? undefined : 'padding'} style={{ flex: 1, paddingTop: top, paddingHorizontal: 16, paddingBottom: bottom }}>
        {/* header: back, "Coach" with the 28pt mark, menu */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 6, paddingBottom: 8, zIndex: 5 }}>
          <GlassButton icon="caret-left" weight="bold" iconSize={18} label="Back" onPress={() => goBack('/')} />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CoachAvatar size={28} />
            <T size={17} w="600" accessibilityRole="header">
              Coach
            </T>
          </View>
          <GlassButton icon={empty ? 'clock-counter-clockwise' : 'dots-three'} label={empty ? 'History' : 'More'} onPress={comingSoon} />
        </View>

        {!online ? (
          <Animated.View entering={FadeIn.duration(300)} style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, height: 32, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#FFFFFF', marginTop: 4 }} accessibilityLiveRegion="polite">
            <Icon name="wifi-slash" size={16} color={C.secondary} />
            <T size={15} w="500">
              {"You're offline"}
            </T>
          </Animated.View>
        ) : null}

        {empty ? (
          <EmptyState onPick={submit} />
        ) : (
          <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', gap: 8, paddingTop: 8, paddingBottom: 14 }} showsVerticalScrollIndicator={false}>
            {messages.map((m) => (
              <Message key={m.id} m={m} />
            ))}
            {thinking ? (
              <Enter mine={false}>
                <View style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderBottomLeftRadius: 6 }} accessibilityLabel="Coach is typing">
                  <TypingDots period={1000} stagger={160} lift={4} />
                </View>
              </Enter>
            ) : null}
          </ScrollView>
        )}

        {/* quick replies (hidden while thinking) */}
        {!empty && !thinking && online && quick.length ? (
          <Animated.View entering={FadeIn.duration(260)} exiting={FadeOut.duration(150)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 10 }}>
              {quick.map((q) => (
                <Press key={q} onPress={() => submit(q)} accessibilityRole="button" style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: 'rgba(60,60,67,0.25)', justifyContent: 'center' }}>
                  <T size={15}>{q}</T>
                </Press>
              ))}
            </ScrollView>
          </Animated.View>
        ) : null}

        <Composer
          value={draft}
          onChange={setDraft}
          placeholder={!online ? 'Waiting for connection…' : empty ? 'Ask anything' : 'Message'}
          disabled={!online}
          thinking={thinking}
          onSend={() => submit(draft)}
          onStop={stop}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

/** C1 · Empty state — 104pt halo with the 72pt mark, two-tone greeting, 2×2 suggestions. */
function EmptyState({ onPick }: { onPick: (t: string) => void }) {
  return (
    <>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <View style={{ width: 104, height: 104, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(60,40,140,0.12)' } as any}>
            <Image source={IMG.mark} style={{ width: 33, height: 36 }} contentFit="contain" />
          </View>
        </View>
        <TwoTone gray="Hi Sofia," ink="how can I help today?" size={30} lh={35} ls={-0.025} breakLine center />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 10 }}>
        {SUGGESTIONS.map((s) => (
          <Press
            key={s.text}
            big
            onPress={() => onPick(s.text)}
            accessibilityRole="button"
            style={{ flexBasis: '40%', flexGrow: 1, minHeight: 84, padding: 12, borderRadius: 18, backgroundColor: '#FFFFFF', gap: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } as any}
          >
            <Icon name={s.icon as IconName} size={18} color={C.secondary} />
            <T size={15} lh={19}>
              {s.text}
            </T>
          </Press>
        ))}
      </View>
    </>
  );
}

/** Each new message enters with opacity, translateY 14 → 0 and scale 0.96 → 1 (420 ms spring) from its corner. */
function Enter({ mine, children }: { mine: boolean; children: React.ReactNode }) {
  const rm = isReduceMotion();
  const k = useSharedValue(rm ? 1 : 0);
  useEffect(() => {
    if (!rm) k.set(withDelay(40, withTiming(1, { duration: 420, easing: SPRING })));
  }, [k, rm]);
  const st = useAnimatedStyle(() => ({
    opacity: Math.min(1, k.value),
    transform: [{ translateY: (1 - k.value) * 14 }, { scale: 0.96 + 0.04 * k.value }],
  }));
  return <Animated.View style={[{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '100%', transformOrigin: mine ? 'right bottom' : 'left bottom' } as any, st]}>{children}</Animated.View>;
}

function Bubble({ mine, text, faded }: { mine: boolean; text: string; faded?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: mine ? C.violet : '#FFFFFF',
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 20,
        [mine ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 6,
        opacity: faded ? 0.5 : 1,
      }}
    >
      <T size={17} lh={22} color={mine ? '#FFFFFF' : C.ink}>
        {text}
      </T>
    </View>
  );
}

function Message({ m }: { m: Msg }) {
  const ctx = useCoachCtx();
  if (m.role === 'time')
    return (
      <T size={12} color={C.gray2} center style={{ paddingVertical: 4 }}>
        {m.text}
      </T>
    );
  if (m.role === 'user') {
    if (m.failed)
      return (
        <Enter mine>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="warning-circle" size={22} color={C.error} weight="fill" />
              <View style={{ maxWidth: 250 }}>
                <Bubble mine text={m.text} faded />
              </View>
            </View>
            <Press onPress={() => useCoach.getState().retry(m.id, ctx)} accessibilityRole="button" accessibilityLabel="Not delivered. Tap to retry" hitSlop={8}>
              <T size={13} color={C.error} style={{ paddingRight: 4 }}>
                Not delivered.{' '}
                <T size={13} w="600" color={C.error}>
                  Tap to retry
                </T>
              </T>
            </Press>
          </View>
        </Enter>
      );
    return (
      <Enter mine>
        <View style={{ maxWidth: 290 }}>
          <Bubble mine text={m.text} />
        </View>
      </Enter>
    );
  }
  if (m.kind === 'text')
    return (
      <Enter mine={false}>
        <View style={{ maxWidth: 300 }}>
          <Bubble mine={false} text={m.text} />
        </View>
      </Enter>
    );
  if (m.kind === 'meal') return <MealCard id={m.id} logged={!!m.logged} />;
  return <SwapCard id={m.id} state={m.state} />;
}

/** Rich meal card with a violet-tint "Log" capsule that toggles to "Logged". */
function MealCard({ id, logged }: { id: string; logged: boolean }) {
  const addFood = useNutrition((s) => s.addFood);
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const prev = useRef(logged);
  useEffect(() => {
    if (logged && !prev.current) {
      addFood(SALMON, { toast: false });
      success();
      s.set(0.9);
      s.set(withTiming(1, { duration: 400, easing: SPRING }));
    }
    prev.current = logged;
  }, [addFood, logged, s]);
  return (
    <Enter mine={false}>
      <View style={{ width: 290, backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden' }}>
        <Image source={IMG.mealSalmon} style={{ width: '100%', height: 120 }} contentFit="cover" contentPosition={{ left: '50%', top: '55%' }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12 }}>
          <View style={{ flex: 1 }}>
            <T size={15} w="600">
              Glazed salmon, sweet potato & broccoli
            </T>
            <T size={13} color={C.secondary}>
              560 kcal · 40 g protein
            </T>
          </View>
          <Press disabled={logged} onPress={() => useCoach.getState().logMeal(id)} accessibilityRole="button" accessibilityState={{ disabled: logged }}>
            <Animated.View style={[{ height: 32, paddingHorizontal: 14, borderRadius: 999, backgroundColor: logged ? C.violet : C.violetTint, flexDirection: 'row', alignItems: 'center', gap: 5 }, st]}>
              {logged ? <Icon name="check" size={14} color="#FFFFFF" weight="bold" /> : null}
              <T size={15} w="600" color={logged ? '#FFFFFF' : C.violetDark}>
                {logged ? 'Logged' : 'Log'}
              </T>
            </Animated.View>
          </Press>
        </View>
      </View>
    </Enter>
  );
}

/** C4 · Action reply — the coach proposes a plan change; one tap applies it. */
function SwapCard({ id, state }: { id: string; state: 'open' | 'swapped' | 'kept' }) {
  const swapFriday = useWorkouts((s) => s.swapFriday);
  return (
    <Enter mine={false}>
      <View style={{ width: 300, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image source={IMG.thCorebasics} style={{ width: 56, height: 56, borderRadius: 14 }} contentFit="cover" />
          <View style={{ flex: 1, gap: 1 }}>
            <T size={13} color={C.secondary}>
              Friday · replaces Full Body Pilates
            </T>
            <T size={17} w="600">
              Express Pilates
            </T>
            <T size={15} color={C.secondary}>
              10 min · 5 exercises · Mat
            </T>
          </View>
        </View>
        {state === 'swapped' ? (
          <Animated.View entering={FadeIn.duration(400)} style={{ height: 40, borderRadius: 999, backgroundColor: '#E8F8EC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }} accessibilityLiveRegion="polite">
            <Icon name="check-circle" size={18} color={C.success} weight="fill" />
            <T size={15} w="600" color="#1E7B36">
              Friday updated
            </T>
          </Animated.View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8, opacity: state === 'kept' ? 0.5 : 1 }}>
            <Press
              disabled={state !== 'open'}
              onPress={() => {
                success();
                swapFriday();
                useCoach.getState().swap(id);
              }}
              accessibilityRole="button"
              style={{ flex: 1, height: 40, borderRadius: 999, backgroundColor: C.violet, alignItems: 'center', justifyContent: 'center' }}
            >
              <T size={15} w="600" color="#FFFFFF">
                Swap it
              </T>
            </Press>
            <Press
              disabled={state !== 'open'}
              onPress={() => useCoach.getState().swap(id, true)}
              accessibilityRole="button"
              style={{ flex: 1, height: 40, borderRadius: 999, backgroundColor: C.fill, alignItems: 'center', justifyContent: 'center' }}
            >
              <T size={15} w="600">
                Keep original
              </T>
            </Press>
          </View>
        )}
      </View>
    </Enter>
  );
}

/** Composer: "Ask anything" / "Message", mic, send. While thinking, send becomes a black stop button. */
function Composer({
  value,
  onChange,
  placeholder,
  disabled,
  thinking,
  onSend,
  onStop,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
  thinking: boolean;
  onSend: () => void;
  onStop: () => void;
}) {
  const can = !!value.trim() && !disabled && !thinking;
  return (
    <View
      style={
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          paddingTop: 10,
          paddingRight: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          borderWidth: 0.5,
          borderColor: 'rgba(60,60,67,0.16)',
        } as any
      }
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={C.tertiary}
        selectionColor={C.violet}
        multiline
        numberOfLines={1}
        onSubmitEditing={onSend}
        blurOnSubmit
        returnKeyType="send"
        onKeyPress={(e: any) => {
          if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
            e.preventDefault?.();
            onSend();
          }
        }}
        accessibilityLabel={placeholder}
        style={[
          // one 22pt line; native multiline grows with the text up to ~4 lines, web keeps one line and scrolls
          { flex: 1, fontSize: 17, lineHeight: 22, color: C.ink, paddingTop: 5, paddingBottom: 7, maxHeight: 100 },
          Platform.OS === 'web' ? { height: 34 } : null,
          fontFor('400'),
          Platform.OS === 'web' ? ({ outlineStyle: 'none', caretColor: C.violet } as any) : null,
        ]}
      />
      <Press onPress={comingSoon} disabled={disabled} accessibilityRole="button" accessibilityLabel="Dictate" hitSlop={6} style={{ height: 34, justifyContent: 'center' }}>
        <Icon name="microphone" size={20} color={C.secondary} />
      </Press>
      {thinking ? (
        <Press onPress={onStop} accessibilityRole="button" accessibilityLabel="Stop" style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: '#FFFFFF' }} />
        </Press>
      ) : (
        <Press disabled={!can} onPress={onSend} accessibilityRole="button" accessibilityLabel="Send" style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: can ? C.violet : C.fill, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow-up" size={16} color="#FFFFFF" weight="bold" />
        </Press>
      )}
    </View>
  );
}

export const _e = EASE;
