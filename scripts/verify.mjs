/**
 * Quality-floor check against a running `npm run preview` on :4321.
 *
 * Lighthouse (mobile), horizontal-overflow at 360/900/1440, and keyboard focus
 * visibility. The tools it needs pull a browser download, so they are NOT
 * project dependencies — install them only when you want to run this:
 *
 *   npm run build && npm run preview &
 *   npm i -D playwright lighthouse chrome-launcher
 *   node scripts/verify.mjs
 *
 * Phase 3 baseline: performance / a11y / best-practices / SEO all 100 on
 * /, /work, /work/arc and /about; CLS 0; no overflow; every focusable element
 * shows a 2px --mark ring; the hero entrance, the Chapter II settle and the
 * Chapter IV count-up all behave; and every bit of it is absent — including the
 * network requests for it — under prefers-reduced-motion.
 */
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const BASE = 'http://localhost:4321';
const CHROME = process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium';
const ROUTES = ['/', '/work', '/work/arc', '/about'];
const WIDTHS = [360, 900, 1440];
let failed = 0;

/* ── responsive: nothing may scroll the page sideways ────────────────── */
const browser = await chromium.launch({ executablePath: CHROME });
for (const route of ROUTES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    const over = await page.evaluate(() => {
      const d = document.documentElement;
      if (d.scrollWidth <= window.innerWidth + 1) return null;
      return [...document.querySelectorAll('*')]
        .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 4)
        .map((e) => e.tagName + '.' + (e.className?.baseVal ?? e.className))
        .join(' | ');
    });
    if (over) {
      console.log(`FAIL overflow ${route} @${width}: ${over}`);
      failed++;
    }
    await page.close();
  }
}

/* ── motion: present on /, and genuinely absent under reduce ─────────── */
const INK = 'rgb(22, 24, 26)';
const INK_SOFT = 'rgb(91, 96, 103)';
const scaleY = (el) => +new DOMMatrixReadOnly(getComputedStyle(el).transform).d.toFixed(2);

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const seen = [];
  page.on('request', (r) => seen.push(r.url()));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page
    .waitForFunction(() => document.documentElement.classList.contains('motion'), null, { timeout: 8000 })
    .catch(() => {
      console.log('FAIL motion never initialised on /');
      failed++;
    });

  // Mid-chapter: the rail must show partial progress and the active numeral ink.
  await page.evaluate(() => {
    const r = document.querySelector('#work').getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top + r.height * 0.5 - innerHeight / 2);
  });
  await page.waitForTimeout(1400);

  const state = await page.evaluate(
    ([scaleYSrc]) => {
      const sy = eval(scaleYSrc);
      const work = document.querySelector('#work');
      return {
        active: [...document.querySelectorAll('.chapter.is-active')].map((c) => c.id),
        fill: sy(work.querySelector('.rail-line-fill')),
        activeStroke: getComputedStyle(work.querySelector('.numeral')).webkitTextStrokeColor,
        idleStroke: getComputedStyle(document.querySelector('#intro .numeral')).webkitTextStrokeColor,
      };
    },
    [scaleY.toString()],
  );

  const checks = [
    [state.active.length === 1 && state.active[0] === 'work', `exactly one active chapter, got [${state.active}]`],
    [state.fill > 0 && state.fill < 1, `rail fill mid-progress, got ${state.fill}`],
    [state.activeStroke === INK, `active numeral inked, got ${state.activeStroke}`],
    [state.idleStroke === INK_SOFT, `idle numeral recedes to --ink-soft, got ${state.idleStroke}`],
  ];
  for (const [ok, msg] of checks) {
    if (!ok) {
      console.log('FAIL motion:', msg);
      failed++;
    }
  }
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const seen = [];
  page.on('request', (r) => seen.push(r.url()));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const fetched = seen.filter((u) => /lenis|gsap|ScrollTrigger/i.test(u));
  const quiet = await page.evaluate(
    ([scaleYSrc]) => {
      const sy = eval(scaleYSrc);
      const work = document.querySelector('#work');
      return {
        motion: document.documentElement.classList.contains('motion'),
        sticky: getComputedStyle(work.querySelector('.rail-sticky')).position,
        stroke: getComputedStyle(work.querySelector('.numeral')).webkitTextStrokeColor,
        fill: sy(work.querySelector('.rail-line-fill')),
      };
    },
    [scaleY.toString()],
  );

  const checks = [
    [!quiet.motion, 'html.motion must not be applied under reduce'],
    [fetched.length === 0, `motion libraries must not be fetched under reduce, got ${fetched.length}`],
    [quiet.sticky === 'sticky', `rail must still hold via CSS sticky, got ${quiet.sticky}`],
    [quiet.stroke === INK, `numerals must stay inked under reduce, got ${quiet.stroke}`],
    [quiet.fill === 0, `rail fill must stay collapsed under reduce, got ${quiet.fill}`],
  ];
  for (const [ok, msg] of checks) {
    if (!ok) {
      console.log('FAIL reduced-motion:', msg);
      failed++;
    }
  }
  await page.close();
}

/* ── Phase 3: entrance, settle, count-up ─────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: 'commit' });
  await page.waitForTimeout(200);

  // The entrance must be transform-only: opacity would delay the largest
  // contentful paint, and a fade is the generic default the brief rules out.
  const mid = await page.evaluate(() => {
    const n = document.querySelector('.name');
    return {
      ty: +new DOMMatrixReadOnly(getComputedStyle(n).transform).f.toFixed(1),
      opacity: getComputedStyle(n).opacity,
      masked: getComputedStyle(n.parentElement).overflow,
    };
  });
  if (!(mid.ty > 1)) { console.log(`FAIL hero: not mid-rise at 200ms (translateY ${mid.ty})`); failed++; }
  if (mid.opacity !== '1') { console.log(`FAIL hero: entrance uses opacity (${mid.opacity})`); failed++; }
  if (mid.masked !== 'hidden') { console.log(`FAIL hero: rise wrapper is not masked (${mid.masked})`); failed++; }

  await page.waitForTimeout(1800);
  const settledHero = await page.evaluate(() =>
    +new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.name')).transform).f.toFixed(1));
  if (Math.abs(settledHero) > 0.5) { console.log(`FAIL hero: did not settle (${settledHero})`); failed++; }

  await page.waitForFunction(() => document.documentElement.classList.contains('motion'), null, { timeout: 8000 })
    .catch(() => { console.log('FAIL motion never initialised'); failed++; });

  // Chapter II: the plate arrives oversized and settles under the scroll.
  const plateScale = () => page.evaluate(() =>
    +new DOMMatrixReadOnly(
      getComputedStyle(document.querySelector('.entry .plate img')).transform).a.toFixed(3));
  const park = (frac) => page.evaluate((f) => {
    const e = document.querySelector('.entry');
    window.scrollTo(0, window.scrollY + e.getBoundingClientRect().top - innerHeight * f);
  }, frac);

  await park(0.88); await page.waitForTimeout(1200);
  const entering = await plateScale();
  await park(0.25); await page.waitForTimeout(1400);
  const rested = await plateScale();
  const isSettled = await page.evaluate(() => document.querySelector('.entry').classList.contains('is-settled'));

  if (!(entering > 1.02)) { console.log(`FAIL settle: plate does not enter oversized (${entering})`); failed++; }
  if (!(rested <= 1.005)) { console.log(`FAIL settle: plate does not reach rest (${rested})`); failed++; }
  if (!isSettled) { console.log('FAIL settle: entry never marked settled'); failed++; }

  // Chapter IV: counts, lands on the real values, never repeats.
  const figures = () => page.evaluate(() =>
    [...document.querySelectorAll('.figure .value')].map((e) => e.textContent).join(','));
  await page.evaluate(() => document.querySelector('#proof').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(200);
  const mid4 = await figures();
  await page.waitForTimeout(1800);
  const end4 = await figures();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector('#proof').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(250);
  const replay = await figures();

  if (end4 !== '1,12,6') { console.log(`FAIL count-up: wrong final values (${end4})`); failed++; }
  if (mid4 === end4) { console.log('FAIL count-up: snapped instead of counting'); failed++; }
  if (replay !== '1,12,6') { console.log(`FAIL count-up: replayed on re-entry (${replay})`); failed++; }
  await page.close();
}

{
  // Under reduce the page must be the static build, in full, with nothing armed.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const st = await page.evaluate(() => {
    const n = document.querySelector('.name');
    const e = document.querySelector('.entry');
    return {
      armed: document.documentElement.classList.contains('motion-pending'),
      heroTy: +new DOMMatrixReadOnly(getComputedStyle(n).transform).f.toFixed(1),
      heroVisible: n.getBoundingClientRect().height > 20,
      plate: +new DOMMatrixReadOnly(getComputedStyle(e.querySelector('.plate img')).transform).a.toFixed(3),
      title: getComputedStyle(e.querySelector('.title a')).color,
      figures: [...document.querySelectorAll('.figure .value')].map((x) => x.textContent).join(','),
    };
  });
  const checks = [
    [!st.armed, 'hero entrance must not be armed under reduce'],
    [st.heroTy === 0 && st.heroVisible, `hero must sit in place, got translateY ${st.heroTy}`],
    [st.plate === 1, `plate must be at rest, got scale ${st.plate}`],
    [st.title === 'rgb(22, 24, 26)', `entry text must stay inked, got ${st.title}`],
    [st.figures === '1,12,6', `figures must show real values, got ${st.figures}`],
  ];
  for (const [ok, msg] of checks) {
    if (!ok) { console.log('FAIL reduced-motion:', msg); failed++; }
  }
  await page.close();
}

/* ── keyboard: every focusable element shows a ring ──────────────────── */
const page = await browser.newPage({ viewport: { width: 1440, height: 700 } });
await page.goto(BASE, { waitUntil: 'networkidle' });
for (let i = 0; i < 12; i++) {
  await page.keyboard.press('Tab');
  const ok = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement);
    return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
  });
  if (!ok) {
    console.log(`FAIL focus ring missing at tab stop ${i + 1}`);
    failed++;
  }
}
await browser.close();

/* ── lighthouse, mobile ──────────────────────────────────────────────── */
const chrome = await chromeLauncher.launch({
  chromePath: CHROME,
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
const rows = [];
for (const route of ROUTES) {
  const { lhr } = await lighthouse(BASE + route, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2.625, disabled: false },
    throttlingMethod: 'simulate',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  const score = (k) => Math.round(lhr.categories[k].score * 100);
  const row = {
    route,
    perf: score('performance'),
    a11y: score('accessibility'),
    bp: score('best-practices'),
    seo: score('seo'),
    LCP: lhr.audits['largest-contentful-paint'].displayValue,
    CLS: lhr.audits['cumulative-layout-shift'].displayValue,
  };
  rows.push(row);
  if (row.perf < 95) {
    console.log(`FAIL performance ${route}: ${row.perf} (floor is 95)`);
    failed++;
  }
}
chrome.kill();
console.table(rows);

console.log(failed === 0 ? '\nquality floor: pass' : `\nquality floor: ${failed} failure(s)`);
process.exit(failed === 0 ? 0 : 1);
