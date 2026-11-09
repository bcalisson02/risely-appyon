import React from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { C } from '../theme/tokens';
import { T } from '../theme/type';
import { Rise } from '../components/Rise';
import { useScreen } from '../components/Frame';

/**
 * Question screen: 26pt top padding, title 34/40 bold (−0.03em), optional subtitle 17/23 secondary,
 * content vertically centered in the remaining space, footer with the black Continue capsule.
 */
export function OnbScreen({
  title,
  subtitle,
  children,
  footer,
  gap = 24,
  contentStyle,
  bg = C.white,
}: {
  title?: string;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  gap?: number;
  contentStyle?: StyleProp<ViewStyle>;
  bg?: string;
}) {
  const { top, bottom } = useScreen();
  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: top + 50, paddingBottom: bottom }}>
      {/* scrolls only when the content is taller than the screen (small phones) */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
      {title ? (
        <Rise index={0} style={{ paddingTop: 26, paddingHorizontal: 4, gap: 10 }}>
          <T size={34} lh={40} w="700" ls={-0.03} accessibilityRole="header" wrap="balance">
            {title}
          </T>
          {subtitle ? (
            typeof subtitle === 'string' ? (
              <T size={17} lh={23} color={C.secondary} wrap="pretty">
                {subtitle}
              </T>
            ) : (
              subtitle
            )
          ) : null}
        </Rise>
      ) : null}
      <Rise index={1} style={[{ flex: 1, justifyContent: 'center', gap, paddingVertical: 8 }, contentStyle]}>
        {children}
      </Rise>
      </ScrollView>
      {footer ? (
        <Rise index={2} style={{ paddingTop: 16, paddingHorizontal: 16, gap: 4 }}>
          {footer}
        </Rise>
      ) : null}
    </View>
  );
}

/** Big rounded number with a unit, e.g. "68 kg" (80pt, 600, −0.03em). */
export function BigValue({ value, unit, size = 80, style }: { value: string; unit?: string; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 6 }, style]}>
      <T size={size} lh={size} w="600" rounded ls={-0.03}>
        {value}
      </T>
      {unit ? (
        <T size={20} w="600" color={C.secondary}>
          {unit}
        </T>
      ) : null}
    </View>
  );
}
