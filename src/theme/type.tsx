import React from 'react';
import { Platform, Text, TextProps, TextStyle, StyleProp } from 'react-native';
import Animated from 'react-native-reanimated';
import { C } from './tokens';

/**
 * Typography. SF Pro on iOS (system), Inter on Android/web (README → Typography).
 * Numbers use SF Pro Rounded (ui-rounded) with tabular figures.
 */
const WEB_TEXT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, "Helvetica Neue", Arial, sans-serif';
const WEB_ROUNDED = 'ui-rounded, "SF Pro Rounded", Inter, -apple-system, sans-serif';

type W = '400' | '500' | '600' | '700';
const ANDROID_INTER: Record<W, string> = {
  '400': 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
};

export function fontFor(weight: W = '400', rounded = false): TextStyle {
  if (Platform.OS === 'web') return { fontFamily: rounded ? WEB_ROUNDED : WEB_TEXT, fontWeight: weight };
  if (Platform.OS === 'ios') return { fontFamily: rounded ? 'ui-rounded' : undefined, fontWeight: weight };
  return { fontFamily: ANDROID_INTER[weight], fontWeight: 'normal' };
}

export type TProps = TextProps & {
  size?: number;
  lh?: number;
  w?: W;
  color?: string;
  /** letter-spacing in em, like the CSS source */
  ls?: number;
  rounded?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  animated?: boolean;
};

export function tStyle({ size = 17, lh, w = '400', color = C.ink, ls, rounded, center }: TProps): TextStyle {
  const st: { -readonly [K in keyof TextStyle]: TextStyle[K] } = {
    ...fontFor(w, rounded),
    fontSize: size,
    color,
  };
  if (lh) st.lineHeight = lh;
  // body default tracking −0.01em (prototype body style)
  st.letterSpacing = (ls ?? -0.01) * size;
  if (rounded) st.fontVariant = ['tabular-nums'];
  if (center) st.textAlign = 'center';
  return st;
}

export function T(props: TProps) {
  const { size, lh, w, color, ls, rounded, center, style, animated, ...rest } = props;
  const s = tStyle({ size, lh, w, color, ls, rounded, center });
  if (animated) return <Animated.Text {...(rest as any)} style={[s, style]} />;
  return <Text {...rest} style={[s, style]} />;
}

/** Rounded tabular number. */
export function Num(p: TProps) {
  return <T w="600" rounded {...p} />;
}

/** Two-tone headline: first clause gray2, the rest ink. */
export function TwoTone({
  gray,
  ink,
  size = 34,
  lh = 40,
  ls = -0.03,
  breakLine,
  style,
  center,
}: {
  gray: string;
  ink: string;
  size?: number;
  lh?: number;
  ls?: number;
  breakLine?: boolean;
  style?: StyleProp<TextStyle>;
  center?: boolean;
}) {
  return (
    <T size={size} lh={lh} w="700" ls={ls} style={style} center={center}>
      <T size={size} lh={lh} w="700" ls={ls} color={C.gray2}>
        {gray}
      </T>
      {breakLine ? '\n' : ' '}
      {ink}
    </T>
  );
}
