/**
 * Phase 2 — Lenis smooth scroll and chapter choreography.
 *
 * Loaded only on `/`. Every other route still ships zero client JavaScript:
 * case studies and /about are documents, and native scrolling is better for
 * reading a long one than any amount of easing.
 *
 * What moves, and why (DESIGN.md §5):
 *   1. Wheel scrolling is smoothed — soft, not floaty. Touch is left native.
 *   2. The rail's hairline fills as you traverse a chapter. The rail already
 *      says how much chapter there is ("3 entries"); this makes it say how much
 *      is left. Information, not decoration.
 *   3. The chapter you are in has an inked numeral; the others sit back.
 *      One property, one idea — no fade-up on anything.
 *   4. Chapter II: each plate scales and settles into its frame as it rises,
 *      scrubbed to scroll rather than fired once, so it genuinely settles under
 *      the reader's hand. Its entry inks up as it takes focus.
 *   5. Chapter IV: the figures count up on enter, once.
 *
 * The hero entrance is deliberately NOT here — it is a CSS animation armed
 * before first paint in index.astro, so it starts on frame one and completes
 * even if this module never loads.
 *
 * `prefers-reduced-motion: reduce` means none of this initialises, and Lenis and
 * GSAP are never even fetched — they load behind a dynamic import so a reader
 * who asked for no motion pays nothing for it. Flipping the setting mid-session
 * tears the whole thing down. The page underneath is the Phase 1 build: the rail
 * holds position with CSS `position: sticky`, so the chapter marker still holds
 * while its content scrolls past, with no JS at all.
 */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;

let teardown: (() => void) | null = null;
let starting = false;

async function start() {
  if (teardown || starting) return;
  starting = true;

  const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('lenis'),
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);

  // The setting can flip while those three are in flight.
  if (reduce.matches) {
    starting = false;
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // lerp 0.11 settles in roughly 150ms. Lenis' 1.2s duration default is the
  // floaty one; this tracks the wheel closely enough to read as weight rather
  // than lag. syncTouch stays off so phones keep native momentum — the primary
  // audience reads this on a handset, where native is both smoother and cheaper.
  const lenis = new Lenis({
    lerp: 0.11,
    wheelMultiplier: 1,
    syncTouch: false,
    autoRaf: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  const onRaf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(onRaf);
  gsap.ticker.lagSmoothing(0);

  // In-page links have to go through Lenis or they fight it. The skip link is
  // deliberately excluded: it must jump instantly and move focus.
  const onAnchor = (e: MouseEvent) => {
    const link = (e.target as Element | null)?.closest?.('a[href^="#"]:not(.skip)');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target as HTMLElement, { offset: -24 });
  };
  document.addEventListener('click', onAnchor);

  const ctx = gsap.context(() => {
    document.querySelectorAll<HTMLElement>('.chapter').forEach((chapter) => {
      const fill = chapter.querySelector<HTMLElement>('.rail-line-fill');
      if (fill) {
        gsap.fromTo(
          fill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            // 'top top' / 'bottom bottom' inverts on any chapter shorter than
            // the viewport — its bottom reaches the viewport bottom before its
            // top reaches the top. Anchoring inside the viewport keeps the
            // duration positive at every chapter height and screen size.
            scrollTrigger: { trigger: chapter, start: 'top 75%', end: 'bottom 25%', scrub: true },
          },
        );
      }

      // The chapter holding the middle of the viewport is the one you are in.
      // Sections are adjacent, so the hand-off is exact — no gap, no overlap.
      ScrollTrigger.create({
        trigger: chapter,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => chapter.classList.toggle('is-active', self.isActive),
      });
    });

    /* Chapter II — scale and settle, the one committed idea for the work
       entries. Scrubbed, not fired: the plate settles into its frame as you
       scroll it up the viewport, which is what separates this from a reveal
       that plays at you. No opacity, no translate — the generic default is
       fade-and-slide-up and this is neither. */
    document.querySelectorAll<HTMLElement>('.entry').forEach((entry) => {
      const image = entry.querySelector<HTMLElement>('.plate img');
      if (image) {
        gsap.fromTo(
          image,
          { scale: 1.08 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: entry, start: 'top 90%', end: 'top 35%', scrub: true },
          },
        );
      }

      // The entry inks up once it has settled, and stays inked.
      ScrollTrigger.create({
        trigger: entry,
        start: 'top 55%',
        once: true,
        onEnter: () => entry.classList.add('is-settled'),
      });
    });

    /* Chapter IV — count up on enter, once, never repeating. The finished
       figure is already in the HTML; this resets to zero only at the moment
       it starts, so a reader who never reaches Chapter IV sees the real
       number and nothing ever shows a stale zero. */
    document.querySelectorAll<HTMLElement>('.figure .value').forEach((el) => {
      const to = Number(el.dataset.countTo);
      if (!Number.isFinite(to)) return;
      const counter = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
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
  });

  // `html.motion` flips a batch of colour states at once. Those properties carry
  // transitions, so applying the class would animate every one of them in
  // unison — a visible shimmer over anything currently on screen. Suppress
  // transitions for two frames so the initial state is simply the state.
  root.classList.add('motion', 'motion-arming');
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove('motion-arming')),
  );

  ScrollTrigger.refresh();
  // Webfonts land after first paint and change the height of everything.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  teardown = () => {
    // The hero entrance has already finished by any plausible teardown, and its
    // fill-mode end state is the resting page — dropping the class simply hands
    // the styles back to the static build.
    root.classList.remove('motion', 'motion-pending');
    document.removeEventListener('click', onAnchor);
    gsap.ticker.remove(onRaf);
    ctx.revert();
    lenis.destroy();
    document
      .querySelectorAll('.chapter.is-active, .entry.is-settled')
      .forEach((c) => c.classList.remove('is-active', 'is-settled'));
    // Counting may have been interrupted mid-tween; restore the real figures.
    document.querySelectorAll<HTMLElement>('.figure .value').forEach((el) => {
      if (el.dataset.countTo) el.textContent = el.dataset.countTo;
    });
  };
  starting = false;
}

function stop() {
  teardown?.();
  teardown = null;
}

// Nothing here is needed until the reader scrolls, and GSAP's parse cost
// competes with first paint if it runs eagerly — it cost 0.6s of LCP when it
// did. Yield until the main thread is free, with a ceiling so a reader who
// scrolls immediately is not waiting on an idle callback that never comes.
function schedule() {
  if (reduce.matches) return;
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => start(), { timeout: 1500 });
  } else {
    setTimeout(start, 200);
  }
}

schedule();
reduce.addEventListener('change', () => (reduce.matches ? stop() : schedule()));
