# DESIGN.md

Decisions made before any component code was written. If a later change contradicts
this file, change this file too or don't make the change.

---

## 1. The brief bans the thing I almost built

The register chosen for this site is "paper and ink editorial." The first execution I
proposed for that register was:

> cream background · high-contrast serif display · terracotta accent

That is, line for line, the first item on the brief's list of things to avoid. It is the
house style of every AI-generated portfolio of the last two years, and a recruiter who
has seen four of them will recognise it in under a second. The register survives. That
execution does not.

**What replaced it:**

| Default | Replacement | Reason |
| --- | --- | --- |
| Cream `#F4F2ED` | Cool drafting grey `#EDEEEA` | Cream reads *book*. This site is a set of engineering drawings, not a memoir. The green-grey cast is the paper of a plan sheet. |
| Serif display face | **No serif anywhere** | The serif is the single loudest tell of the generated-portfolio look. Removing it entirely is cheaper than trying to use one tastefully. |
| Terracotta accent | Ultramarine `#22389E` | Terracotta is the banned accent. Ultramarine is literally ink — it earns its place in a paper-and-ink concept instead of being decoration. |
| Oversized serif chapter numerals | Mono numerals **as drafting annotations** | See §4. The numerals stopped being decoration and started carrying information. |

---

## 2. Palette — six tokens, no others

```
--paper       #EDEEEA   page ground; cool grey-green, not cream
--paper-deep  #E2E3DE   recessed wells: proof artifacts, diagram ground, code
--ink         #16181A   all primary text; blue-black, the colour of press ink
--ink-soft    #5B6067   secondary text, metadata, mono labels
--rule        #CBCDC6   hairlines and grid lines
--mark        #22389E   the one accent
```

Measured contrast on `--paper`:

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `--ink` on `--paper` | **15.3 : 1** | AAA |
| `--ink-soft` on `--paper` | **5.4 : 1** | AA normal text |
| `--mark` on `--paper` | **8.5 : 1** | AAA normal text; also clears 3:1 for the focus ring |
| `--rule` on `--paper` | 1.4 : 1 | Decorative hairlines only — never a border that carries meaning. Anything a reader must perceive uses `--ink-soft`. |

There is no dark theme. Inverted paper is not paper; the concept is a single committed
look, and a second palette would be two half-considered designs instead of one finished
one. `color-scheme: light` is declared so the browser doesn't help.

`--mark` appears in exactly four places sitewide: the focus ring, link underlines on
hover/focus, the three achievement figures in Chapter IV, and the emphasised node in each
architecture diagram. If it shows up in a fifth, it has stopped being an accent.

---

## 3. Type — two faces, roles not vibes

**Archivo Variable** (wght 100–900) — everything that is prose.
A grotesk by Omnibus-Type drawn for high-performance printing: tall x-height, tight
apertures, and a weight axis that stays readable at 14px and stays sharp at 96px. It is
chosen against Inter deliberately — Inter is the default and reads as one. Archivo is a
workhorse with an actual voice.

**JetBrains Mono Variable** — everything that is *structure*: chapter numerals, the rail
annotations, stack lists, dates, file paths, test output, diagram labels.

The split is not decorative. Mono marks content that a machine produced or that indexes
something; Archivo marks content a person wrote. A reader learns that rule in about ten
seconds without being told, and after that the page's information architecture is legible
from across the room. Two faces, clearly distinct — a grotesk and a monospace can't be
confused for each other, which is the brief's requirement.

Both self-hosted as variable woff2 via Fontsource, latin subset, `font-display: swap`.
Two font files total on first paint.

**Scale** (fluid via `clamp`, 360px → 1440px):

| Role | Face | Size |
| --- | --- | --- |
| Hero name | Archivo 600 | `clamp(2.75rem, 11vw, 7rem)` |
| Chapter title | Archivo 600 | `clamp(1.75rem, 5vw, 3rem)` |
| Project title | Archivo 500 | `clamp(1.5rem, 4vw, 2.5rem)` |
| Proof figure | Mono 500 | `clamp(2.5rem, 9vw, 5.5rem)` |
| Body | Archivo 400 | `clamp(1rem, 0.97rem + 0.2vw, 1.125rem)` |
| Rail / meta | Mono 400 | `0.8125rem` |

Body measure is capped at `66ch` — comfortably under the brief's 80-character ceiling.
Line height 1.6 for body, 1.05 for display.

### What is *not* here

- **No all-caps tracked-out eyebrow labels.** Labels are lowercase mono at normal
  tracking (`chapter ii`, `stack`, `proof`). All-caps + `letter-spacing: 0.2em` is the
  single most-generated typographic gesture on the web.
- **No arrows appended to links.** The project title *is* the link. A 1px rule under it
  thickens to 2px and turns `--mark` on hover and focus.
- **No border-radius, no shadows.** Rules and whitespace do the separating. Identical
  rounded cards with identical shadows is on the brief's ban list, and the way to avoid
  it is not "different shadows," it's no cards.

---

## 4. Where the boldness is spent: the chapter rail

The brief allows one memorable element. It is the **rail** — a sticky left column, two of
twelve grid tracks wide, present beside every chapter.

It carries, top to bottom:

1. The roman numeral (`I`…`IV`) in JetBrains Mono at `clamp(3rem, 7vw, 5.5rem)`, drawn as
   **outline only** — `color: transparent`, `-webkit-text-stroke: 1.5px var(--ink)`. It
   reads as a plotted line on a drawing, not as a magazine drop cap.
2. A 1px `--rule` hairline running the full height of the section.
3. At the foot of the rail, a mono readout of what the chapter contains:
   `3 entries`, `4 areas`, `3 results`.

That third item is the whole point, and it is what stops this from being Yet Another Big
Number. The rail is not decoration with a number in it; it is a drafting-sheet annotation
block that tells you how much chapter is left. It is the clearest possible answer to the
brief's "motion serves comprehension" requirement, and it works with zero JavaScript in
Phase 1 — `position: sticky` alone. Phase 2 replaces sticky with a GSAP pin so the
numeral can hold and hand off between chapters; the information it conveys is identical
either way.

Below 900px the rail unfolds into a horizontal band above the chapter: numeral, title,
and count on one line above a full-width rule. No sticky behaviour on small screens.

---

## 5. Chapter II motion — and the one decision that was reversed

**Phase 1 planned "the pinned plate." Phase 3 shipped scale-and-settle. That was a
reversal, and this is why.**

The brief offers exactly two options for the work entries — *horizontal pinned scroll, or
a scale-and-settle reveal per project* — and asks for one, committed. The pinned plate
(a single media frame in a right-hand column, stepping between stills as text scrolls
past on the left) was a third thing, invented here rather than chosen from the brief.
Three arguments retired it:

1. **It was not one of the two options.** The instruction was to pick one and commit, not
   to design a third.
2. **Two entries is not a sequence.** BhoomiSetu is still a draft, so the shared well
   would step exactly once. That is a great deal of machinery — a second column, tall
   held blocks, a hand-off — for one transition.
3. **It costs the page its strongest image.** Chapter II is the centre of gravity and the
   brief says give it the most vertical space. A plate confined to a right-hand column is
   roughly half the width of the full-bleed figure the static build already has. Halving
   the best thing on the page to add a mechanic is a bad trade.

Horizontal pinned scroll stays rejected for the original reason: pinning horizontally
converts vertical space into sideways travel, directly contradicting "most vertical
space," and it needs a separate mobile structure — so the static page and the animated
page stop being the same document.

**What shipped — scale-and-settle, scrubbed.** Each plate's image enters at `scale(1.08)`
and settles to `scale(1)` as the entry rises through the viewport, tied to scroll position
rather than fired once on entry. That distinction is the whole idea: it settles *under the
reader's hand* instead of playing at them. As it lands, the entry's copy goes
`--ink-soft` → `--ink` and the frame's hairline goes `--rule` → `--ink-soft`: the project
takes focus. There is no opacity anywhere and no translate — fade-and-slide-up is exactly
the generic default the brief names, and this is neither.

The layout does not change between Phase 1 and Phase 3, at any width, which is why
`prefers-reduced-motion: reduce` can simply return the Phase 1 document.

---

## 5b. What Phase 2 shipped

Lenis plus GSAP/ScrollTrigger, **on `/` only**. `/work`, `/work/[slug]`, `/about`
and `/404` still ship zero client JavaScript: they are documents, and native
scrolling is better for reading a long one than any amount of easing. The brief
says ship zero JS on any route that does not need it, and a case study does not.

Three things, and nothing else moves:

1. **Wheel smoothing.** `lerp: 0.11`, settling in roughly 150ms. Lenis' default
   1.2s duration is the floaty one the brief warns about; this tracks the wheel
   closely enough to read as weight rather than lag. `syncTouch` stays off, so
   phones keep native momentum — cheaper, smoother, and the primary audience is
   on a handset.
2. **The rail hairline fills** as you traverse a chapter. The rail already says
   how much chapter there is (`3 entries`); now it says how much is left. That
   is the same job §4 gives it, done live — information, not decoration, and the
   one thing the static build genuinely could not express.
3. **The chapter you are in is inked.** Its numeral sits in `--ink`; the others
   recede to `--ink-soft`. One property, one idea. Not `--rule`: at 1.4:1 a
   recessed numeral is invisible, which defeats the rail and fails contrast.

**The rail is still pinned by CSS `position: sticky`, not by a GSAP pin.** The
brief asks for the chapter marker to hold while its content scrolls past, and
sticky already does exactly that — with no pin-spacer, no layout shift, no
refresh bookkeeping, and identical behaviour when JavaScript never runs. Spending
the JS budget on the progress the rail could not otherwise show is the better
trade. There is no fade-up on any section and no hover-lift on any card.

### Reduced motion

`prefers-reduced-motion: reduce` means Lenis and GSAP are **never fetched** —
they sit behind a dynamic import, so a reader who asked for no motion pays
nothing for it, not even the download. Flipping the OS setting mid-session tears
the whole thing down and restores the static page. What is left underneath is
the Phase 1 build exactly: sticky rail, inked numerals, collapsed hairline.

Initialisation waits for `requestIdleCallback` (1500ms ceiling). Running GSAP
eagerly cost 0.6s of LCP on mobile; nothing here is needed before the first
scroll.

## 5c. What Phase 3 shipped

**Hero — one entrance, as a CSS animation.** Three ruled lines rise from their own edges
on a 70ms stagger while the metadata's rule draws left to right: one sweep down the
block, not a cascade. Nothing touches opacity.

It is deliberately *not* GSAP. It is a CSS keyframe animation armed by a two-line inline
script in `<head>` before first paint, which buys two things. It starts on frame one
rather than waiting for a module to download and parse. And if the motion bundle never
arrives, the entrance still completes instead of leaving the hero stuck hidden — the
failure mode of every JS-driven entrance.

Avoiding opacity was a measured decision, not taste: an element that is `opacity: 0` is
not painted, so it does not count for largest contentful paint. The transform-only
entrance left LCP at 1.7s — unchanged from the static build.

**Chapter IV — count-up on enter, once.** The finished figures are in the HTML, so a
reader with no JavaScript and a crawler both see `12th`. The count resets to zero only at
the instant it starts, and `once: true` means it never repeats. Each value span is held at
its final character width, so counting `0 → 12` cannot shift anything around it.

**State classes arrive late.** `html.motion` flips a batch of colour states at once, and
those properties carry transitions — applying the class would animate all of them in
unison, a visible shimmer across whatever is on screen. Transitions are suppressed for
two frames while the class lands, so the initial state is simply the state.

## 6. Standing constraints

- Body copy never exceeds 66ch.
- Numbered markers appear on chapters and on case-study spine steps — both are genuine
  sequences. Skills, stack lists and the "what I build" areas are unordered sets and are
  never numbered.
- Every route ships zero client JavaScript through Phase 1.
- Focus is visible everywhere: `2px solid var(--mark)` with a `2px` offset, never removed.
