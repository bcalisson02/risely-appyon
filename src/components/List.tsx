import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { C, TONES, ToneName } from '../theme/tokens';
import { T } from '../theme/type';
import { Icon, IconName } from './Icon';
import { Press } from './Press';

/** Tinted icon tile: Phosphor fill glyph at 46% of the tile. Radius 12 at 48pt, 9 at 32pt. */
export function IconTile({ tone, icon, size = 32, style }: { tone: ToneName; icon: IconName; size?: number; style?: StyleProp<ViewStyle> }) {
  const t = TONES[tone];
  const radius = size >= 48 ? 12 : size >= 40 ? 10 : 9;
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Icon name={icon} size={Math.round(size * 0.46)} color={t.fg} weight="fill" />
    </View>
  );
}

/** Card: white, radius 22. */
export function Card({ children, style, bg = C.white }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; bg?: string }) {
  return <View style={[{ backgroundColor: bg, borderRadius: 22 }, style]}>{children}</View>;
}

/** Inset grouped list — radius 22, rows with inset separators that start after the icon. */
export function InsetList({ children, style, bg = C.white }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; bg?: string }) {
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ backgroundColor: bg, borderRadius: 22, overflow: 'hidden' }, style]}>
      {kids.map((k, i) =>
        React.isValidElement(k) ? React.cloneElement(k as React.ReactElement<any>, { last: i === kids.length - 1 }) : k
      )}
    </View>
  );
}

export function Row({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  last,
  padV = 12,
  padR = 16,
  titleColor = C.ink,
  titleWeight = '400',
  gap = 12,
  leadPad = 12,
}: {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
  padV?: number;
  padR?: number;
  titleColor?: string;
  titleWeight?: '400' | '500' | '600';
  gap?: number;
  leadPad?: number;
}) {
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap, paddingLeft: leadPad }}>
      {leading}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: padV,
          paddingRight: padR,
          borderBottomWidth: last ? 0 : 0.5,
          borderBottomColor: C.separator,
        }}
      >
        <View style={{ flex: 1, gap: 1 }}>
          {typeof title === 'string' ? (
            <T size={17} color={titleColor} w={titleWeight}>
              {title}
            </T>
          ) : (
            title
          )}
          {subtitle ? (
            typeof subtitle === 'string' ? (
              <T size={15} color={C.secondary}>
                {subtitle}
              </T>
            ) : (
              subtitle
            )
          ) : null}
        </View>
        {trailing}
      </View>
    </View>
  );
  if (!onPress) return body;
  return (
    <Press row onPress={onPress} accessibilityRole="button">
      {body}
    </Press>
  );
}

export function Chevron({ size = 13, color = C.chevron }: { size?: number; color?: string }) {
  return <Icon name="caret-right" size={size} color={color} weight="bold" />;
}
