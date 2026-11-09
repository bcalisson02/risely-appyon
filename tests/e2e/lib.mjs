import puppeteer from 'puppeteer-core';

// E2E harness: real mouse/touch input through Chrome DevTools (puppeteer-core + an installed Chrome).
// BASE = app URL (dev server or deployed build). CHROME = path to Chrome if not in the default location.
export const BASE = process.env.BASE || 'http://localhost:8081';
const CHROME =
  process.env.CHROME ||
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome');

export async function open({ width = 1440, height = 800, mobile = false } = {}) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-first-run', '--disable-gpu'] });
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  if (process.env.RM === '1') await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      const t = m.text();
      if (!/React DevTools|Download the React|deprecated|shadow\*|props.pointerEvents/i.test(t)) errors.push(`[${m.type()}] ${t.slice(0, 300)}`);
    }
  });
  page.on('pageerror', (e) => errors.push('[pageerror] ' + String(e).slice(0, 300)));
  const h = helpers(page, mobile);
  return { browser, page, errors, ...h };
}

function helpers(page, mobile) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const go = async (path) => {
    await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 90000 });
    await wait(1200);
  };
  const text = () => page.evaluate(() => document.body.innerText);
  const has = async (s) => (await text()).includes(s);
  const waitText = async (s, ms = 8000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (await has(s)) return true;
      await wait(150);
    }
    throw new Error('timeout waiting for text: ' + s);
  };
  // box of the innermost visible element whose own text is exactly s (or aria-label)
  const box = async (s, { label = false, last = false } = {}) => {
    const r = await page.evaluate(
      (s, label, last) => {
        const vis = (el) => {
          const b = el.getBoundingClientRect();
          const st = getComputedStyle(el);
          if (!(b.width > 0 && b.height > 0 && st.visibility !== 'hidden' && b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth)) return false;
          const top = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, b.left + b.width / 2)), Math.min(innerHeight - 1, Math.max(0, b.top + b.height / 2)));
          return !!top && (el === top || el.contains(top) || (top.contains(el) && getComputedStyle(el).pointerEvents === 'none'));
        };
        let els;
        if (label) els = [...document.querySelectorAll(`[aria-label="${s}"]`)];
        else els = [...document.querySelectorAll('div,span,button,a')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() === s) || (e.childElementCount === 0 && e.textContent.trim() === s));
        const all = els;
        els = els.filter(vis);
        if (!els.length && all.length) {
          // like a user: scroll the (horizontal or vertical) container to reveal it
          all[0].scrollIntoView({ block: 'nearest', inline: 'nearest' });
          for (let p = all[0].parentElement; p; p = p.parentElement) {
            const cs = getComputedStyle(p);
            if (/(auto|scroll)/.test(cs.overflowX) && p.scrollWidth > p.clientWidth) {
              const eb = all[0].getBoundingClientRect(), pb = p.getBoundingClientRect();
              if (eb.right > pb.right) p.scrollLeft += eb.right - pb.right + 16;
              if (eb.left < pb.left) p.scrollLeft -= pb.left - eb.left + 16;
            }
            if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight) {
              const eb = all[0].getBoundingClientRect(), pb = p.getBoundingClientRect();
              if (eb.bottom > pb.bottom) p.scrollTop += eb.bottom - pb.bottom + 16;
              if (eb.top < pb.top) p.scrollTop -= pb.top - eb.top + 16;
            }
          }
          els = all.filter(vis);
        }
        if (!els.length) return null;
        const el = last ? els[els.length - 1] : els[0];
        const b = el.getBoundingClientRect();
        return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height, top: b.top, bottom: b.bottom, left: b.left, right: b.right };
      },
      s,
      label,
      last
    );
    return r;
  };
  const tapAt = async (x, y) => {
    if (mobile) await page.touchscreen.tap(x, y);
    else {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await wait(40);
      await page.mouse.up();
    }
  };
  const tap = async (s, opts = {}) => {
    let b = await box(s, opts);
    // let any scroll the lookup triggered settle, then measure again
    await wait(350);
    b = (await box(s, opts)) || b;
    if (!b) throw new Error('not found/visible: ' + s);
    await tapAt(b.x, b.y);
    await wait(opts.after ?? 700);
    return b;
  };
  const drag = async (x1, y1, x2, y2, { steps = 24, ms = 420, hold = 120 } = {}) => {
    if (mobile) {
      await page.touchscreen.touchStart(x1, y1);
      for (let i = 1; i <= steps; i++) {
        await page.touchscreen.touchMove(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps);
        await wait(ms / steps);
      }
      await wait(hold);
      await page.touchscreen.touchEnd();
    } else {
      await page.mouse.move(x1, y1);
      await page.mouse.down();
      for (let i = 1; i <= steps; i++) {
        await page.mouse.move(x1 + ((x2 - x1) * i) / steps, y1 + ((y2 - y1) * i) / steps);
        await wait(ms / steps);
      }
      await wait(hold);
      await page.mouse.up();
    }
    await wait(600);
  };
  const path = () => page.evaluate(() => location.pathname);
  const shot = (file) => page.screenshot({ path: file });
  return { wait, go, text, has, waitText, box, tap, tapAt, drag, path, shot };
}

export function check(results, name, ok, info = '') {
  results.push({ name, ok: !!ok, info });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`);
}
