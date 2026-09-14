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

## 5. Motion, decided in advance (built in Phases 2–3)

Recorded here so Phase 1's markup is already the right shape.

Chapter II — **the pinned plate.** The brief demands one idea, committed. The three
project entries scroll normally in the left content column while a **single** media frame
in the right column stays pinned and steps between the three project stills; the active
entry's row goes from `--ink-soft` to `--ink` as it takes the plate.

Why this and not horizontal pinned scroll: the brief says Chapter II gets *the most
vertical space on the page*. A horizontal pin converts vertical space into sideways
travel — it directly contradicts the requirement. With three projects a horizontal track
also spends a great deal of machinery on very little content, and it needs an entirely
separate mobile structure, which means Phase 1's static page and Phase 3's animated page
stop being the same document.

The pinned plate keeps one document. Phase 1 ships a stacked list where every project
carries its own figure; Phase 3 promotes those figures into a shared well at ≥1024px and
steps them. Below 1024px the Phase 1 layout is the final layout. Nothing is thrown away,
and `prefers-reduced-motion: reduce` returns the page to exactly the Phase 1 build.

---

## 6. Standing constraints

- Body copy never exceeds 66ch.
- Numbered markers appear on chapters and on case-study spine steps — both are genuine
  sequences. Skills, stack lists and the "what I build" areas are unordered sets and are
  never numbered.
- Every route ships zero client JavaScript through Phase 1.
- Focus is visible everywhere: `2px solid var(--mark)` with a `2px` offset, never removed.
