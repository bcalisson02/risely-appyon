import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { C } from '../theme/tokens';

/**
 * Aura background — top-of-screen pastel wash fading into bg.
 * Recreates the CSS: radial-gradient(70% 22% at 12% 0%, rgba(123,92,247,0.30), transparent 70%),
 *                    radial-gradient(60% 20% at 92% 2%, rgba(255,182,220,0.55), transparent 70%), #F2F2F7
 * Each CSS ellipse is drawn as an SVG ellipse filled with an objectBoundingBox radial gradient,
 * which maps the gradient circle onto the ellipse exactly.
 */
const BASIS_H = 852; // percentages are relative to the 393×852 frame

export function Aura({ variant = 'violet', bg = C.bg }: { variant?: 'violet' | 'sky'; bg?: string }) {
  const { width } = useWindowDimensions();
  const W = Math.min(width, 600);
  const a =
    variant === 'violet'
      ? { c1: 'rgb(123,92,247)', o1: 0.3, c2: 'rgb(255,182,220)', o2: 0.55 }
      : { c1: 'rgb(140,180,255)', o1: 0.45, c2: 'rgb(190,170,255)', o2: 0.45 };
  const h = BASIS_H * 0.25;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: bg }]}>
      <Svg width="100%" height={h} style={{ position: 'absolute', top: 0, left: 0, right: 0 }} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="a1" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
            <Stop offset="0" stopColor={a.c1} stopOpacity={a.o1} />
            <Stop offset="0.7" stopColor={a.c1} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="a2" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
            <Stop offset="0" stopColor={a.c2} stopOpacity={a.o2} />
            <Stop offset="0.7" stopColor={a.c2} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={W * 0.12} cy={0} rx={W * 0.7} ry={BASIS_H * 0.22} fill="url(#a1)" />
        <Ellipse cx={W * 0.92} cy={BASIS_H * 0.02} rx={W * 0.6} ry={BASIS_H * 0.2} fill="url(#a2)" />
      </Svg>
    </View>
  );
}
