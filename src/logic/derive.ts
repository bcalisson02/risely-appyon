/**
 * Port of design/proto-widgets.js → derive() and plan(). Kept verbatim in logic and strings;
 * only the DOM-specific outputs (CSS px strings) became numbers.
 */

export type Onb = {
  goal: number; // O01 single select (not used by the math)
  current: number;
  target: number;
  rate: number;
  activity: number; // 0..3
  days: number[]; // 0 = Mon
  minutes: number;
  types: number[];
  equipment: number[];
  diet: number;
  sex: number; // 0 Female, 1 Male, 2 Other
  height: number;
  year: number;
  tone: number; // 0 Gentle, 1 Balanced, 2 Direct
  reminders: { workout: boolean; meals: boolean; checkin: boolean };
  health: boolean;
};

export const DEF: Onb = {
  goal: 0,
  current: 68,
  target: 62,
  rate: 0.5,
  activity: 1,
  days: [0, 2, 4],
  minutes: 20,
  types: [0, 2],
  equipment: [1, 2],
  diet: 0,
  sex: 0,
  height: 165,
  year: 1994,
  tone: 1,
  reminders: { workout: true, meals: true, checkin: true },
  health: false,
};

export const ACT: [string, string][] = [
  ['Mostly sitting', 'Desk job, little walking'],
  ['Lightly active', 'Some walking, on your feet at times'],
  ['Active', 'On your feet most of the day'],
  ['Very active', 'Physical job or lots of movement'],
];
export const DN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const TONE: [string, string][] = [
  ['Encouraging, never pushy', "That's okay. Rest counts too. Want to try a 10-minute stretch tonight?"],
  ['Supportive, with clear next steps', "No problem. Let's move it to tomorrow morning and keep your week on track."],
  ['Straight talk, keeps you accountable', "That's two skipped this week. Let's do 15 minutes now and get back on plan."],
];
const ACTP = ['a mostly seated day', 'a lightly active day', 'an active day', 'a very active day'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const commas = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export const f1 = (v: number) => (Math.round(v * 10) / 10).toString();
const trimRate = (r: number) => String(+r.toFixed(2));

/** "Today" in the mocks is Wednesday, Nov 4 (2026). */
export const TODAY = () => new Date(2026, 10, 4);

export function plan(o: Onb, kcal: number, diff: number, togo: number, date: string, n: number, mn: number) {
  const pro = Math.round((o.target * 1.8) / 5) * 5,
    fat = Math.round((kcal * 0.28) / 9 / 5) * 5,
    carb = Math.max(0, Math.round((kcal - pro * 4 - fat * 9) / 4 / 5) * 5),
    tot = pro * 4 + carb * 4 + fat * 9;
  const pace = o.rate < 0.35 ? 'gentle' : o.rate <= 0.7 ? 'steady' : 'fast';
  const ds = o.days.slice().sort((a, b) => a - b);
  const day = (i: number) => DN[ds[i % ds.length]];
  return {
    pro,
    fat,
    carb,
    goalBig: f1(o.target) + ' kg',
    goalDate: diff === 0 ? '' : 'by ' + date,
    goalSub:
      diff > 0
        ? `${f1(togo)} kg to lose at ${trimRate(o.rate)} kg a week`
        : diff < 0
          ? `${f1(togo)} kg to gain at ${trimRate(o.rate)} kg a week`
          : 'Keep your current weight',
    kcalWhy: `Based on a ${pace} pace and ${ACTP[o.activity]}`,
    proG: pro + ' g',
    carbG: carb + ' g',
    fatG: fat + ' g',
    proW: (pro * 4) / tot,
    carbW: (carb * 4) / tot,
    fatW: (fat * 9) / tot,
    workLine: `${n}× a week · ${mn} min · Pilates and strength`,
    dA: day(0),
    dB: day(1),
    dC: day(2),
    wkA: `${mn} min · Mat`,
    wkB: `${mn} min · Wall`,
    wkC: `${mn} min · Mat`,
    toneLine: ['Gentle', 'Balanced', 'Direct'][o.tone] + ' · Check-in every Sunday',
  };
}

export function derive(o: Onb) {
  const cur = o.current ?? 68,
    diff = cur - o.target,
    togo = Math.abs(diff),
    weeks = Math.max(1, togo / o.rate);
  const d = TODAY();
  d.setDate(d.getDate() + Math.round(weeks * 7));
  const date = `${MONTHS[d.getMonth()]} ${d.getDate()}` + (d.getFullYear() > 2027 ? ', ' + d.getFullYear() : '');
  const PX = 280 / 26,
    x = 10 + Math.min(26, weeks) * PX,
    dx = x - 10;
  const y0 = diff > 0 ? 30 : diff < 0 ? 120 : 75,
    y1 = diff > 0 ? 120 : diff < 0 ? 30 : 75,
    dy = y1 - y0;
  const curve = `M10 ${y0} C${(10 + dx * 0.3).toFixed(1)} ${(y0 + dy * 0.7).toFixed(1)}, ${(10 + dx * 0.6).toFixed(1)} ${y1}, ${x.toFixed(1)} ${y1}`;
  const area = diff > 0 ? curve + ` L${x.toFixed(1)} 132 L10 132 Z` : curve + ` L290 ${y1} L290 132 L10 132 Z`;
  const kcal = Math.round((2450 - o.rate * 1100 + (o.activity - 1) * 180 - (o.sex === 0 ? 250 : o.sex === 2 ? 120 : 0)) / 10) * 10;
  const n = o.days.length,
    mn = o.minutes;
  return {
    diff,
    weeks,
    goalDateObj: d,
    target: f1(o.target),
    togo: diff > 0 ? `${f1(togo)} kg to lose` : diff < 0 ? `${f1(togo)} kg to gain` : 'Maintain your weight',
    rate: trimRate(o.rate),
    paceLabel: o.rate < 0.35 ? 'Gentle · Easy to sustain' : o.rate <= 0.7 ? 'Steady · Recommended' : 'Fast · Harder to keep up',
    endX: x,
    endY: y1,
    startY: y0,
    labelX: Math.max(48, Math.min(290, 16 + x)),
    labelY: diff < 0 ? 16 + y1 + 16 : 16 + y1 - 16,
    labelBelow: diff < 0,
    endLabel: date,
    curve,
    area,
    tail: `M${x.toFixed(1)} ${y1} L290 ${y1}`,
    yHi: f1(Math.max(cur, o.target)),
    yLo: f1(Math.min(cur, o.target)),
    curW: f1(cur),
    current: f1(cur),
    kcalN: kcal,
    kcal: commas(kcal),
    actTitle: ACT[o.activity][0],
    actDesc: ACT[o.activity][1],
    daysN: String(n),
    daysWord: n === 1 ? 'day a week' : 'days a week',
    daysList:
      o.days
        .slice()
        .sort()
        .map((i) => DN[i])
        .join(', ') + (n >= 3 && n <= 4 ? ' · a great balance' : n < 3 ? ' · 3–4 works best for your goal' : ' · remember to rest'),
    minutes: String(mn),
    minHint:
      (mn <= 10 ? 'A quick reset' : mn <= 20 ? 'Fits a lunch break' : mn <= 35 ? 'A full session' : 'A long session') +
      ` · about ${Math.max(3, Math.round(mn / 2.5))} exercises`,
    toneDesc: TONE[o.tone][0],
    ...plan(o, kcal, diff, togo, date, n, mn),
    goalLine: `${f1(o.target)} kg by ${date}`,
    planWork: `${n}× a week · ${mn} min`,
  };
}

export type Derived = ReturnType<typeof derive>;
