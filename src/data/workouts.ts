import { IMG } from '../theme/tokens';

export type Workout = { id: string; title: string; meta: string; img: any; pos?: { left: string; top: string } };

export const CATALOG: Record<string, Workout> = {
  fullbody: { id: 'fullbody', title: 'Full Body Pilates', meta: '20 min · Beginner · Mat', img: IMG.woFullbody, pos: { left: '60%', top: '50%' } },
  wallcore: { id: 'wallcore', title: 'Wall Pilates Core', meta: '15 min · Beginner · Wall', img: IMG.thWallcore },
  posture: { id: 'posture', title: 'Pilates for Posture', meta: '20 min · Beginner · Mat', img: IMG.woMobility, pos: { left: '60%', top: '50%' } },
  bridge: { id: 'bridge', title: 'Glute Bridge Flow', meta: '12 min · Beginner · Mat', img: IMG.thBridge },
  wallsculpt: { id: 'wallsculpt', title: 'Wall Sculpt', meta: '18 min · Beginner · Wall', img: IMG.thWallsculpt },
  corebasics: { id: 'corebasics', title: 'Core Basics', meta: '10 min · Beginner · Mat', img: IMG.thCorebasics },
  mobility: { id: 'mobility', title: 'Morning Mobility', meta: '10 min · All levels', img: IMG.woMobility, pos: { left: '60%', top: '50%' } },
};

/** W1 "Popular this week" */
export const POPULAR = [
  { id: 'wallcore', title: 'Wall Pilates Core', meta: '15 min · Beginner', img: IMG.thWallcore },
  { id: 'mobility', title: 'Morning Mobility', meta: '10 min · All levels', img: IMG.woMobility, pos: { left: '60%', top: '50%' } },
];

/** W3 list (Pilates, filtered — as designed) */
export const CATEGORY_LIST = ['wallcore', 'fullbody', 'posture', 'bridge', 'wallsculpt', 'corebasics'];

/** Other categories reuse the mock catalog (no extra workouts were designed). */
export const CATEGORY_LISTS: Record<string, string[]> = {
  Pilates: CATEGORY_LIST,
  Yoga: ['mobility', 'posture'],
  Strength: ['wallsculpt', 'bridge', 'corebasics', 'wallcore'],
  'Stretch & sleep': ['mobility', 'posture'],
};

export const CATEGORIES = [
  { id: 'Pilates', count: '24 workouts', img: IMG.catPilates, pos: { left: '50%', top: '74%' } },
  { id: 'Yoga', count: '18 workouts', img: IMG.catYoga, pos: { left: '40%', top: '50%' } },
  { id: 'Strength', count: '21 workouts', img: IMG.catStrength, pos: { left: '45%', top: '66%' } },
  { id: 'Stretch & sleep', count: '12 workouts', img: IMG.catStretch, pos: { left: '45%', top: '50%' } },
];

/** W4 exercise list (8 exercises). */
export const EXERCISES: [string, string][] = [
  ['Breathing & set up', '1:00'],
  ['Pelvic tilts', '2:00'],
  ['Glute bridge', '2:00'],
  ['Side plank', '1:30'],
  ['Single leg stretch', '2:00'],
  ['Swan', '1:30'],
  ['Leg circles', '2:00'],
  ['Cool-down stretch', '2:00'],
];
