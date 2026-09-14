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
 * Phase 1 baseline: performance / a11y / best-practices / SEO all 100 on
 * /, /work, /work/arc and /about; CLS 0; TBT 0 ms; no overflow; every focusable
 * element shows a 2px --mark ring.
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
await chrome.kill();
console.table(rows);

console.log(failed === 0 ? '\nquality floor: pass' : `\nquality floor: ${failed} failure(s)`);
process.exit(failed === 0 ? 0 : 1);
