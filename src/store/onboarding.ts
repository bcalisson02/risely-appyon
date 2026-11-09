import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEF, Onb, derive } from '../logic/derive';
import { storage } from './storage';

type State = Onb & {
  /** onboarding finished → app opens on Today */
  done: boolean;
  set: (p: Partial<Onb>) => void;
  toggleIn: (key: 'types' | 'equipment', i: number) => void;
  toggleDay: (i: number) => boolean;
  finish: () => void;
  reset: () => void;
};

export const useOnboarding = create<State>()(
  persist(
    (set, get) => ({
      ...DEF,
      done: false,
      set: (p) => set(p),
      toggleIn: (key, i) => {
        const arr = get()[key];
        set({ [key]: arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i] } as Partial<Onb>);
      },
      /** returns false when the toggle is refused (at least 1 day stays on) */
      toggleDay: (i) => {
        const d = get().days;
        const has = d.includes(i);
        if (has && d.length === 1) return false;
        set({ days: has ? d.filter((x) => x !== i) : [...d, i] });
        return true;
      },
      finish: () => set({ done: true }),
      reset: () => set({ ...DEF, done: false }),
    }),
    { name: 'risely-onboarding-v1', storage }
  )
);

/** Derived plan values (port of derive()/plan()). */
export function usePlan() {
  const o = useOnboarding();
  return derive(o);
}
