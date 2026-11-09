import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isReduceMotion } from '../theme/motion';

/** cubic-bezier evaluator (same math as CSS) for JS-driven tweens. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeFill = bezier(0.22, 1, 0.36, 1);

/**
 * JS-driven tween from `from` to `to` on mount / when `to` changes.
 * Used for count-ups and ring fills (works identically on web and native).
 */
export function useTween(
  to: number,
  { duration = 800, delay = 160, easing = easeOutCubic, from = 0 }: { duration?: number; delay?: number; easing?: (x: number) => number; from?: number } = {}
) {
  const [v, setV] = useState(isReduceMotion() ? to : from);
  const cur = useRef(isReduceMotion() ? to : from);
  useEffect(() => {
    if (isReduceMotion()) {
      cur.current = to;
      return;
    }
    const start = cur.current;
    let raf = 0;
    let t0 = 0;
    const step = (now: number) => {
      if (!t0) t0 = now + delay;
      const k = Math.min(1, Math.max(0, (now - t0) / duration));
      const val = start + (to - start) * easing(k);
      cur.current = val;
      setV(val);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);
  return isReduceMotion() ? to : v;
}

export const fmtInt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Selection haptic for ruler ticks, wheel snaps, dial steps and toggles. */
export function tick() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}
export function tapImpact() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
export function success() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
