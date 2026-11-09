import React, { createContext, useContext, useEffect } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { Platform, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { T } from '../theme/type';
import { Icon } from './Icon';
import { ComingSoonToast } from './ComingSoon';

/**
 * On a desktop browser the app renders inside a 393-wide iPhone frame (like the HTML prototype),
 * with a drawn status bar and home indicator. On phones (native or mobile web) it is full-bleed
 * and uses the real safe-area insets.
 *
 * When the browser is shorter than the phone, the whole 393×852 phone is scaled down (as the HTML
 * prototype does) instead of squeezing the layout. Pointer coordinates then arrive in screen pixels,
 * so drag controls divide by useGestureScale() to stay in layout points.
 */
export type ScreenMetrics = { width: number; height: number; top: number; bottom: number; framed: boolean };
const Ctx = createContext<ScreenMetrics>({ width: 393, height: 852, top: 54, bottom: 34, framed: false });
export const useScreen = () => useContext(Ctx);

const ScaleCtx = createContext<SharedValue<number> | null>(null);
/** Screen-pixel → layout-point factor for gesture math (1 everywhere except a scaled desktop frame). */
export function useGestureScale(): SharedValue<number> {
  const fallback = useSharedValue(1);
  return useContext(ScaleCtx) ?? fallback;
}

/** Status bar tint requested by the visible screen. */
export const useStatusTint = create<{ light: boolean; setLight: (v: boolean) => void }>((set) => ({
  light: false,
  setLight: (light) => set({ light }),
}));

const PHONE_W = 393;
const PHONE_H = 852;

export function Frame({ children }: { children: React.ReactNode }) {
  const win = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const framed = Platform.OS === 'web' && win.width >= 600;
  const scale = framed ? Math.min(1, Math.max(0.5, (win.height - 32) / (PHONE_H + 22))) : 1;
  const gs = useSharedValue(scale);
  useEffect(() => {
    gs.set(scale);
  }, [scale, gs]);
  if (!framed) {
    const m: ScreenMetrics = {
      width: win.width,
      height: win.height,
      top: Math.max(insets.top, Platform.OS === 'web' ? 20 : 0),
      bottom: Math.max(insets.bottom, 16),
      framed: false,
    };
    return (
      <ScaleCtx.Provider value={gs}>
      <Ctx.Provider value={m}>
        <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
          {children}
          <ComingSoonToast />
        </View>
        <NativeStatusBar />
      </Ctx.Provider>
      </ScaleCtx.Provider>
    );
  }
  const m: ScreenMetrics = { width: PHONE_W, height: PHONE_H, top: 54, bottom: 34, framed: true };
  const boxW = (PHONE_W + 22) * scale;
  const boxH = (PHONE_H + 22) * scale;
  return (
    <ScaleCtx.Provider value={gs}>
    <Ctx.Provider value={m}>
      <View style={{ flex: 1, backgroundColor: '#E9E9EE', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: boxW, height: boxH }}>
        <View
          style={
            {
              position: 'absolute',
              left: (boxW - PHONE_W) / 2,
              top: (boxH - PHONE_H) / 2,
              width: PHONE_W,
              height: PHONE_H,
              borderRadius: 54,
              overflow: 'hidden',
              backgroundColor: '#F2F2F7',
              boxShadow: '0 0 0 10px #1C1C1E, 0 0 0 11px #3A3A3C, 0 40px 80px rgba(30,20,70,0.25)',
              isolation: 'isolate',
              transform: [{ scale }],
            } as any
          }
        >
          {children}
          <ComingSoonToast />
          <StatusBarChrome />
        </View>
        </View>
      </View>
    </Ctx.Provider>
    </ScaleCtx.Provider>
  );
}

function NativeStatusBar() {
  const light = useStatusTint((s) => s.light);
  return <StatusBar style={light ? 'light' : 'dark'} animated />;
}

/** Screens with a dark top (camera, session) request a light status bar while focused. */
export function useLightStatusBar(light = true) {
  useFocusEffect(
    React.useCallback(() => {
      useStatusTint.getState().setLight(light);
      return () => useStatusTint.getState().setLight(false);
    }, [light])
  );
}

function StatusBarChrome() {
  const light = useStatusTint((s) => s.light);
  const c = light ? '#FFFFFF' : '#0A0A0F';
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 54,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 4,
          paddingLeft: 44,
          paddingRight: 34,
          zIndex: 1000,
        }}
      >
        <T size={17} w="600" color={c}>
          9:41
        </T>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Icon name="cell-signal-full" size={17} color={c} weight="fill" />
          <Icon name="wifi-high" size={17} color={c} weight="bold" />
          <Icon name="battery-full" size={22} color={c} weight="fill" />
        </View>
      </View>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 11, left: (PHONE_W - 124) / 2, width: 124, height: 36, borderRadius: 999, backgroundColor: '#000', zIndex: 1001 }}
      />
      <View
        pointerEvents="none"
        style={{ position: 'absolute', bottom: 8, left: (PHONE_W - 139) / 2, width: 139, height: 5, borderRadius: 999, backgroundColor: light ? '#FFFFFF' : '#0A0A0F', zIndex: 1001 }}
      />
    </>
  );
}
