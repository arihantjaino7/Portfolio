# PLAN.md — build plan

Companion to `SPEC.md` (the brief) and `DESIGN.md` (tokens, type, the one bold element).
This file is the structure and the build order.

---

## 1. Design tokens

Six values, defined once in `src/styles/global.css` under Tailwind 4's `@theme`:

```
--paper       #EDEEEA
--paper-deep  #E2E3DE
--ink         #16181A
--ink-soft    #5B6067
--rule        #CBCDC6
--mark        #22389E
```

Type: **Archivo Variable** for prose, **JetBrains Mono Variable** for structure.
Full justification and contrast measurements in `DESIGN.md`.

---

## 2. Layout concept

A 12-track grid with a hard asymmetry: tracks 1–2 are the **rail** (sticky chapter
annotation), tracks 3–11 are content, track 12 is bleed. The rail is constant; it is what
makes the chapter structure legible before a single pixel moves. Below 900px the grid
collapses to one column and the rail unfolds into a horizontal band.

### Home — `/`

```
┌──────────────────────────────────────────────────────────────┐
│ Arihant Jain                              work  about  email │  fixed-height header,
├──────────────────────────────────────────────────────────────┤  hairline under
│                                                              │
│                                                              │
│   Arihant Jain                                               │  Archivo 600, clamp to 7rem
│                                                              │  left-aligned, not centred
│   I build multi-agent AI systems, security                   │  one line. no tagline poetry.
│   tooling, and full-stack products.                          │  66ch max
│                                                              │
│                                  ┌─────────────────────────┐ │
│                                  │ cs undergrad            │ │  mono metadata block,
│                                  │ amity university noida  │ │  right-aligned, ink-soft
│                                  │ 2024 — 2028             │ │  the only thing in the
│                                  └─────────────────────────┘ │  hero besides the name
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ ╷                                                            │
│ │      Intro                                                 │
│ │╷                                                           │
│ │                ┌───────────────┐   Three sentences. Short  │  portrait 4:5, no crop
│ │  ┃             │               │   on purpose — this is    │  tricks, no rounded
│ │  ┃   (outline  │  portrait.jpg │   the least important     │  corners, hairline frame
│ │  ┃    numeral) │     4 : 5     │   block on the page for   │
│ │  ┃             │               │   this audience.          │
│ │  ┃             └───────────────┘                           │
│ │                                                            │
│ │  3 sentences                                               │  rail foot readout
│ ╵                                                            │
├──────────────────────────────────────────────────────────────┤
│ ╷                                                            │
│ │      Work                                                  │  ◀── centre of gravity.
│ │╷                                                           │       ~55% of page height.
│ │              ┌────────────────────────────────────────┐    │
│ │  ┃           │              shot-01.png               │    │  16:9. In Phase 3 these
│ │  ┃           │                 16 : 9                 │    │  three figures become one
│ │  ┃           └────────────────────────────────────────┘    │  pinned plate (DESIGN §5).
│ │  ┃    ARC                                          2026    │  title IS the link.
│ │  ┃    ─────────────────────────────────────────────────    │  no arrow. rule thickens
│ │  ┃    Fairness-first fitness competition. Anti-cheat        │  and turns --mark on
│ │  ┃    enforced at the database layer.                       │  hover/focus.
│ │  ┃    next.js · typescript · supabase · cloudflare          │  mono stack line
│ │  ┃                                                          │
│ │  ┃           ┌────────────────────────────────────────┐    │
│ │  ┃           │              shot-01.png               │    │
│ │  ┃           └────────────────────────────────────────┘    │
│ │  ┃    SentinelsAI                                    2026  │
│ │  ┃    ─────────────────────────────────────────────────    │
│ │  ┃    ...                                                   │
│ │  ┃                                                          │
│ │  ┃           (BhoomiSetu — draft: true, does not render)    │
│ │                                                            │
│ │  3 entries                                                 │
│ ╵                                                            │
├──────────────────────────────────────────────────────────────┤
│ ╷                                                            │
│ │      What I build                                          │
│ │╷                                                           │
│ │  ┃    Multi-agent systems          Backend and API design   │  2×2 on desktop,
│ │  ┃    ─────────────────────        ────────────────────     │  1 col ≤ 720px.
│ │  ┃    short prose, ~35 words       short prose              │  NO icons. NO cards.
│ │  ┃                                                          │  hairline above each,
│ │  ┃    Security tooling             Full-stack shipping      │  that's the whole
│ │  ┃    ─────────────────────        ────────────────────     │  separation.
│ │  ┃    short prose                  short prose              │
│ │  ┃                                                          │  unnumbered — a set,
│ │  4 areas                                                    │  not a sequence.
│ ╵                                                            │
├──────────────────────────────────────────────────────────────┤
│ ╷                                                            │
│ │      Proof                                                 │
│ │╷                                                           │
│ │  ┃                                                          │
│ │  ┃      1st          12th             top 6%                │  ◀── the figures ARE the
│ │  ┃      ───          ────             ──────                │      visual element.
│ │  ┃      Amity        OMNIKON          Adobe                 │      mono 500, up to 5.5rem,
│ │  ┃      Ideathon     National         Hackathon             │      --mark. count-up in
│ │  ┃      2026         Hackathon 2026   2026                  │      Phase 3, once.
│ │  ┃      AI / Digital of 3,000+        nationally            │
│ │  ┃      Technologies submissions                            │
│ │  ┃                                                          │
│ │  3 results                                                 │
│ ╵                                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   arihantjain4309@gmail.com                                  │  large, Archivo, the
│   ──────────────────────────                                 │  primary action
│                                                              │
│   github      linkedin      x       resume (pdf, 120kb)      │  mono row, plain links
│                                                              │
│   © 2026 · built with astro · source on github               │
└──────────────────────────────────────────────────────────────┘
```

### Case study — `/work/[slug]`

Same rail, but the numerals now mark the **spine steps**, which are a genuine sequence:

```
 ╷  Title                                                2026
 │  one-line summary
 │  ─────────────────────────────────────────────────────────
 │
 │  I    Problem            two sentences. that's the budget.
 │  II   Architecture       <ArchDiagram> — inline SVG, real <text>,
 │                          generated from frontmatter data
 │  III  Decision           what I chose / what I rejected / why
 │  IV   Proof              <ProofArtifact> — test output, diff, or video
 │  V    Stack              mono list
 │  VI   Links              repo · live
 │
 │  ← previous            next →                          (prev/next case studies)
 ╵
```

### `/work` and `/about`

`/work` is a bare index: one row per case study, no thumbnails, mono metadata, sorted by
`order`. It exists so the site has a crawlable list and a sane back-target from a case
study — it is not a second home page.

`/about` is the rail with one chapter: longer bio, skills grouped by kind (languages,
frameworks, data, tooling), coursework, and the contact block. Skills are **not**
numbered and **not** rendered as pills with percentage bars.

---

## 3. Chapter II motion — decided, then reversed

Planned as "the pinned plate"; **shipped as scale-and-settle**. The brief names two
options and asks for one, committed — the pinned plate was a third thing, and with
BhoomiSetu still a draft it would have stepped exactly once while halving the page's
strongest image. Full reasoning in `DESIGN.md` §5.

What shipped: each plate's image enters at `scale(1.08)` and settles to `scale(1)`
scrubbed to scroll position, not fired on entry, while the entry's copy inks up as it
takes focus. No opacity, no translate. The layout is identical across Phases 1 and 3 at
every width, which is why reduced-motion simply returns the Phase 1 document.

---

## 4. File layout

```
src/
  config/site.ts          every link, every asset path, once. components never inline a path.
  content.config.ts       collection schema (Astro 5 glob loader)
  content/work/*.mdx      one file per project. adding a project = adding one file.
  proof/*.txt             raw proof artifacts. drop a file in, it renders.
  layouts/Base.astro      html shell, meta, og, fonts, skip link
  components/
    Rail.astro            the chapter rail (DESIGN §4)
    Chapter.astro         rail + content wrapper
    ProjectRow.astro      one project entry on the home page
    ProofFigure.astro     one achievement figure
    ArchDiagram.astro     data-driven inline SVG architecture diagram
    ProofArtifact.astro   test output / diff / video — first class
    Prose.astro, Meta.astro, SiteHeader.astro, SiteFooter.astro
  pages/
    index.astro  work/index.astro  work/[...slug].astro  about.astro
    404.astro  robots.txt.ts
```

`ArchDiagram` and `ProofArtifact` are the two components that matter. Both are driven
entirely by frontmatter data, so a new case study is genuinely one `.mdx` file:

```yaml
diagram:
  caption: "..."
  layers:
    - title: Client
      nodes: [{ label: "Next.js", note: "app router" }]
    - title: Enforcement
      nodes: [{ label: "RLS + triggers", emphasis: true }]
proof:
  kind: tests          # tests | diff | video
  summary: "56 passing"
  file: arc/tests.txt  # src/proof/arc/tests.txt — absent renders a labelled drop-in frame
```

---

## 5. Build order

- **Phase 1** — every route, all content, responsive to 360px, zero client JS, Cloudflare
  Pages config wired. *Done.*
- **Phase 2** — Lenis, the rail progress fill, the active-chapter numeral. *Done.*
- **Phase 3** — hero entrance, Chapter II scale-and-settle, proof count-up,
  reduced-motion throughout. *Done.*

---

## 6. Self-review against the brief

Things in my first draft of this plan that were the generic default, and what they became.

| Was | Now | Why |
| --- | --- | --- |
| Cream + serif + terracotta | Cool drafting grey, no serif at all, ultramarine | Verbatim the brief's first banned combination. `DESIGN.md` §1. |
| Big chapter numeral as decoration | Numeral **plus a content readout** (`3 entries`) in a drafting annotation block | A large number in a corner is decoration and reads as generated. Making the rail carry information is what earns it the page's one bold move. |
| `.card` with `rounded-xl shadow-sm`, four of them in Chapter III | Hairline rules and whitespace. No card element exists in the codebase. | Identical rounded cards with identical shadows is on the ban list, and "vary the shadows" is not the fix. |
| `View case study →` | The project title is the link | Arrows appended to link text, banned explicitly. |
| `SKILLS` / `SELECTED WORK` in tracked-out caps | lowercase mono at normal tracking | Banned eyebrow style. |
| Skills as a numbered or progress-barred grid | Unordered mono list grouped by kind | The brief: numbered markers only where content is genuinely a sequence. Skills are a set. |
| `fade-up` on every section + `hover:-translate-y-1` on cards | One committed idea per chapter; nothing else moves | Named in the brief as the generated-looking default. |
| Horizontal pinned scroll for Chapter II | Scale-and-settle, scrubbed to scroll | Horizontal pinning converts vertical space to sideways travel, contradicting "give Chapter II the most vertical space." The pinned plate I proposed instead was a third option the brief never offered. `DESIGN.md` §5. |
| A one-shot reveal fired on entry | Scrubbed to scroll position | A reveal that plays at you on a trigger is the generic pattern. Tying it to scroll makes it settle under the reader's hand, which is the whole idea. |
| GSAP-driven hero entrance | CSS keyframes armed before first paint | A JS entrance starts late and leaves the hero hidden if the bundle fails. It also tempts you into `opacity: 0`, which delays largest contentful paint. |
| Icon per area in Chapter III | Prose only | The brief says no icons. Lucide icons in a 2×2 grid is the default and was the first thing I reached for. |
| Dark mode toggle | Light only, committed | Two half-considered palettes instead of one finished one. |
