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
 * Phase 2 baseline: performance / a11y / best-practices / SEO all 100 on
 * /, /work, /work/arc and /about; CLS 0; no overflow; every focusable element
 * shows a 2px --mark ring; motion initialises on / and is entirely absent —
 * including the network requests for it — under prefers-reduced-motion.
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
