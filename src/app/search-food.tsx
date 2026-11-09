import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { C } from '../theme/tokens';
import { T, fontFor } from '../theme/type';
import { Icon } from '../components/Icon';
import { Press } from '../components/Press';
import { Chip } from '../components/Controls';
import { InsetList, Row } from '../components/List';
import { AddToggle } from '../components/Bits';
import { useScreen } from '../components/Frame';
import { SEARCH } from '../data/foods';
import { useNutrition } from '../store/nutrition';
import { fmtInt } from '../components/anim';
import { closeTo, goBack } from '../nav/back';

const FILTERS = ['All', 'My foods', 'Brands'];

/** N6 · Search food — inline search; tapping + adds and the button turns into a check. */
export default function SearchFood() {
  const { top, bottom } = useScreen();
  const [q, setQ] = useState('avoc');
  const [filter, setFilter] = useState(0);
  // the prototype shows this state with "Avocado, half" already added
  const [sel, setSel] = useState<string[]>(['avocado-half']);
  const addFood = useNutrition((s) => s.addFood);

  const results = useMemo(
    () =>
      SEARCH.filter((f) => (f.name + ' ' + (f.keywords ?? '')).toLowerCase().includes(q.trim().toLowerCase())).filter((f) =>
        filter === 0 ? true : filter === 1 ? f.group === 'mine' : f.group === 'brand'
      ),
    [q, filter]
  );
  const picked = SEARCH.filter((f) => sel.includes(f.id));
  const kcal = picked.reduce((a, f) => a + f.kcal, 0);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'web' ? undefined : 'padding'} style={{ flex: 1, backgroundColor: C.bg, paddingTop: top, paddingHorizontal: 16, paddingBottom: bottom }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8, paddingBottom: 12 }}>
        <View style={{ flex: 1, height: 40, borderRadius: 12, backgroundColor: C.fill, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 }}>
          <Icon name="magnifying-glass" size={18} color={C.secondary} />
          <TextInput
            value={q}
            onChangeText={setQ}
            autoFocus
            placeholder="Search food"
            placeholderTextColor={C.secondary}
            selectionColor={C.violet}
            cursorColor={C.violet}
            returnKeyType="search"
            accessibilityLabel="Search food"
            style={[{ flex: 1, fontSize: 17, color: C.ink, padding: 0 }, fontFor('400'), Platform.OS === 'web' ? ({ outlineStyle: 'none', caretColor: C.violet } as any) : null]}
          />
          {q ? (
            <Press plain onPress={() => setQ('')} hitSlop={8} accessibilityLabel="Clear" style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: C.tertiary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={10} color="#FFFFFF" weight="bold" />
            </Press>
          ) : null}
        </View>
        <Press onPress={() => goBack('/nutrition')} accessibilityRole="button" hitSlop={6}>
          <T size={17} color={C.violet}>
            Cancel
          </T>
        </Press>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 12 }}>
        {FILTERS.map((f, i) => (
          <Chip key={f} label={f} on={filter === i} onPress={() => setFilter(i)} height={32} />
        ))}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {results.length ? (
          <InsetList>
            {results.map((f) => {
              const on = sel.includes(f.id);
              return (
                <Row
                  key={f.id}
                  title={f.name}
                  subtitle={f.serving}
                  leadPad={16}
                  padV={10}
                  padR={12}
                  trailing={<AddToggle on={on} label={f.name} onPress={() => setSel((s) => (on ? s.filter((x) => x !== f.id) : [...s, f.id]))} />}
                />
              );
            })}
          </InsetList>
        ) : (
          <T size={15} color={C.secondary} center style={{ paddingTop: 40 }}>
            No results
          </T>
        )}
      </ScrollView>
      {picked.length ? (
        <Animated.View
          entering={FadeInDown.duration(320)}
          exiting={FadeOutDown.duration(220)}
          style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 999, paddingVertical: 6, paddingRight: 6, paddingLeft: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' } as any}
        >
          <T size={15} style={{ flex: 1 }} numberOfLines={1}>
            <T size={15} w="600">
              {picked.length} {picked.length === 1 ? 'item' : 'items'}
            </T>
            <T size={15} color={C.secondary}>
              {' '}
              · {fmtInt(kcal)} kcal to Dinner
            </T>
          </T>
          <Press
            onPress={() => {
              addFood(picked.map((f) => ({ id: f.id, name: f.name, kcal: f.kcal, p: f.p, c: f.c, f: f.f })));
              closeTo('/nutrition');
            }}
            accessibilityRole="button"
            style={{ height: 40, paddingHorizontal: 20, borderRadius: 999, backgroundColor: C.ink, justifyContent: 'center' }}
          >
            <T size={15} w="600" color="#FFFFFF">
              Done
            </T>
          </Press>
        </Animated.View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
