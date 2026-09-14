# Portfolio Build Spec — Arihant Jain

The brief, kept in the repo so it can be re-read between sessions.

---

## Brief

Build my personal portfolio site. Audience is **software engineering recruiters and campus placement panels** — technical people scanning for 40 seconds on a phone, then 5 minutes on desktop if something catches them.

Reference for *feel and technique only*: `https://khanhnguyen.design/` — a chaptered, scroll-driven editorial folio. Study its pacing, its use of numbered chapters as narrative spine, its restraint, and its scroll choreography. Do **not** copy its layout, type choices, palette, or copy. That's a designer's folio with ten years of client visuals behind it; I'm an engineer with three projects. Same genre, different design.

## Stack

- Astro 5 + TypeScript
- Tailwind CSS 4
- Content collections (MDX) for case studies — adding a project must be one new `.mdx` file, not a component rewrite
- Lenis for smooth scroll
- GSAP + ScrollTrigger for chapter choreography
- Deploy target: Cloudflare Pages
- No CMS, no database, no auth

Ship zero client JS on any route that doesn't need it. Lighthouse performance must be 95+ on mobile — that number is part of the portfolio.

## Content (real — use this, don't invent)

**Name:** Arihant Jain
**Positioning:** CS undergrad at Amity University Noida (Sep 2024 – May 2028). Builds multi-agent AI systems, security tooling, and full-stack products. Mostly solo.
**Links:** github.com/arihantjaino7 · linkedin.com/in/arihant-jain43 · arihantjain4309@gmail.com · x.com/arihantjaino7

**Skills:** Python, C++, Java, TypeScript, JavaScript, SQL · FastAPI, LangGraph, Next.js, React, Tailwind, Vite · PostgreSQL (Supabase), SQLite, Row-Level Security · Git, Vitest, Playwright, Cloudflare Workers, Groq API

### Projects

**ARC** — Next.js, TypeScript, Supabase (PostgreSQL), Vitest, Cloudflare Workers · 2026
Fairness-first fitness competition platform that scores every competitor against their own personalized goal, so a calorie-cutter and a bulker compete on level ground. Anti-cheat is enforced at the database layer — Postgres triggers and row-level security hold day locks and rule immutability even against a client hitting the API directly with its own key. Immutable rule versioning makes retroactively fixing a losing score structurally impossible. Timezone-correct scoring plus a blind-mode reveal mechanic. 56 passing tests, one full production run completed end-to-end between two live users. Deployed on Cloudflare Workers via the OpenNext adapter.

**SentinelsAI** — Python, FastAPI, Next.js, Groq API · Team ELARA · 2026
Passive, zero-attack-surface security scanner. 8 concurrent agents (headers, TLS, DNS, subdomain takeover, API security, misconfiguration) via `asyncio.gather`, returning a deterministic 0–100 grade in seconds with no live attack traffic. Autonomous auto-fix pipeline patches real vulnerabilities with deterministic Python — never an LLM — previews every diff before writing, and opens a verifiable pull request without touching main. Score deduplication and decay logic so overlapping findings across agents can't unfairly compound a penalty.

**BhoomiSetu** — SIH 2026 entry. *(I'll supply the description; scaffold the MDX file with placeholder body and a `draft: true` flag so it doesn't render until I fill it.)*

### Achievements

- Amity Ideathon 2026 — 1st place, AI / Digital Technologies & Smart Systems
- OMNIKON National Hackathon 2026 — ranked 12th nationwide among 3,000+ submissions
- Adobe Hackathon 2026 — top 6% nationally

## Site structure

```
/                  Home — chaptered scroll
/work              Index of case studies
/work/[slug]       Full case study
/about             Longer bio, skills, coursework
```

Home chapters, in order:

1. **Hero** — name and one line stating what I build. No tagline poetry. No "independent designer" register.
2. **Chapter I — Intro** — three sentences plus a portrait. Deliberately short; it is the least important block for this audience.
3. **Chapter II — Work** — three project entries linking to case studies. This is the centre of gravity of the page. Give it the most vertical space and the strongest motion.
4. **Chapter III — What I build** — four areas: multi-agent systems, backend and API design, security tooling, full-stack shipping. Short prose, no icons.
5. **Chapter IV — Proof** — the three achievements. This replaces the reference site's client-logo row. Treat the numbers (1st, 12th of 3,000+, top 6%) as the visual element.
6. **Contact** — email, GitHub, LinkedIn, X, and a resume PDF link.

## Case study template

Every `/work/[slug]` page follows the same spine:

1. Problem, in two sentences
2. Architecture diagram (inline SVG — I'll supply the content, you build the component)
3. The one hard technical decision, and what I rejected
4. Proof artifact — test output, a real auto-fix diff, or an embedded demo video
5. Stack
6. Repo and live links

That proof-artifact slot is the whole advantage over a designer's folio. Build it as a first-class component, not an afterthought.

## Motion spec

Motion serves comprehension. Scroll choreography should make the chapter structure legible, not decorate it.

- **Lenis** smooth scroll, tuned soft, not floaty
- **Chapter transitions** — pinned section with the chapter marker holding while its content scrolls past
- **Hero** — one orchestrated entrance on page load. One sequence, not a cascade of fade-ups.
- **Work entries** — the strongest moment on the page. Pick one idea and commit: horizontal pinned scroll, or a scale-and-settle reveal per project. Not both.
- **Proof numbers** — count-up on enter, once, never repeating
- Do **not** put fade-and-slide-up on every section and hover-lift on every card. That's the generic default and it reads as generated.
- `prefers-reduced-motion: reduce` must disable all of it and leave a fully readable static page.

## Design direction

Pick a deliberate palette and type pairing and justify both in a short `DESIGN.md` before writing any component code. Constraints:

- Avoid the AI-design house style: cream background with high-contrast serif and terracotta accent; near-black with one acid accent; all-caps tracked-out eyebrow labels; identical rounded cards with identical shadows; arrows appended to link text.
- One or two typefaces. If two, make them clearly distinct.
- Body text under 80 characters per line.
- Numbered markers only where content is genuinely a sequence. Chapters are a sequence. Skills are not.
- Spend boldness in one place — one memorable element, everything else quiet.

## Assets

I haven't uploaded assets yet. Build against placeholders with correct aspect ratios and clear filenames so I can drop files in later without touching code:

```
/public/assets/portrait.jpg
/public/assets/arc/{demo.mp4, shot-01.png, shot-02.png}
/public/assets/sentinels/{demo.mp4, shot-01.png, shot-02.png}
/public/assets/resume.pdf
```

Every image and video path is defined once in a config file, not inline in components.

## Build order — follow this exactly

**Phase 1.** Full site, all content, all routes, responsive, zero animation. Deploy to Cloudflare Pages. It must be genuinely good static before anything moves.

**Phase 2.** Lenis + chapter choreography.

**Phase 3.** Hero sequence, work reveals, proof count-up, reduced-motion handling.

Do not start Phase 2 until Phase 1 is deployed and I've seen it live. Confirm before moving between phases.

## Quality floor

Responsive to 360px. Visible keyboard focus. Semantic HTML — real text, crawlable, no canvas-rendered copy. Meta tags and OG image on every route. `sitemap.xml` and `robots.txt`.

## Before you write code

Produce a short plan first: design tokens (4–6 named hex values), type choices with roles, a layout concept with ASCII wireframes for the home page, and the motion idea for Chapter II. Review that plan against this brief — anything that reads like the default you'd generate for any portfolio, revise it and say what changed. Then build.

---

## Deviations from the brief, and why

- **Asset directory for SentinelsAI is `sentinelsai/`, not `sentinels/`.** Media paths derive from the case-study slug so that adding a project stays a one-file change; a second naming scheme would have meant a hand-maintained lookup table. Rename the slug in `src/content/work/sentinelsai.mdx` if you prefer `sentinels`.
- **Chapter II currently shows two entries, not three.** BhoomiSetu is `draft: true` as instructed, so it is excluded from the build. The rail readout counts published entries, so it says "2 entries" until BhoomiSetu is filled in.
- **Repo and live links are empty.** They were not in the brief and are not guessed — a dead link on a recruiter-facing page is worse than an honest absence. Fill `links.repo` / `links.live` in each `.mdx`.
- **Proof artifact bodies are not supplied.** `56 passing` renders as the headline claim because the brief states it; the raw runner output and the auto-fix diff are yours to paste into `src/proof/`. Inventing them was not an option.
