import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storage } from './storage';
import { useOnboarding } from './onboarding';
import { derive } from '../logic/derive';

export type Food = {
  id: string;
  name: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  /** "photo" items show the scanned meal photo as the dinner thumbnail */
  photo?: 'mealBowl';
};

/**
 * Mock data (README → "Mock data"): before dinner eaten 1,050 (320 + 450 + 280), burned 210,
 * macros P60 C105 F26. The split per meal is arbitrary but sums to those totals.
 */
export const BASE_MEALS = [
  { id: 'breakfast', title: 'Breakfast', desc: 'Greek yogurt, berries, granola', kcal: 320, p: 18, c: 40, f: 8, icon: 'coffee', tone: 'food2' },
  { id: 'lunch', title: 'Lunch', desc: 'Grilled chicken salad', kcal: 450, p: 32, c: 30, f: 12, icon: 'bowl-food', tone: 'sage' },
  { id: 'snack', title: 'Snack', desc: 'Apple, almonds', kcal: 280, p: 10, c: 35, f: 6, icon: 'orange-slice', tone: 'rose' },
] as const;

export const BURNED = 210;

export const TERIYAKI: Food = { id: 'teriyaki', name: 'Teriyaki chicken bowl', kcal: 628, p: 46, c: 62, f: 22, photo: 'mealBowl' };

type State = {
  dinner: Food[];
  /** last add, for Undo */
  lastAdded: string | null;
  /** bumps when a food is added — N1 shows the toast */
  toastKey: number;
  toastFood: Food | null;
  addFood: (items: Food | Food[], opts?: { toast?: boolean }) => string[];
  remove: (ids: string[]) => void;
  undo: () => void;
  clearToast: () => void;
  reset: () => void;
};

export const useNutrition = create<State>()(
  persist(
    (set, get) => ({
      dinner: [],
      lastAdded: null,
      toastKey: 0,
      toastFood: null,
      addFood: (items, opts) => {
        const list = (Array.isArray(items) ? items : [items]).map((f, i) => ({ ...f, id: `${f.id}-${Date.now()}-${i}` }));
        if (!list.length) return [];
        const total: Food = list.length === 1 ? list[0] : { id: 'multi', name: list.map((x) => x.name).join(', '), kcal: sum(list, 'kcal'), p: sum(list, 'p'), c: sum(list, 'c'), f: sum(list, 'f') };
        const toast = opts?.toast ?? true;
        set({ dinner: [...get().dinner, ...list], lastAdded: list.map((x) => x.id).join('|'), toastKey: toast ? get().toastKey + 1 : get().toastKey, toastFood: toast ? total : get().toastFood });
        return list.map((x) => x.id);
      },
      remove: (ids) => set({ dinner: get().dinner.filter((d) => !ids.includes(d.id)) }),
      undo: () => {
        const ids = (get().lastAdded ?? '').split('|');
        set({ dinner: get().dinner.filter((d) => !ids.includes(d.id)), lastAdded: null, toastFood: null });
      },
      clearToast: () => set({ toastFood: null }),
      reset: () => set({ dinner: [], lastAdded: null, toastFood: null }),
    }),
    { name: 'risely-nutrition-v1', storage, partialize: (s) => ({ dinner: s.dinner }) }
  )
);

const sum = (l: Food[], k: 'kcal' | 'p' | 'c' | 'f') => l.reduce((a, x) => a + x[k], 0);

/** Daily summary: goal and macro goals come from the onboarding plan (1,650 / 110 / 190 / 50 by default). */
export function useDay() {
  const o = useOnboarding();
  const dinner = useNutrition((s) => s.dinner);
  const plan = derive(o);
  const goal = plan.kcalN;
  const eaten = BASE_MEALS.reduce((a, m) => a + m.kcal, 0) + sum(dinner, 'kcal');
  const p = BASE_MEALS.reduce((a, m) => a + m.p, 0) + sum(dinner, 'p');
  const c = BASE_MEALS.reduce((a, m) => a + m.c, 0) + sum(dinner, 'c');
  const f = BASE_MEALS.reduce((a, m) => a + m.f, 0) + sum(dinner, 'f');
  const left = goal - eaten + BURNED;
  return {
    goal,
    eaten,
    burned: BURNED,
    left,
    /** ring = share of goal eaten (net of burned) */
    ring: (eaten - BURNED) / goal,
    p,
    c,
    f,
    pGoal: plan.pro,
    cGoal: plan.carb,
    fGoal: plan.fat,
    dinner,
    dinnerKcal: sum(dinner, 'kcal'),
  };
}
