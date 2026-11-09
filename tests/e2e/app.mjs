import { createRequire } from 'module';
import { open, check } from './lib.mjs';

const require = createRequire(import.meta.url);

const W = +(process.env.W || 1440), H = +(process.env.H || 900), MOBILE = process.env.MOBILE === '1';
const R = [];
const t = await open({ width: W, height: H, mobile: MOBILE });
const { page, wait, go, text, has, waitText, box, tap, path, errors } = t;
const left = async () => (await text()).match(/([\d,]+)\s*\n\s*kcal left/)?.[1];
const L = { label: true };
try {
  await go('/onboarding/0');
  await waitText('I already have an account');
  await tap('I already have an account', { after: 1500 });
  check(R, 'existing account → Today', (await path()) === '/');

  // ---------- Nutrition
  await tap('Nutrition', { ...L, after: 1800 });
  check(R, 'tab → /nutrition', (await path()) === '/nutrition', await path());
  check(R, 'N1 810 left', (await left()) === '810', await left());
  await tap('Calendar', { ...L, after: 600 });
  check(R, 'calendar → Coming soon toast', await has('Coming soon'));
  await wait(2600);
  check(R, 'Coming soon hides after ~2 s', !(await has('Coming soon')));

  await tap('Log food', { ...L, after: 1200 });
  check(R, 'N2 sheet opens', (await path()) === '/log-food' && (await has('Adding to')));
  await tap('Quick add calories', { after: 600 });
  check(R, 'Quick add → Coming soon', await has('Coming soon'));
  await tap('Add Overnight oats', { ...L, after: 500 });
  check(R, 'Recent + toggles to ✓', !!(await box('Remove Overnight oats', L)));
  await tap('Close', { ...L, last: true, after: 1200 });
  check(R, 'sheet closes to N1', (await path()) === '/nutrition', await path());
  await wait(1200);
  check(R, 'oats added: 500 left, no toast', (await left()) === '500' && !(await has('Added to dinner')), await left());
  await tap('Log food', { ...L, after: 1200 });
  check(R, 'reopened sheet remembers ✓', !!(await box('Remove Overnight oats', L)));
  await tap('Remove Overnight oats', { ...L, after: 500 });
  await tap('Close', { ...L, last: true, after: 1500 });
  check(R, 'oats removed: 810 left', (await left()) === '810', await left());

  await tap('Log food', { ...L, after: 1200 });
  await tap('Scan a meal', { after: 1500 });
  check(R, 'N3 camera', (await path()) === '/scan' && (await has('Fit your whole plate in the frame')));
  await tap('Barcode', { after: 300 });
  await tap('Meal', { after: 300 });
  await tap('Take photo', { ...L, after: 600 });
  check(R, 'N4 analyzing', await has('Analyzing your meal'));
  await waitText('Teriyaki chicken bowl', 5000);
  check(R, 'N5 result after ~2.9 s', await has('Estimated from photo · Dinner'));
  await tap('Add to dinner', { after: 1400 });
  check(R, 'N5 → N7 on /nutrition', (await path()) === '/nutrition', await path());
  check(R, 'N7 toast', (await has('Added to dinner')) && (await has('· 628 kcal')));
  const tx7 = await text();
  check(R, 'N7 numbers 182 / 1,678 / 106 167 48', (await left()) === '182' && tx7.includes('1,678') && /106\s*\/110g/.test(tx7) && /167\s*\/190g/.test(tx7) && /48\s*\/50g/.test(tx7), (await left()) + ' ' + (tx7.match(/Protein\s*([\s\S]{0,20})/)?.[1] || '').replace(/\n/g, ' '));
  check(R, 'N7 dinner row', tx7.includes('Teriyaki chicken bowl') && tx7.includes('628'));
  await tap('Undo', { after: 1500 });
  await wait(800);
  check(R, 'Undo → back to 810', (await left()) === '810' && (await has('Add dinner')), await left());

  await tap('Log food', { ...L, after: 1200 });
  await tap('Search food', { after: 1500 });
  check(R, 'N6 search', (await path()) === '/search-food' && (await has('Avocado, half')) && (await has('1 item')));
  await tap('Add Guacamole', { ...L, after: 400 });
  check(R, 'N6 2 items · 130 kcal', await has('2 items') && (await has('· 130 kcal to Dinner')));
  await tap('Done', { after: 1300 });
  check(R, 'N6 Done → 680 left + toast', (await left()) === '680' && (await has('Added to dinner')), await left());
  await tap('Undo', { after: 1500 });
  await wait(800);
  check(R, 'Undo removes both → 810', (await left()) === '810', await left());

  // ---------- Today
  await tap('Today', { ...L, after: 1500 });
  check(R, 'Today tab', (await path()) === '/' && (await has('kcal left of 1,650')));
  await tap('Dinner ideas', { after: 1800 });
  check(R, 'Today Dinner ideas → coach asks dinner', (await path()) === '/coach' && (await has('What should I eat for dinner?')));
  await waitText('This one covers most of it:', 4500);
  await tap('Back', { ...L, after: 1500 });
  check(R, 'coach back → Today', (await path()) === '/', await path());
  await t.page.evaluate(() => {});
  await tap('Notifications', { ...L, after: 600 });
  check(R, 'bell → Coming soon', await has('Coming soon'));

  // ---------- Workouts
  await tap('Workouts', { ...L, after: 1500 });
  check(R, 'Workouts tab', (await path()) === '/workouts' && (await has('Popular this week')));
  await tap('Filters', { ...L, after: 1200 });
  check(R, 'W2 Show 9 workouts', await has('Show 9 workouts'));
  await tap('Reset', { after: 400 });
  check(R, 'Reset → Show 21', await has('Show 21 workouts'));
  await tap('20 min', { after: 300 });
  for (const c of ['Beginner', 'Mat', 'Wall', 'Core']) await tap(c, { after: 250 });
  check(R, 'filters back to 9', await has('Show 9 workouts'));
  await tap('Show 9 workouts', { after: 1500 });
  check(R, 'W3 Pilates', (await path()) === '/category' && (await has('9 workouts match your filters')));
  await tap('Remove filter Core', { ...L, after: 900 });
  check(R, 'remove capsule → 12', await has('12 workouts match your filters'));
  await tap('Back', { ...L, after: 1200 });
  check(R, 'W3 back → W1', (await path()) === '/workouts', await path());
  await tap('Yoga, 18 workouts', { ...L, after: 1300 });
  check(R, 'Yoga category consistent', (await has('Yoga')) && (await has('2 workouts match your filters')) && (await has('Morning Mobility')));
  await tap('Back', { ...L, after: 1200 });
  await tap('Full Body Pilates, Day 9 of 28', { ...L, after: 1500 });
  const tw = await text();
  check(R, 'W4 8 exercises incl. new two', ['8 exercises', 'Swan', 'Leg circles', 'Cool-down stretch'].every((s) => tw.includes(s)));
  await tap('Bookmark', { ...L, after: 500 });
  check(R, 'bookmark toggles', !!(await box('Remove bookmark', L)));
  await tap('Start workout', { after: 1800 });
  check(R, 'W5 session 3 of 8', (await path()) === '/session' && (await has('3 of 8')) && (await has('Glute bridge')));
  await tap('Pause', { ...L, after: 300 });
  const ta = (await text()).match(/\d:\d\d/)?.[0];
  await wait(2200);
  const tb = (await text()).match(/\d:\d\d/)?.[0];
  check(R, 'pause freezes timer', ta === tb, `${ta} ${tb}`);
  await tap('Resume', { ...L, after: 2300 });
  const tc = (await text()).match(/\d:\d\d/)?.[0];
  check(R, 'resume counts down', tc !== tb, `${tb} → ${tc}`);
  await tap('Sound', { ...L, after: 500 });
  check(R, 'sound → Coming soon', await has('Coming soon'));
  await tap('Next', { ...L, after: 1200 });
  check(R, 'W6 rest', (await has('3 of 8 done')) && (await has('Up next')));
  await tap('+15 s', { after: 400 });
  const rs = (await text()).match(/0:(\d\d)\s*\n\s*Rest/)?.[1];
  check(R, '+15 s adds time', +rs > 15, rs);
  await tap('Skip rest', { after: 1500 });
  check(R, 'W7 complete', (await has('Nice work, Sofia.')) && (await has('Day 9 is done.')) && (await has('20:14')));
  await tap('Too hard', { after: 300 });
  await tap('Share', { after: 500 });
  check(R, 'Share → Coming soon', await has('Coming soon'));
  await tap('Done', { after: 2000 });
  check(R, 'W7 Done → W1', (await path()) === '/workouts', await path());

  // ---------- Coach
  await tap('Coach', { ...L, after: 1500 });
  check(R, 'Coach modal reopens with the conversation', (await path()) === '/coach' && (await has('This one covers most of it:')));
  // conversation from Today is kept; ask Friday first to see C3 thinking
  await tap('More', { ...L, after: 300 });
  await page.type('textarea', 'What should I eat for dinner?');
  await tap('Send', { ...L, after: 500 });
  check(R, 'C3 thinking + stop', !!(await box('Coach is typing', L)) && !!(await box('Stop', L)));
  await wait(3000);
  check(R, 'second reply arrived', ((await text()).match(/This one covers most of it:/g) || []).length === 2);
  check(R, 'C2 reply quotes live numbers', await has('You have 810 kcal left and you’re 50 g short on protein.'));
  await wait(800);
  if (MOBILE) {
    // a phone user swipes the quick-reply row to reach the third chip
    const sq = await box('Something quicker');
    await t.drag(sq.x + 100, sq.y, sq.x - 150, sq.y, { steps: 12, ms: 300, hold: 0 });
    await wait(500);
  }
  await tap('Log it for me', { after: 800 });
  check(R, 'Log it for me → Logged, no generic reply', (await has('Logged')) && !(await has('I can help with meals')));
  await page.type('textarea', 'make friday shorter please');
  await tap('Send', { ...L, after: 2800 });
  await waitText('Express Pilates', 3000);
  await tap('Swap it', { after: 1300 });
  check(R, 'C4 swap → Friday updated + confirmation', (await has('Friday updated')) && (await has('Done. Friday is now Express Pilates, 10 minutes.')));
  await tap('Add a stretch', { after: 800 });
  check(R, 'C5 offline', (await has("You're offline")) && (await has('Not delivered.')) && !!(await box('Waiting for connection…', L)));
  await tap('Not delivered. Tap to retry', { ...L, after: 800 });
  check(R, 'retry → online', !(await has("You're offline")));
  await page.type('textarea', 'hello');
  await tap('Send', { ...L, after: 400 });
  await tap('Stop', { ...L, after: 3000 });
  check(R, 'Stop cancels the reply', !(await has('I can help with meals')));
  await tap('More', { ...L, after: 500 });
  check(R, 'More → Coming soon, chat kept', (await has('Coming soon')) && (await has('Express Pilates')));
  await tap('Back', { ...L, after: 1500 });
  check(R, 'coach back → previous tab', (await path()) === '/workouts', await path());
  await tap('Nutrition', { ...L, after: 1500 });
  check(R, 'coach Log reached nutrition (810 - 560 = 250)', (await left()) === '250', await left());

  // ---------- Refresh directly on every modal / sheet / push route
  const direct = [
    ['/scan', 'Close', '/nutrition'],
    ['/session', 'End workout', '/workout/fullbody'],
    ['/coach', 'Back', '/'],
    ['/log-food', 'Close', '/nutrition'],
    ['/filters', 'Close', '/workouts'],
    ['/category?name=Pilates', 'Back', '/workouts'],
    ['/workout/wallcore', 'Back', '/workouts'],
    ['/search-food', 'Cancel', '/nutrition'],
  ];
  for (const [p, b, to] of direct) {
    await go(p);
    await wait(500);
    try {
      if (b === 'Cancel') await tap(b, { after: 1500 });
      else await tap(b, { ...L, last: true, after: 1500 });
    } catch (e) {
      check(R, `refresh on ${p}: ${b}`, false, String(e));
      continue;
    }
    check(R, `refresh on ${p} → ${b} → ${to}`, (await path()) === to, await path());
  }
  await go('/scan');
  await tap('Take photo', { ...L, after: 600 });
  await waitText('Teriyaki chicken bowl', 5000);
  await tap('Add to dinner', { after: 2000 });
  check(R, 'refresh-scan Add → /nutrition', (await path()) === '/nutrition', await path());
  await page.goBack();
  await wait(1200);
  check(R, 'browser Back does not reopen the finished scan', (await path()) !== '/scan', await path());
} catch (e) {
  check(R, 'scenario crashed', false, String(e).slice(0, 300));
  await t.shot(require('os').tmpdir() + '/risely-e2e-crash.png');
}
check(R, 'no console errors', errors.length === 0, errors.slice(0, 8).join('\n'));
await t.browser.close();
console.log(`\n${R.filter((r) => r.ok).length}/${R.length} passed`);
process.exitCode = R.every((r) => r.ok) ? 0 : 1;
