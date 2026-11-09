// Unit tests for the derive()/plan() port (src/logic/derive.ts).
// Run with `npm test` (Node 22.6+ strips the TypeScript types natively).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEF, derive } from '../src/logic/derive.ts';

const d = (o = {}) => derive({ ...DEF, ...o });

test('defaults match the handoff: 62 kg by Jan 27, 1,650 kcal, P110 C190 F50', () => {
  const v = d();
  assert.equal(v.goalBig, '62 kg');
  assert.equal(v.goalDate, 'by Jan 27');
  assert.equal(v.kcal, '1,650');
  assert.equal(v.proG, '110 g');
  assert.equal(v.carbG, '190 g');
  assert.equal(v.fatG, '50 g');
  assert.equal(v.togo, '6 kg to lose');
  assert.equal(v.goalSub, '6 kg to lose at 0.5 kg a week');
  assert.equal(v.kcalWhy, 'Based on a steady pace and a lightly active day');
  assert.equal(v.workLine, '3× a week · 20 min · Pilates and strength');
  assert.equal(v.toneLine, 'Balanced · Check-in every Sunday');
});

test('pace chart geometry matches the prototype markup', () => {
  const v = d();
  assert.equal(v.curve, 'M10 30 C48.8 93.0, 87.5 120, 139.2 120');
  assert.equal(v.area, 'M10 30 C48.8 93.0, 87.5 120, 139.2 120 L139.2 132 L10 132 Z');
  assert.equal(v.tail, 'M139.2 120 L290 120');
  assert.equal(v.yHi, '68');
  assert.equal(v.yLo, '62');
  assert.ok(Math.abs(v.labelX - 155.23) < 0.01);
  assert.equal(v.labelY, 120);
  assert.equal(v.labelBelow, false);
});

test('gaining weight flips the curve and puts the label below the point', () => {
  const v = d({ target: 75 });
  assert.equal(v.togo, '7 kg to gain');
  assert.equal(v.startY, 120);
  assert.equal(v.endY, 30);
  assert.equal(v.labelBelow, true);
  assert.ok(v.area.endsWith('L290 30 L290 132 L10 132 Z'));
});

test('maintaining weight has no date and a flat line', () => {
  const v = d({ target: 68 });
  assert.equal(v.togo, 'Maintain your weight');
  assert.equal(v.goalDate, '');
  assert.equal(v.goalSub, 'Keep your current weight');
  assert.equal(v.startY, 75);
  assert.equal(v.endY, 75);
});

test('kcal formula: rate, activity and sex', () => {
  // round10(2450 − rate·1100 + (activity−1)·180 − sexAdj)
  assert.equal(d({ rate: 1 }).kcalN, 1100);
  assert.equal(d({ activity: 3 }).kcalN, 2010);
  assert.equal(d({ sex: 1 }).kcalN, 1900);
  assert.equal(d({ sex: 2 }).kcalN, 1780);
  assert.equal(d({ rate: 0.25 }).kcalN, 1930);
});

test('macros: protein from target, fat 28% of kcal, carbs fill the rest (multiples of 5)', () => {
  const v = d({ target: 70, rate: 0.75, activity: 2, sex: 1 });
  assert.equal(v.pro, 125); // 70·1.8 = 126 → 125
  assert.equal(v.pro % 5 + v.fat % 5 + v.carb % 5, 0);
  assert.ok(Math.abs(v.proW + v.carbW + v.fatW - 1) < 1e-9);
});

test('pace labels switch at 0.35 and 0.7', () => {
  assert.equal(d({ rate: 0.3 }).paceLabel, 'Gentle · Easy to sustain');
  assert.equal(d({ rate: 0.35 }).paceLabel, 'Steady · Recommended');
  assert.equal(d({ rate: 0.7 }).paceLabel, 'Steady · Recommended');
  assert.equal(d({ rate: 0.75 }).paceLabel, 'Fast · Harder to keep up');
});

test('workout days copy', () => {
  assert.equal(d().daysList, 'Mon, Wed, Fri · a great balance');
  assert.equal(d({ days: [4] }).daysList, 'Fri · 3–4 works best for your goal');
  assert.equal(d({ days: [4] }).daysWord, 'day a week');
  assert.equal(d({ days: [0, 1, 2, 3, 4] }).daysList, 'Mon, Tue, Wed, Thu, Fri · remember to rest');
  // first week uses the sorted days
  const v = d({ days: [5, 1, 3] });
  assert.deepEqual([v.dA, v.dB, v.dC], ['Tue', 'Thu', 'Sat']);
});

test('session length hints', () => {
  assert.equal(d({ minutes: 5 }).minHint, 'A quick reset · about 3 exercises');
  assert.equal(d({ minutes: 20 }).minHint, 'Fits a lunch break · about 8 exercises');
  assert.equal(d({ minutes: 30 }).minHint, 'A full session · about 12 exercises');
  assert.equal(d({ minutes: 60 }).minHint, 'A long session · about 24 exercises');
});

test('dates past 2027 include the year', () => {
  const v = d({ current: 150, target: 40, rate: 0.25 });
  assert.match(v.endLabel, /, 20(2[89]|3\d)$/);
});
