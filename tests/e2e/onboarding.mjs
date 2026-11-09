import { open, check } from './lib.mjs';

const W = +(process.env.W || 1440), H = +(process.env.H || 800), MOBILE = process.env.MOBILE === '1';
const R = [];
const t = await open({ width: W, height: H, mobile: MOBILE });
const { page, wait, go, text, has, waitText, box, tap, drag, path, errors } = t;
const after = (s, re) => {
  const i = s.indexOf(re);
  return s.slice(i + re.length).trim().split('\n').map((x) => x.trim()).filter(Boolean);
};
try {
  await go('/');
  check(R, 'root redirects to onboarding', (await path()) === '/onboarding/0', await path());
  await waitText('Get started');
  await tap('Get started');
  check(R, 'O01 reached', (await path()) === '/onboarding/1');
  // continue button inside viewport
  const c = await box('Continue');
  check(R, 'Continue visible in viewport', c && c.bottom <= H, JSON.stringify(c && { bottom: Math.round(c.bottom), H }));
  await tap('Get stronger');
  await tap('Continue');
  // O02 ruler: drag 80 layout pts to the left = +1 kg
  await waitText("What's your current weight?");
  const scale = await page.evaluate(() => {
    const el = document.querySelector('[aria-label="Weight"]');
    const b = el.getBoundingClientRect();
    return b.width / el.offsetWidth;
  });
  const rb = await box('Weight', { label: true });
  const val = async () => after(await text(), 'You can update it anytime.')[0];
  const v0 = await val();
  await drag(rb.x, rb.y, rb.x - 80 * scale, rb.y, { hold: 150 });
  const v1 = await val();
  check(R, 'O02 ruler +1 kg for 80pt drag (scaled frame)', v0 === '68' && v1 === '69', `scale=${scale.toFixed(3)} ${v0} -> ${v1}`);
  await drag(rb.x, rb.y, rb.x + 80 * scale, rb.y, { hold: 150 });
  check(R, 'O02 ruler back to 68', (await val()) === '68', await val());
  // flick: fast release should move with inertia, stay within range
  await drag(rb.x, rb.y, rb.x + 120 * scale, rb.y, { steps: 6, ms: 60, hold: 0 });
  await wait(1200);
  const vf = +(await val());
  check(R, 'O02 flick inertia stays in 40–150 and moves further than drag', vf >= 40 && vf < 66.5, String(vf));
  for (let k = 0; k < 4 && (await val()) !== '68'; k++) {
    const cur = +(await val());
    await drag(rb.x, rb.y, rb.x - (68 - cur) * 80 * scale, rb.y, { steps: 40, ms: 900, hold: 200 });
  }
  check(R, 'O02 restored to 68', (await val()) === '68', await val());
  await tap('Continue');
  // O03
  await waitText("What's your target weight?");
  check(R, 'O03 subtitle uses current weight', (await text()).includes('You weigh 68 kg today.'));
  check(R, 'O03 shows 6 kg to lose', await has('6 kg to lose'));
  await tap('Continue');
  // O04 pace
  await waitText('How fast do you want to get there?');
  check(R, 'O04 Jan 27 / 1,650', (await has('Jan 27')) && (await has('1,650')));
  const sb = await box('Pace', { label: true });
  await drag(sb.left + sb.w * 0.34, sb.y, sb.right - 2, sb.y);
  check(R, 'O04 slider to max → 1 kg/week, Fast', (await has('Fast · Harder to keep up')) && after(await text(), 'How fast do you want to get there?')[0] === '1', after(await text(), 'How fast do you want to get there?').slice(0, 3).join('|'));
  check(R, 'O04 kcal follows rate (1,100)', await has('1,100'), (await text()).match(/About\s*([\d,]+)/)?.[1]);
  await drag(sb.right - 2, sb.y, sb.left + sb.w / 3, sb.y);
  check(R, 'O04 back to 0.5 / Jan 27', (await has('Steady · Recommended')) && (await has('Jan 27')));
  await tap('Continue');
  // O05 bars: tap 3rd bar
  await waitText('How active is your day?');
  check(R, 'O05 default Lightly active', await has('Lightly active'));
  await tap('Continue');
  // O06 days: toggle Tue on and off
  await waitText('Which days can you work out?');
  check(R, 'O06 default copy', await has('Mon, Wed, Fri · a great balance'));
  const pills = await page.evaluate(() => [...document.querySelectorAll('[role=checkbox]')].map((e) => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }));
  check(R, 'O06 seven day pills', pills.length === 7, String(pills.length));
  await t.tapAt(pills[1].x, pills[1].y); await wait(500);
  check(R, 'O06 add Tue → 4 days', await has('Mon, Tue, Wed, Fri · a great balance'));
  await t.tapAt(pills[1].x, pills[1].y); await wait(300);
  await t.tapAt(pills[0].x, pills[0].y); await wait(300); await t.tapAt(pills[2].x, pills[2].y); await wait(300);
  check(R, 'O06 single day copy', await has('Fri · 3–4 works best for your goal') && await has('day a week'));
  await t.tapAt(pills[4].x, pills[4].y); await wait(400);
  check(R, 'O06 last day cannot be turned off', await has('Fri · 3–4 works best for your goal'));
  await t.tapAt(pills[0].x, pills[0].y); await wait(300); await t.tapAt(pills[2].x, pills[2].y); await wait(400);
  check(R, 'O06 restored Mon/Wed/Fri', await has('Mon, Wed, Fri · a great balance'));
  await tap('Continue');
  // O07 dial: tap at 9 o'clock → 45 min, then back to 20 (4 o'clock)
  await waitText('How long per session?');
  const dl = await box('Session length', { label: true });
  const r = (118 / 280) * dl.w;
  await drag(dl.x - r, dl.y, dl.x - r, dl.y + 1, { steps: 2, ms: 40 });
  check(R, 'O07 dial 9 o’clock → 45 (scaled)', await has('A long session · about 18 exercises'), (await text()).match(/(\d+)\s*minutes/)?.[1]);
  // walk the knob back along the ring to 4 o'clock (20 min)
  const pts = [];
  for (let a = 270; a >= 30; a -= 10) pts.push(a);
  const pos = (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [dl.x + r * Math.cos(rad), dl.y + r * Math.sin(rad)];
  };
  // angle measured clockwise from 12 o'clock: 20 min = 120°, 45 min = 270°
  await page.mouse.move(...pos(270));
  await page.mouse.down();
  for (let a = 270; a >= 120; a -= 6) {
    await page.mouse.move(...pos(a));
    await wait(16);
  }
  await page.mouse.up();
  await wait(500);
  check(R, 'O07 dial back to 20', await has('Fits a lunch break · about 8 exercises'), (await text()).match(/(\d+)\s*minutes/)?.[1]);
  await tap('Continue');
  await waitText('What do you enjoy?');
  await tap('Continue');
  await waitText('What do you have at home?');
  await tap('Continue');
  // O10 swipe cards
  await waitText('How do you like to eat?');
  const card = await box('No preference');
  await drag(card.x + 60, card.y - 120, card.x - 200, card.y - 118);
  check(R, 'O10 swipe → Vegetarian centered', await page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((d) => d.childElementCount === 0 && d.textContent.trim() === 'Vegetarian');
    if (!el) return false;
    const b = el.getBoundingClientRect();
    return Math.abs(b.left + b.width / 2 - innerWidth / 2) < 140;
  }));
  // tap the side card on the left (No preference) to bring it back
  // the left card peeks ~50pt inside the phone: tap there
  const cx = (await page.evaluate(() => innerWidth)) / 2;
  const cy = (await box('Swipe to choose.')).y + 220 * scale;
  await t.tapAt(cx - 170 * scale, cy); await wait(900);
  check(R, 'O10 tap side card → No preference centered', await page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((d) => d.childElementCount === 0 && d.textContent.trim() === 'No preference');
    const b = el.getBoundingClientRect();
    return Math.abs(b.left + b.width / 2 - innerWidth / 2) < 140;
  }));
  await tap('Continue');
  // O11 wheels
  await waitText('A bit about you');
  const hw = await box('Height', { label: true });
  await drag(hw.x, hw.y + 20, hw.x, hw.y + 20 - 3 * 36 * scale, { hold: 200 });
  check(R, 'O11 height wheel +3 → 168 cm', await page.evaluate(() => [...document.querySelectorAll('div')].some((d) => d.childElementCount === 0 && d.textContent.trim() === '168 cm' && getComputedStyle(d).fontWeight === '600')));
  await drag(hw.x, hw.y + 20, hw.x, hw.y + 20 + 3 * 36 * scale, { hold: 200 });
  await tap('Male');
  await tap('Female');
  await tap('Continue');
  // O12 tone
  await waitText('How should your coach talk to you?');
  await tap('Direct', { after: 1200 });
  check(R, 'O12 Direct reply', await has("That's two skipped this week."));
  await tap('Balanced', { after: 1200 });
  await tap('Continue');
  await waitText('Stay on track');
  await tap('Turn on reminders');
  await waitText('Connect Apple Health');
  await tap('Not now');
  await waitText('Building your plan');
  await waitText('Your plan is ready', 6000);
  check(R, 'O16 reached automatically', (await path()) === '/onboarding/16');
  const tx = await text();
  check(R, 'O16 plan 62 kg by Jan 27, 1,650 kcal, 110/190/50', ['62 kg', 'by Jan 27', '6 kg to lose at 0.5 kg a week', '110 g', '190 g', '50 g', 'Based on a steady pace and a lightly active day', '3× a week · 20 min · Pilates and strength', 'Balanced · Check-in every Sunday'].every((s) => tx.includes(s)));
  await wait(900);
  check(R, 'O16 kcal count-up finished at 1,650', (await text()).includes('1,650'));
  // edit goal → O03 → Continue returns to O16
  await tap('Goal');
  check(R, 'O16 Goal edit → O03', (await path()) === '/onboarding/3', await path());
  await tap('Continue');
  check(R, 'O03 Continue returns to O16', (await path()) === '/onboarding/16', await path());
  // Adjust answers → O01 with a clean history (Back goes to O00)
  await tap('Adjust answers', { after: 1200 });
  check(R, 'Adjust answers → O01', (await path()) === '/onboarding/1', await path());
  await tap('Back', { label: true, after: 1000 });
  check(R, 'Back from O01 after adjust → O00', (await path()) === '/onboarding/0', await path());
  await go('/onboarding/16');
  await waitText('Your plan is ready');
  await tap('Start my plan');
  await waitText('Save your plan');
  await tap('Continue with Apple', { after: 1500 });
  check(R, 'O17 → Today', (await path()) === '/', await path());
  check(R, 'Today numbers', (await has('810')) && (await has('kcal left of 1,650')) && (await has('50 g protein to go today.')));
  await go('/');
  check(R, 'reload after onboarding stays on Today', (await path()) === '/' && (await has('Good morning,')));
} catch (e) {
  check(R, 'scenario crashed', false, String(e));
}
check(R, 'no console errors', errors.length === 0, errors.slice(0, 6).join('\n'));
await t.browser.close();
console.log(`\n${R.filter((r) => r.ok).length}/${R.length} passed`);
process.exitCode = R.every((r) => r.ok) ? 0 : 1;
