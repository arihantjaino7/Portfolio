/**
 * Phase 1 — the motion engine core. REDESIGN.md §1, §2.
 *
 * Every later phase reaches for exactly four data attributes and never
 * hand-rolls a scroll animation:
 *
 *   [data-reveal="lines"]  a mask reveal for text. Wrap the content in
 *                          <Reveal> (src/components/Reveal.astro) to get the
 *                          overflow-hidden line markup; this module finds
 *                          `.reveal-line-inner` children and rises each one
 *                          from below its mask, staggered. Optional
 *                          `data-reveal-delay` (seconds) offsets the whole
 *                          group's start — e.g. a statement settling just
 *                          after the heading above it.
 *   [data-reveal="clip"]   a mask reveal for media. The element itself wipes
 *                          in via clip-path while its <img>/<video> settles
 *                          from a counter-scale, so it reads as pulled into
 *                          place rather than faded.
 *   [data-parallax]        drifts the element against scroll, scrubbed.
 *                          Optional attribute value sets the drift amount in
 *                          percent (default 8): `data-parallax="12"`.
 *   [data-count]           counts a number up from zero once, on enter. The
 *                          attribute value is the target: `data-count="12"`.
 *                          The element's static content must already be that
 *                          same final number (`<span data-count="12">12</span>`),
 *                          never a literal "0" — this module zeroes it itself
 *                          right before animating up. A reduced-motion reader
 *                          (or a crawler, or this bundle failing to load) gets
 *                          no JS at all, so the static content is the only
 *                          thing they ever see.
 *
 * The *hidden* half of the two reveal styles lives in global.css, gated on
 * `(prefers-reduced-motion: no-preference)` rather than a class this module
 * adds — so a reduced-motion reader always gets the finished static layout,
 * and GSAP is never even requested for them (see schedule() below).
 * This module only ever animates elements *out* of a state CSS already put
 * them in; it never decides what "hidden" looks like.
 *
 * Flipping the OS motion setting mid-session tears the whole engine down and,
 * if the reader turns motion back on, reschedules it from scratch.
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;

type Gsap = typeof import('gsap').default;
type ScrollTriggerT = typeof import('gsap/ScrollTrigger').ScrollTrigger;

let teardown: (() => void) | null = null;
let starting = false;

// ScrollTrigger only needs to be registered (done once in initMotion) for
// the `scrollTrigger:` option below to work — these three don't call it
// directly, unlike wireCounts.
function wireLineReveals(gsap: Gsap) {
  document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    const lines = el.querySelectorAll<HTMLElement>(':scope .reveal-line-inner');
    if (!lines.length) return;
    // Optional stagger-group offset — e.g. a statement line that should settle
    // just after the heading above it, without hand-rolling a one-off tween.
    const rawDelay = Number(el.dataset.revealDelay);
    const delay = Number.isFinite(rawDelay) && rawDelay > 0 ? rawDelay : 0;
    // `y: 0` is pinned alongside `yPercent` on both ends: global.css's hidden
    // state is a plain `transform: translateY(110%)`, and the browser reports
    // that back as an absolute matrix. GSAP decomposes it into its own pixel
    // `y` cache on first touch, which then composes *additively* with the
    // `yPercent` this tween drives — without pinning `y`, the element stalls
    // at that leftover pixel offset even once `yPercent` reaches 0.
    gsap.fromTo(
      lines,
      { yPercent: 110, y: 0 },
      {
        yPercent: 0,
        y: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.07,
        delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );
  });
}

function wireClipReveals(gsap: Gsap) {
  document.querySelectorAll<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
    const media = el.querySelector<HTMLElement>(':scope > img, :scope > video');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
    tl.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out' },
      0,
    );
    if (media) {
      tl.fromTo(media, { scale: 1.15 }, { scale: 1, duration: 0.9, ease: 'expo.out' }, 0);
    }
  });
}

function wireParallax(gsap: Gsap) {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const raw = Number(el.dataset.parallax);
    const amount = Number.isFinite(raw) && raw > 0 ? raw : 8;
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

function wireCounts(gsap: Gsap, ScrollTrigger: ScrollTriggerT) {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    if (!Number.isFinite(to)) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const counter = { v: 0 };
        el.textContent = '0';
        gsap.to(counter, {
          v: to,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => (el.textContent = String(Math.round(counter.v))),
          onComplete: () => (el.textContent = String(to)),
        });
      },
    });
  });
}

export async function initMotion() {
  if (teardown || starting) return;
  starting = true;

  if (reduce.matches) {
    starting = false;
    return;
  }

  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);

  // The setting can flip while those two are in flight.
  if (reduce.matches) {
    starting = false;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Lenis used to drive the scroll position here, with ScrollTrigger reading
  // through a scrollerProxy. It is gone: CSS scroll snapping works off native
  // scroll gestures, and a library that animates scrollTop from JS defeats it.
  // ScrollTrigger reads the real scroll position directly now, and in-page
  // links are plain anchor navigation again — global.css asks for smooth
  // behaviour where motion is allowed.

  const ctx = gsap.context(() => {
    wireLineReveals(gsap);
    wireClipReveals(gsap);
    wireParallax(gsap);
    wireCounts(gsap, ScrollTrigger);
  });

  root.classList.add('motion');
  // Every reveal now carries GSAP's own inline "from" state, so the CSS gate
  // has done its job and can go — which also disarms index.astro's failsafe.
  root.classList.remove('motion-pending');

  ScrollTrigger.refresh();
  // Webfonts land after first paint and change the height of everything.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  teardown = () => {
    root.classList.remove('motion', 'motion-pending');
    ctx.revert();
    // A reveal or count may have been interrupted mid-tween; ctx.revert()
    // clears GSAP's inline styles, so the reveal CSS's hidden state in
    // global.css would otherwise be left showing. Counts need their real
    // figure restored explicitly since motion.ts, not CSS, owns that text.
    document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
      el.textContent = el.dataset.count ?? el.textContent;
    });
  };
  starting = false;
}

function stop() {
  teardown?.();
  teardown = null;
}

// Nothing here is needed until the reader scrolls, and GSAP's parse cost
// competes with first paint if it runs eagerly. Yield until the main thread
// is free, with a ceiling so a reader who scrolls immediately isn't waiting
// on an idle callback that never comes.
function schedule() {
  if (reduce.matches) return;
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => initMotion(), { timeout: 1500 });
  } else {
    setTimeout(initMotion, 200);
  }
}

schedule();
reduce.addEventListener('change', () => (reduce.matches ? stop() : schedule()));
