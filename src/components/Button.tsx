import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { C } from '../theme/tokens';
import { T } from '../theme/type';
import { Icon, IconName } from './Icon';
import { Press } from './Press';

/** Primary CTA: 52 high, capsule, ink background, white 17/600. Never violet. */
export function PrimaryButton({
  title,
  onPress,
  icon,
  style,
  variant = 'ink',
  disabled,
}: {
  title: string;
  onPress?: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  variant?: 'ink' | 'gray' | 'white';
  disabled?: boolean;
}) {
  const bg = variant === 'ink' ? C.ink : variant === 'gray' ? C.bg : C.white;
  const fg = variant === 'ink' ? C.white : C.ink;
  return (
    <Press
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        { height: 52, borderRadius: 999, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'stretch' },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={fg} weight={icon === 'apple-logo' || icon === 'google-logo' ? 'regular' : 'regular'} /> : null}
      <T size={17} w="600" color={fg}>
        {title}
      </T>
    </Press>
  );
}

/** Secondary text button: 44 high, transparent, ink 17/400. */
export function TextButton({ title, onPress, style, color = C.ink }: { title: string; onPress?: () => void; style?: StyleProp<ViewStyle>; color?: string }) {
  return (
    <Press onPress={onPress} accessibilityRole="button" style={[{ height: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' }, style]}>
      <T size={17} color={color}>
        {title}
      </T>
    </Press>
  );
}

/** Round icon button (44pt, gray fill) — onboarding back, sheet close, etc. */
export function RoundButton({
  icon,
  onPress,
  size = 44,
  bg = C.bg,
  color = C.ink,
  iconSize = 18,
  weight = 'bold',
  style,
  label,
}: {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  bg?: string;
  color?: string;
  iconSize?: number;
  weight?: 'regular' | 'bold' | 'fill';
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? icon}
      hitSlop={6}
      style={[{ width: size, height: size, borderRadius: 999, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Icon name={icon} size={iconSize} color={color} weight={weight} />
    </Press>
  );
}

export function Spacer({ h, w, flex }: { h?: number; w?: number; flex?: number }) {
  return <View style={{ height: h, width: w, flex }} />;
}
