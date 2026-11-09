// Design tokens — values taken verbatim from design_handoff_risely/README.md.

export const C = {
  ink: '#0A0A0F',
  secondary: '#6C6C72',
  tertiary: '#AEAEB2',
  gray2: '#8E8E93',
  bg: '#F2F2F7',
  fill: '#E3E3E8',
  segTrack: '#EEEEF0',
  separator: 'rgba(60,60,67,0.18)',
  white: '#FFFFFF',
  violet: '#5B3BF5',
  violetDark: '#4A2BE0',
  violetTint: '#EDE9FF',
  violetSoft: '#DCD3FD',
  protein: '#7A5CF7',
  carbs: '#0A84FF',
  fat: '#FF9F0A',
  success: '#34C759',
  error: '#FF3B30',
  progressTrack: '#E9E9EE',
  rowHighlight: '#E5E5EA',
  chevron: '#C4C4C7',
  label3C: '#3C3C43',
} as const;

export type ToneName = 'food' | 'food2' | 'sky' | 'lilac' | 'rose' | 'sage';
export const TONES: Record<ToneName, { bg: string; fg: string }> = {
  food: { bg: '#F6EBDD', fg: '#9A6B3C' },
  food2: { bg: '#F7F0DC', fg: '#8C7430' },
  sky: { bg: '#E6EFFA', fg: '#3D6FB0' },
  lilac: { bg: '#EFEAFE', fg: '#5B3BF5' },
  rose: { bg: '#FBEAEF', fg: '#B0466A' },
  sage: { bg: '#E7F2E9', fg: '#3E8A55' },
};

export const R = {
  phone: 54,
  sheet: 32,
  hero: 28,
  tile: 24,
  card: 22,
  pill: 999,
  thumb: 12,
  seg: 12,
  segInd: 9,
} as const;

export const S = { side: 16 } as const;

// Glass (floating chrome only)
export const GLASS = {
  bg: 'rgba(255,255,255,0.7)',
  border: 'rgba(255,255,255,0.9)',
  dark: 'rgba(40,40,48,0.55)',
} as const;

export const IMG = {
  welcome: require('../../assets/onb-welcome.jpg'),
  mark: require('../../assets/risely-mark-sm.png'),
  markLg: require('../../assets/risely-mark.png'),
  appIcon: require('../../assets/risely-app-icon-sm.png'),
  avatar: require('../../assets/avatar-sofia.jpg'),
  woFullbody: require('../../assets/wo-fullbody.jpg'),
  woMobility: require('../../assets/wo-mobility.jpg'),
  woSession: require('../../assets/wo-session.jpg'),
  catPilates: require('../../assets/cat-pilates.jpg'),
  catYoga: require('../../assets/cat-yoga.jpg'),
  catStrength: require('../../assets/cat-strength.jpg'),
  catStretch: require('../../assets/cat-stretch.jpg'),
  thWallcore: require('../../assets/th-wallcore.jpg'),
  thBridge: require('../../assets/th-bridge.jpg'),
  thWallsculpt: require('../../assets/th-wallsculpt.jpg'),
  thCorebasics: require('../../assets/th-corebasics.jpg'),
  mealBowl: require('../../assets/meal-bowl.jpg'),
  mealSalmon: require('../../assets/meal-salmon.jpg'),
  dietAny: require('../../assets/diet-any.jpg'),
  dietVegetarian: require('../../assets/diet-vegetarian.jpg'),
  dietVegan: require('../../assets/diet-vegan.jpg'),
  dietPescatarian: require('../../assets/diet-pescatarian.jpg'),
  dietLowcarb: require('../../assets/diet-lowcarb.jpg'),
} as const;
