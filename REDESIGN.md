# Portfolio Redesign — Build Plan

Reference targets:

- **`live-up.co.jp`** — the landing screen. Full-viewport abstract, softly moving
  background; almost no UI on top of it; the page *is* the atmosphere.
- **`grigoletti.ch/en`** — everything after the first scroll. Numbered list
  section (`01. / 02. …`), project showcase, the "hey, I'm —" portrait block,
  and the line-by-line mask reveals that tie all of it together.

This is a **full replacement** of the current site's front page, not a reskin.
The stack stays. Every phase below is self-contained: open a new chat, paste the
prompt in that phase's *Prompt* block, and it can be done without the others
loaded in context.

---

## 0. What already exists (do not re-install)

| Thing | Status |
|---|---|
| Astro 5, static output, `base: /Portfolio` | ✅ keep |
| Tailwind 4 (`@theme` tokens in `src/styles/global.css`) | ✅ keep, retune tokens |
| GSAP 3 + Lenis | ✅ installed, currently only used on `/` |
| `src/scripts/motion.ts` | ⚠️ rewrite — it choreographs the *old* chapter rail |
| `src/config/site.ts` (name, links, achievements, areas, skills) | ✅ keep, it is the single source of copy |
| `src/content/work/*.mdx` (arc, sentinelsai) | ✅ keep as project data |
| `src/pages/index.astro` | 🔥 replaced in Phases 1–5 |
| `src/components/Chapter.astro`, `ProjectRow.astro` | 🔥 retired |
| `public/assets/portrait.jpg` + project shots | ✅ reused |

**No new dependencies.** The hero background is a hand-written WebGL fragment
shader (~80 lines, no three.js) so the landing screen stays under ~5 KB of JS.

---

## 1. The new page, top to bottom

```
┌─ S1  LANDING          100vh. Abstract animated background, name, one line,
│                       scroll cue. (live-up.co.jp energy)
├─ S2  ACHIEVEMENTS     01. / 02. / 03. — numbered rows, huge type,
│                       count-up figures, hover reveal. (grigoletti "services")
├─ S3  WORK             Project showcase — full-bleed rows, sticky index,
│                       clip-path image reveal, parallax.
├─ S4  ABOUT            Portrait pops in. "Hey — I'm Arihant Jain."
│                       Short paragraph + meta row underneath.
├─ S5  CAPABILITIES     (filler, minimal) — a quiet marquee/word band of what
│                       I build with. Breathing room before the end.
└─ S6  OUTRO            End screen. One huge line, the email, GitHub /
                        LinkedIn / Gmail, local time, back-to-top.
```

### Design direction

- **Palette flips to dark.** The current paper-light look fights the abstract
  hero. New base: near-black `#0b0c0e` ground, `#f2f1ed` text, one accent
  (`#3d5afe`-ish blue carried over from `--color-mark`), one muted grey.
  Everything else is opacity.
- **Type**: keep Archivo (display + prose) and JetBrains Mono (numerals, labels,
  meta). Push the display scale much larger — the landing name and the outro
  line should be edge-to-edge.
- **Motion vocabulary — exactly three moves, reused everywhere:**
  1. **Line mask reveal** — text clipped by `overflow:hidden` parent, child
     `translateY(110%) → 0`, 0.9s `expo.out`, 60–80 ms stagger per line.
  2. **Clip reveal** — images wipe in via `clip-path: inset(100% 0 0 0) → inset(0)`
     with a counter-scale on the `<img>` (1.15 → 1) so it feels pulled, not faded.
  3. **Scrub parallax** — images/numbers drift ±8% against scroll, `scrub: true`.
  Nothing else. No fade-ups, no bounce, no rotation.
- **Reduced motion**: every phase ships the static end-state. GSAP/Lenis stay
  behind a dynamic import and are never fetched when `prefers-reduced-motion`.

---

## 2. Phases

Do them in order. Each ends with a commit on `claude/practical-hypatia-n6pnif`.

---

### Phase 1 — Foundation (tokens, motion core, empty shell)

**Goal:** the page turns dark, smooth scroll + a reusable reveal system exist,
and `/` renders six empty full-height sections. Nothing pretty yet.

**Files**
- `src/styles/global.css` — rewrite `@theme`: dark palette, larger fluid scale
  (`--text-display: clamp(3rem, 13vw, 11rem)`), spacing rhythm.
- `src/scripts/motion.ts` — **rewrite**. Export a single `initMotion()` that:
  Lenis (wheel only, touch native) → `ScrollTrigger.scrollerProxy` → `gsap.ticker`,
  then auto-wires by data attribute: `[data-reveal="lines"]`, `[data-reveal="clip"]`,
  `[data-parallax]`, `[data-count]`. Tear down on reduced-motion change.
- `src/components/Reveal.astro` — thin wrapper that emits the mask markup.
- `src/pages/index.astro` — strip to six `<section id="…">` placeholders.
- Retire `Chapter.astro`, `ProjectRow.astro` (delete once §S2/S3 land — keep for now).

**Done when:** `npm run build` passes, page scrolls smoothly, a test `data-reveal`
element masks in, reduced-motion ships zero JS.

> **Prompt:** *"Phase 1 of REDESIGN.md in the Portfolio repo: rewrite the design
> tokens to the dark palette, rewrite `src/scripts/motion.ts` into a generic
> attribute-driven reveal/parallax/count system on Lenis + GSAP ScrollTrigger, add
> `src/components/Reveal.astro`, and reduce `src/pages/index.astro` to six empty
> full-height sections. Read REDESIGN.md §1 and §2 Phase 1 first. Commit to
> `claude/practical-hypatia-n6pnif`."*

---

### Phase 2 — S1 Landing (the live-up.co.jp screen)

**Goal:** open the site, get a full-viewport abstract that slowly moves.

**Build**
- `src/components/HeroCanvas.astro` — `<canvas>` fixed behind content, WebGL2
  fragment shader: 3–4 octave fBm noise warped by time, mapped through a 3-stop
  gradient (ink → deep blue → faint warm), plus a film-grain hash and a soft
  vignette. `uTime` advances ~0.08/s — it should look like it is barely moving.
  - Pause via `IntersectionObserver` + `visibilitychange`.
  - DPR capped at 1.5; canvas renders at 0.6× and is CSS-upscaled (cheap, and
    the blur suits the look).
  - **Fallback**: reduced-motion, no-WebGL, or shader compile failure → a static
    CSS `radial-gradient` stack with the same colors. Never a blank screen.
- Content layer (all `position: relative; z-index: 1`):
  - `ARIHANT JAIN` at display scale, mask-revealed line by line on load
    (CSS animation armed before first paint, as today — so it plays even if the
    JS never lands).
  - `person.statement` under it, one line, delayed 120 ms.
  - Bottom row: `Noida, India` · local time · `scroll ↓` cue that fades out on
    first scroll.
- Landing does **not** scroll-pin. It just scrolls away, with the canvas fading
  to the page ground over the first 100vh.

**Done when:** it holds attention with nothing else on screen, ≤ 6 KB JS added,
and the fallback path is verified by disabling WebGL.

> **Prompt:** *"Phase 2 of REDESIGN.md: build the landing screen — `HeroCanvas.astro`
> with a hand-written WebGL fBm-noise gradient shader (no three.js), plus the name /
> statement / meta content layer with a pre-paint CSS mask reveal. Include the
> static CSS-gradient fallback for reduced-motion and WebGL failure. Read
> REDESIGN.md §2 Phase 2."*

---

### Phase 3 — S2 Achievements (`01. / 02. / 03.`)

**Goal:** the grigoletti numbered-list section, but counting *achievements*.

Source data is already in `src/config/site.ts` → `achievements` (1st Amity
Ideathon, 12th OMNIKON, top 6% Adobe). Extend that array with a `blurb` field
and, optionally, an image path per row.

**Layout per row**
```
01.   1st            Amity Ideathon                                  2026
      ─────────────────────────────────────────────────────────────────
      AI / Digital Technologies & Smart Systems
```
- Mono index `01.` small, top-aligned, accent color.
- The figure (`1st`, `12th`, `top 6%`) at `--text-figure`, **count-up on enter**
  (prefix/value/suffix split already exists in config — reuse it).
- Event name in display type on the same baseline.
- Hairline rule between rows, drawn left→right with `scaleX` on enter.
- **Hover (desktop):** row lifts to accent color, the detail line slides up from
  under the rule, and — if an image exists — a small framed image follows the
  cursor with lag. Pointer-fine only; on touch the detail is always visible.
- Section header above: `ACHIEVEMENTS` + `(03)` in mono, mask-revealed.

**Done when:** counts animate once, rows stagger at 80 ms, keyboard focus
produces the same reveal as hover, static HTML shows finished figures.

> **Prompt:** *"Phase 3 of REDESIGN.md: build the numbered achievements section
> (01./02./03.) on the homepage, modelled on grigoletti.ch's numbered services
> list — count-up figures, per-row rule draw, hover detail + cursor-following
> image, mask-reveal headers. Data comes from `achievements` in
> `src/config/site.ts`; extend it if needed. Read REDESIGN.md §2 Phase 3."*

---

### Phase 4 — S3 Work showcase

**Goal:** projects presented the same way grigoletti presents its cases.

- Read from the `work` content collection (`arc`, `sentinelsai`), sorted by
  `order`. Detail pages `/work/[slug]` keep working — only the index presentation
  changes.
- Each project is a **full-bleed row**, alternating alignment:
  - Big image, clip-path reveal + 8% scrub parallax on the inner `<img>`.
  - Sticky mono index (`(01)`) that holds while the row passes.
  - Title at `--text-project`, one-line summary, stack chips in mono, year.
  - Whole row is one link; on hover the image scales 1.03 and a mono
    `VIEW CASE →` slides in.
- Between rows: a thin full-width rule that draws on enter.
- After the last row: a quiet `ALL WORK →` link to `/work`.

**Done when:** rows read cleanly at 390 px wide (stacked, no parallax), images
are `loading="lazy"` + explicit dimensions, no CLS.

> **Prompt:** *"Phase 4 of REDESIGN.md: rebuild the homepage work showcase as
> full-bleed alternating project rows with clip-path image reveals, scrub parallax,
> sticky mono indices and a hover 'view case' affordance. Source: the `work`
> content collection. Read REDESIGN.md §2 Phase 4."*

---

### Phase 5 — S4 About ("Hey — I'm Arihant Jain")

**Goal:** the portrait block. Image pops, then the greeting, then the paragraph.

- Portrait (`public/assets/portrait.jpg`) in a tall frame, left on desktop,
  clip-revealed then holding a slow 6% parallax.
- Right column, in order, each mask-revealed on a 70 ms stagger:
  1. `Hey —` (mono, accent, small)
  2. `I'm Arihant Jain.` (display scale)
  3. 3 short paragraphs — reuse the existing intro prose in `index.astro` /
     `about.astro` rather than writing new copy.
  4. Meta grid in mono: `study / at / span / based` — the `dl` already in the
     current hero moves here.
  5. `MORE ABOUT ME →` to `/about`, and `RÉSUMÉ ↗` to `public/assets/resume.pdf`.

**Done when:** on mobile the portrait sits above the text at 4:5 and nothing
parallaxes.

> **Prompt:** *"Phase 5 of REDESIGN.md: build the about/portrait section — portrait
> with clip reveal + slow parallax, then 'Hey —' / 'I'm Arihant Jain.' / three
> paragraphs / mono meta grid / links, all on the shared line-mask reveal. Reuse
> the existing intro copy and the `dl` currently in the hero. Read REDESIGN.md
> §2 Phase 5."*

---

### Phase 6 — S5 filler band + S6 Outro

**Goal:** close the page. Minimal, deliberate, no filler cards.

**S5 — capability band (the "whatever's left" slot, kept quiet)**
- One horizontal marquee of the `skills` items from `site.ts`, mono, low contrast,
  drifting on scroll velocity (Lenis exposes it) rather than on a timer — it is
  still when you are still. Two rows, opposite directions. A hairline above and
  below. That is the whole section.

**S6 — end screen**
- Full height, ground color, nothing decorative.
- One display line: `Let's build something.` mask-revealed.
- The email as the largest interactive element — `arihantjain4309@gmail.com`,
  underline draws on hover, click-to-copy with a mono `copied` confirmation.
- Row of three: **GitHub** → `links.github`, **LinkedIn** → `links.linkedin`,
  **Email** → `links.email` (all already in `src/config/site.ts`; add nothing
  hard-coded). Each a mono label with an `↗` that nudges on hover.
- Footer hairline: `© 2026 Arihant Jain` · `Noida, India — <live local time>` ·
  `BACK TO TOP ↑` (Lenis `scrollTo(0)`).

**Done when:** the three links resolve correctly, the mailto works, copy-to-clipboard
degrades to a plain mailto where the API is unavailable.

> **Prompt:** *"Phase 6 of REDESIGN.md: build the scroll-velocity skills marquee and
> the minimal end screen — big line, click-to-copy email, GitHub/LinkedIn/Email
> links from `src/config/site.ts`, live local time, back-to-top. Read REDESIGN.md
> §2 Phase 6."*

---

### Phase 7 — Chrome & micro-interactions

- **Header**: fixed, transparent over the hero, gains a blurred ground after
  100vh. Left: `AJ` monogram → top. Right: `work · about · contact` anchors that
  scroll-to with Lenis. Hides on scroll down, returns on scroll up.
- **Scroll progress**: 1px accent line at the very top.
- **Cursor** (pointer-fine only): 8px dot with lagged follow; grows to a ring with
  `VIEW` over project rows. Disabled entirely on touch and reduced-motion.
- **Section indicator**: small fixed mono `(01/06)` bottom-left that swaps per
  section. Optional — cut it if it feels busy.
- **Page transition** to `/work/[slug]`: Astro view transitions, ground wipe.

> **Prompt:** *"Phase 7 of REDESIGN.md: add site chrome — hide/reveal header with
> blur-on-scroll, top progress line, custom lagged cursor with a VIEW state over
> project rows, and Astro view transitions into case-study pages. Pointer-fine and
> motion-allowed only. Read REDESIGN.md §2 Phase 7."*

---

### Phase 8 — Polish & ship

- Responsive audit at 390 / 768 / 1280 / 1920. Landing must not break on a short
  landscape phone (use `100svh`).
- `prefers-reduced-motion` full pass: every section's static end-state verified.
- Perf: hero shader ≤ 6 KB, total JS ≤ 45 KB gzip on `/`, LCP < 2.0 s, CLS 0.
  Shader off when tab hidden.
- A11y: focus-visible rings survive the redesign, headings stay `h1→h2→h3`,
  images keep real alt text, marquee is `aria-hidden`.
- Update `DESIGN.md` to describe the new system (it documents the *old* one) and
  regenerate OG images via `npm run assets`.
- Final: `npm run check && npm run build`, push, confirm GitHub Pages deploy.

> **Prompt:** *"Phase 8 of REDESIGN.md: responsive + reduced-motion + performance +
> a11y audit of the redesigned site, rewrite DESIGN.md to document the new system,
> regenerate OG images, and verify the Pages build."*

---

## 3. Decisions I made for you (say the word to change any)

1. **Dark ground.** The abstract hero needs it. If you want to stay on paper-light,
   only Phase 1's palette changes — everything else holds.
2. **Hand-written shader, not three.js.** ~80 lines vs ~150 KB. Same look.
3. **One page.** `/work/[slug]` and `/about` survive as deeper reads; the homepage
   carries the whole story.
4. **Copy is reused, not rewritten.** Everything already lives in
   `src/config/site.ts` and the current pages.
5. **Phase 5's "filler" is a marquee**, deliberately the quietest thing on the
   page — a sixth loud section would flatten the ones that matter.
6. **Eight phases, in this order, each ending in its own commit.** Phase 1
   (foundation — tokens, motion engine, empty shell) is confirmed shipped;
   Phases 2-8 build the sections and chrome on top of it, one at a time.
7. **All imagery and backgrounds are designed, not stock or supplied.** The
   only real asset in this redesign is `public/assets/portrait.jpg`. The
   landing background, and anything else that reads as an image, is built
   here — starting with the hand-written WebGL shader in §3 item 2.

## 4. What I need from you (blocks nothing until the phase runs)

- **Phase 3**: a one-line blurb per achievement, and optionally one image each.
- **Phase 4**: are `arc` + `sentinelsai` the final two projects, or is a third
  coming? Two rows is thin for a showcase.
- **Phase 2**: hero background mood — cool blue/black, or warm ink? Default is cool.

## 5. Worth automating later

Phases 3–6 all consume `src/config/site.ts`, so **adding an achievement or project
should never mean touching a component**. If you find yourself editing markup to add
a row, that is the signal the data shape is wrong — fix the config, not the section.
Once this lands, the recurring "add a project / update the résumé" flow is a good
candidate for a small Claude Skill that edits the config, drops the images in
`public/assets/<slug>/`, and runs `npm run assets`.
