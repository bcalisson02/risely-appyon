import React, { useState } from 'react';
import { Platform, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { C, IMG } from '../../theme/tokens';
import { T, fontFor } from '../../theme/type';
import { Aura } from '../../components/Aura';
import { Glass } from '../../components/Glass';
import { Icon } from '../../components/Icon';
import { Press } from '../../components/Press';
import { InsetList } from '../../components/List';
import { GlassButton, SectionTitle } from '../../components/Bits';
import { WorkoutRow } from '../../components/WorkoutRow';
import { useScreen } from '../../components/Frame';
import { CATEGORIES, POPULAR } from '../../data/workouts';

/** W1 · Library — plan first, then photo categories and a popular list. */
export default function Workouts() {
  const { top } = useScreen();
  const [q, setQ] = useState('');
  const popular = POPULAR.filter((p) => p.title.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <View style={{ flex: 1 }}>
      <Aura />
      <ScrollView contentContainerStyle={{ paddingTop: top, paddingHorizontal: 16, paddingBottom: 160 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingTop: 12, paddingHorizontal: 4, paddingBottom: 16 }}>
          <T size={34} lh={41} w="700" ls={-0.02} style={{ flex: 1 }} accessibilityRole="header">
            Workouts
          </T>
          <GlassButton icon="sliders-horizontal" label="Filters" onPress={() => router.push('/filters')} />
        </View>
        <View style={{ height: 40, borderRadius: 12, backgroundColor: 'rgba(118,118,128,0.12)', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, marginBottom: 16 }}>
          <Icon name="magnifying-glass" size={18} color={C.secondary} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search workouts"
            placeholderTextColor={C.gray2}
            selectionColor={C.violet}
            accessibilityLabel="Search workouts"
            style={[{ flex: 1, fontSize: 17, color: C.ink, padding: 0 }, fontFor('400'), Platform.OS === 'web' ? ({ outlineStyle: 'none', caretColor: C.violet } as any) : null]}
          />
        </View>

        <Press big onPress={() => router.push('/workout/fullbody')} accessibilityRole="button" accessibilityLabel="Full Body Pilates, Day 9 of 28" style={{ height: 200, borderRadius: 28, overflow: 'hidden' }}>
          <Image source={IMG.woFullbody} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" contentPosition={{ top: '55%', left: '50%' }} />
          <LinearGradient colors={['rgba(10,10,15,0)', 'rgba(10,10,15,0)', 'rgba(10,10,15,0.45)']} locations={[0, 0.45, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <Glass style={{ position: 'absolute', top: 14, left: 14, height: 28, paddingHorizontal: 10, justifyContent: 'center' }}>
            <T size={13} w="600">
              Day 9 of 28
            </T>
          </Glass>
          <View style={{ position: 'absolute', left: 18, right: 18, bottom: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <T size={22} lh={26} w="700" ls={-0.015} color="#FFFFFF">
                Full Body Pilates
              </T>
              <T size={15} color="rgba(255,255,255,0.85)">
                20 min · Beginner · Mat
              </T>
            </View>
            <View style={{ width: 48, height: 48, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="play" size={20} weight="fill" />
            </View>
          </View>
        </Press>

        <SectionTitle>Categories</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {CATEGORIES.map((c) => (
            <Press
              key={c.id}
              big
              onPress={() => router.push(`/category?name=${encodeURIComponent(c.id)}`)}
              accessibilityRole="button"
              accessibilityLabel={`${c.id}, ${c.count}`}
              style={{ flexGrow: 1, flexBasis: '40%', height: 132, borderRadius: 22, overflow: 'hidden', backgroundColor: C.rowHighlight }}
            >
              <Image source={c.img} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" contentPosition={c.pos} />
              <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']} locations={[0, 0.35, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              <View style={{ position: 'absolute', left: 14, right: 14, bottom: 12, gap: 1 }}>
                <T size={17} w="600" color="#FFFFFF">
                  {c.id}
                </T>
                <T size={13} color="rgba(255,255,255,0.9)">
                  {c.count}
                </T>
              </View>
            </Press>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <SectionTitle>Popular this week</SectionTitle>
          <Press onPress={() => router.push('/category?name=Pilates')} accessibilityRole="button" style={{ paddingHorizontal: 4 }}>
            <T size={15} color={C.violet}>
              See all
            </T>
          </Press>
        </View>
        <InsetList>
          {popular.map((p) => (
            <WorkoutRow key={p.id} {...p} />
          ))}
        </InsetList>
      </ScrollView>
    </View>
  );
}
