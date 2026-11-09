import React from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { C, IMG } from '../../theme/tokens';
import { T } from '../../theme/type';
import { Aura } from '../../components/Aura';
import { Ring } from '../../components/Ring';
import { Glass } from '../../components/Glass';
import { Icon } from '../../components/Icon';
import { Press } from '../../components/Press';
import { CountUp, GlassButton } from '../../components/Bits';
import { useScreen } from '../../components/Frame';
import { CoachAvatar } from '../../onboarding/steps/StepsB';
import { useDay } from '../../store/nutrition';
import { comingSoon } from '../../components/ComingSoon';
import { fmtInt } from '../../components/anim';

const WEEK = [
  { l: 'M', v: 0.92, dot: true },
  { l: 'T', v: 0.78, dot: false },
  { l: 'W', v: 0.63, dot: true, today: true },
  { l: 'T', v: 0, dot: false },
  { l: 'F', v: 0, dot: false },
  { l: 'S', v: 0, dot: false },
  { l: 'S', v: 0, dot: false },
];

/** H1 · Today — greeting, today's workout, the week at a glance, calories and coach side by side. */
export default function Today() {
  const { top } = useScreen();
  const day = useDay();
  return (
    <View style={{ flex: 1 }}>
      <Aura />
      <ScrollView contentContainerStyle={{ paddingTop: top, paddingHorizontal: 16, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
          <View style={{ width: 44, height: 44, borderRadius: 999, borderWidth: 2, borderColor: '#FFFFFF', overflow: 'hidden', margin: -2 }}>
            <Image source={IMG.avatar} style={{ width: 40, height: 40 }} contentFit="cover" accessibilityLabel="Sofia" />
          </View>
          <GlassButton icon="bell" label="Notifications" onPress={comingSoon} />
        </View>
        <View style={{ gap: 2, paddingTop: 14, paddingHorizontal: 4, paddingBottom: 16 }}>
          <T size={15} color={C.label3C}>
            Wednesday, Nov 4
          </T>
          <T size={34} lh={40} w="700" ls={-0.03} accessibilityRole="header">
            <T size={34} lh={40} w="700" ls={-0.03} color={C.gray2}>
              Good morning,
            </T>
            {'\n'}Sofia
          </T>
        </View>

        <Press big onPress={() => router.push('/workout/fullbody')} accessibilityRole="button" accessibilityLabel="Full Body Pilates, Day 9 of 28" style={{ height: 196, borderRadius: 28, overflow: 'hidden' }}>
          <Image source={IMG.woFullbody} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" contentPosition={{ top: '55%', left: '50%' }} />
          <LinearGradient colors={['rgba(10,10,15,0)', 'rgba(10,10,15,0)', 'rgba(10,10,15,0.45)']} locations={[0, 0.45, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <Glass style={{ position: 'absolute', top: 14, left: 14, height: 28, paddingHorizontal: 10, justifyContent: 'center' }}>
            <T size={13} w="600">
              Day 9 of 28
            </T>
          </Glass>
          <View style={{ position: 'absolute', left: 18, right: 18, bottom: 18, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <T size={24} lh={28} w="700" ls={-0.02} color="#FFFFFF">
                Full Body Pilates
              </T>
              <T size={15} color="rgba(255,255,255,0.9)">
                20 min · Beginner · Mat
              </T>
            </View>
            <View style={{ width: 52, height: 52, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="play" size={22} weight="fill" />
            </View>
          </View>
        </Press>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, marginTop: 10, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <T size={17} w="600">
              This week
            </T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name="flame" size={16} color={C.fat} weight="fill" />
              <T size={15} color={C.secondary}>
                12-day streak
              </T>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {WEEK.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <T size={12} w="600" color={d.today ? C.ink : C.gray2}>
                  {d.l}
                </T>
                <Ring size={30} stroke={4} value={d.v} track={d.today ? C.violetSoft : C.violetTint} delay={160 + i * 40} />
                <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: d.dot ? C.ink : 'transparent' }} />
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Press big onPress={() => router.navigate('/nutrition')} accessibilityRole="button" accessibilityLabel={`Calories, ${day.left} kcal left`} style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 22, paddingVertical: 14, paddingHorizontal: 16, gap: 10, minHeight: 140 }}>
            <T size={15} w="600">
              Calories
            </T>
            <Ring size={74} stroke={9} value={day.ring}>
              <CountUp value={day.left} size={17} />
            </Ring>
            <T size={13} color={C.secondary}>
              kcal left of {fmtInt(day.goal)}
            </T>
          </Press>
          <Press big onPress={() => router.push('/coach?start=dinner')} accessibilityRole="button" accessibilityLabel="Coach" style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 22, paddingVertical: 14, paddingHorizontal: 16, gap: 10, minHeight: 140 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CoachAvatar size={24} />
              <T size={15} w="600">
                Coach
              </T>
            </View>
            <T size={15} lh={20} style={{ flex: 1 }}>
              {Math.max(0, day.pGoal - day.p)} g protein to go today.
            </T>
            <T size={15} w="600" color={C.violet}>
              Dinner ideas
            </T>
          </Press>
        </View>
      </ScrollView>
    </View>
  );
}
