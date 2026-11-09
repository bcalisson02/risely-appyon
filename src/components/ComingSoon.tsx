import React from 'react';
import { create } from 'zustand';
import { Toast } from './Bits';
import { useScreen } from './Frame';
import { tick } from './anim';

/**
 * Controls that have no screen in the design (Quick add calories, Saved meals, bell, calendar, Share…)
 * answer every tap with the glass toast from the top: "Coming soon", hidden after 2 s.
 */
const useSoon = create<{ key: number; visible: boolean; show: () => void; hide: () => void }>((set, get) => ({
  key: 0,
  visible: false,
  show: () => set({ key: get().key + 1, visible: true }),
  hide: () => set({ visible: false }),
}));

export function comingSoon() {
  tick();
  useSoon.getState().show();
}

export function ComingSoonToast() {
  const { top } = useScreen();
  const { key, visible, hide } = useSoon();
  if (!visible) return null;
  // a new key restarts the toast if it is tapped again while visible
  return <Toast key={key} top={top + 4} title="Coming soon" icon="soon" duration={2000} onHidden={() => useSoon.getState().key === key && hide()} />;
}
