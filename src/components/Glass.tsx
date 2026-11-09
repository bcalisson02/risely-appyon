import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { GLASS } from '../theme/tokens';

/**
 * Glass — floating chrome only (tab bar, back button over photos, toast).
 * rgba(255,255,255,0.7) + blur 20 / saturate 180%, hairline inner border, soft shadow.
 */
export function Glass({
  style,
  children,
  dark,
  radius = 999,
  shadow = 'soft',
}: {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  dark?: boolean;
  radius?: number;
  shadow?: 'soft' | 'bar' | 'none';
}) {
  const sh =
    shadow === 'none'
      ? null
      : shadow === 'bar'
        ? Platform.select<ViewStyle>({
            web: { boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } as any,
            default: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
          })
        : Platform.select<ViewStyle>({
            web: { boxShadow: '0 2px 10px rgba(20,10,60,0.06)' } as any,
            default: { shadowColor: '#140A3C', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
          });
  const webBlur =
    Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' } as any)
      : null;
  return (
    <View style={[{ borderRadius: radius }, sh, style]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]} pointerEvents="none">
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, webBlur, { backgroundColor: dark ? GLASS.dark : GLASS.bg }]} />
        ) : (
          <>
            <BlurView intensity={40} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: dark ? GLASS.dark : 'rgba(255,255,255,0.55)' }]} />
          </>
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, borderWidth: 0.5, borderColor: dark ? 'rgba(255,255,255,0.18)' : GLASS.border },
          ]}
        />
      </View>
      {children}
    </View>
  );
}
