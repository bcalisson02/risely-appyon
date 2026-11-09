import type { Food } from '../store/nutrition';

/** N2 "Recent" */
export const RECENT: (Food & { serving: string; icon: 'coffee' | 'fish'; tone: 'food2' | 'food' })[] = [
  { id: 'oats', name: 'Overnight oats', serving: '1 bowl · 310 kcal', kcal: 310, p: 12, c: 48, f: 8, icon: 'coffee', tone: 'food2' },
  { id: 'salmon-rice', name: 'Salmon & rice', serving: '1 plate · 540 kcal', kcal: 540, p: 34, c: 58, f: 18, icon: 'fish', tone: 'food' },
];

/** N6 search results for "avoc" */
export const SEARCH: (Food & { serving: string; group: 'generic' | 'mine' | 'brand' })[] = [
  { id: 'avocado', name: 'Avocado', serving: '1 medium · 240 kcal', kcal: 240, p: 3, c: 13, f: 22, group: 'generic' },
  { id: 'avocado-half', name: 'Avocado, half', serving: '50 g · 80 kcal', kcal: 80, p: 1, c: 4, f: 7, group: 'generic' },
  { id: 'avocado-toast', name: 'Avocado toast', serving: '1 slice · 195 kcal', kcal: 195, p: 5, c: 20, f: 11, group: 'mine' },
  { id: 'guacamole', name: 'Guacamole', serving: '2 tbsp · 50 kcal', kcal: 50, p: 1, c: 3, f: 4, group: 'brand' },
  { id: 'avocado-oil', name: 'Avocado oil', serving: '1 tbsp · 124 kcal', kcal: 124, p: 0, c: 0, f: 14, group: 'brand' },
];

/** N5 ingredients of the scanned meal (628 kcal: P46 C62 F22) */
export const TERIYAKI_INGREDIENTS: [string, string][] = [
  ['Teriyaki chicken', '150 g'],
  ['White rice', '150 g'],
  ['Avocado', '80 g'],
  ['Teriyaki sauce', '1 tbsp'],
];
