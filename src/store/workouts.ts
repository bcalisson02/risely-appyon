import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from './storage';

export const DURATIONS = ['Any', '10 min', '20 min', '30+'];
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const EQUIPMENT = ['None', 'Mat', 'Wall', 'Dumbbells', 'Bands', 'Chair'];
export const FOCUS = ['Full body', 'Core', 'Glutes', 'Arms', 'Back', 'Flexibility'];

export type Filters = { duration: number; level: number[]; equipment: number[]; focus: number[] };
/** W2 defaults as drawn: 20 min · Beginner · Mat, Wall · Core → "9 workouts". */
export const DEFAULT_FILTERS: Filters = { duration: 2, level: [0], equipment: [1, 2], focus: [1] };

/** Mock count: 9 matches with every group set, each cleared group adds 3 (prototype behaviour). */
export function matchCount(f: Filters) {
  const empty = [f.duration === 0, !f.level.length, !f.equipment.length, !f.focus.length].filter(Boolean).length;
  return 9 + empty * 3;
}

/** Active filters as removable capsules (W3). */
export function activeCapsules(f: Filters): { key: keyof Filters; label: string }[] {
  const out: { key: keyof Filters; label: string }[] = [];
  if (f.duration) out.push({ key: 'duration', label: DURATIONS[f.duration] });
  if (f.level.length) out.push({ key: 'level', label: f.level.map((i) => LEVELS[i]).join(', ') });
  if (f.equipment.length) out.push({ key: 'equipment', label: f.equipment.map((i) => EQUIPMENT[i]).join(', ') });
  if (f.focus.length) out.push({ key: 'focus', label: f.focus.map((i) => FOCUS[i]).join(', ') });
  return out;
}

type State = {
  filters: Filters;
  bookmarks: string[];
  feel: number;
  /** set by the coach (C4 "Swap it") */
  fridaySwapped: boolean;
  setFilters: (f: Partial<Filters>) => void;
  clearFilter: (k: keyof Filters) => void;
  resetFilters: () => void;
  toggleBookmark: (id: string) => void;
  setFeel: (i: number) => void;
  swapFriday: () => void;
};

export const useWorkouts = create<State>()(
  persist(
    (set, get) => ({
      filters: DEFAULT_FILTERS,
      bookmarks: [],
      feel: 1,
      fridaySwapped: false,
      setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
      clearFilter: (k) => set({ filters: { ...get().filters, [k]: k === 'duration' ? 0 : [] } }),
      resetFilters: () => set({ filters: { duration: 0, level: [], equipment: [], focus: [] } }),
      toggleBookmark: (id) => {
        const b = get().bookmarks;
        set({ bookmarks: b.includes(id) ? b.filter((x) => x !== id) : [...b, id] });
      },
      setFeel: (feel) => set({ feel }),
      swapFriday: () => set({ fridaySwapped: true }),
    }),
    { name: 'risely-workouts-v1', storage }
  )
);
