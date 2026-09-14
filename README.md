# arihantjain — portfolio

Personal portfolio for Arihant Jain. Astro 5 · TypeScript · Tailwind 4 · static ·
deployed on Cloudflare Pages.

Design decisions live in **[DESIGN.md](./DESIGN.md)**. Structure and build order
live in **[PLAN.md](./PLAN.md)**. The brief is **[SPEC.md](./SPEC.md)**.

**Phase 1** — the complete static site, zero client JavaScript. *Done.*
**Phase 2** — Lenis smooth scroll and chapter choreography, on `/` only. *Done.*
**Phase 3** — hero entrance, Chapter II scale-and-settle, proof count-up. *Done.*

Scroll motion lives in `src/scripts/motion.ts`, imported by `src/pages/index.astro`
alone — every other route still ships zero client JavaScript. The hero entrance is a CSS
animation armed by an inline script before first paint, so it does not wait on that
bundle and completes even if the bundle fails. Under `prefers-reduced-motion: reduce`
nothing is armed and Lenis and GSAP are never fetched at all.

---

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run preview    # serve dist/
npm run check      # astro check — must stay at 0 errors
```

### View it on your phone

The site is built mobile-first and a 40-second phone scan is the primary use case,
so check it on a real handset rather than a narrow browser window.

```bash
npm run dev:host   # binds the dev server to the LAN, not just localhost
```

Astro prints a **Network** address alongside the local one — something like
`http://192.168.1.7:4321/`. Open that on the phone, with both devices on the same
Wi-Fi. Edits hot-reload on the phone too.

- If no Network address appears, or the phone times out, Windows Firewall is
  usually blocking it: allow Node.js on **private** networks when prompted.
- `npm run preview:host` does the same for the built output in `dist/`, which is
  what actually ships — use it for a final look.
- Not on the same network? `npx cloudflared tunnel --url http://localhost:4321`
  prints a temporary public URL that works from anywhere.

## Deploy to Cloudflare Pages

The repo is already configured; connecting it is a one-time, two-minute job.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and pick this repository.
2. Set the build settings exactly:

   | Field | Value |
   | --- | --- |
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | *(leave blank)* |

3. Add one environment variable under **Settings → Environment variables**:
   `NODE_VERSION` = `22`.
4. Deploy. Every push to `main` publishes; every push to another branch gets a
   preview URL.

`wrangler.toml` already declares `pages_build_output_dir = "dist"`, so
`npx wrangler pages deploy` works too if you'd rather push builds by hand.

**After the domain is attached**, change one line — `SITE` in
`astro.config.mjs`. Canonical URLs, the sitemap, `robots.txt` and every OG tag
read from it.

`public/_headers` sets the security headers and caches `/_astro/*` and `/fonts/*`
immutably.

---

## Adding a case study

One file. `src/content/work/<slug>.mdx`, and nothing else.

Frontmatter drives the whole `/work/<slug>` spine — problem, architecture
diagram, decision, proof artifact, stack, links. The MDX body is optional
long-form notes rendered at the end. The schema is `src/content.config.ts`; copy
`src/content/work/arc.mdx` as the reference.

- **Architecture diagrams** are data, not components. Describe `diagram.layers`
  and `ArchDiagram.astro` renders the inline SVG — real `<text>`, selectable and
  crawlable. Set `emphasis: true` on the one node that matters. To use a
  hand-drawn diagram instead, drop an SVG in `public/` and point `diagram.svg`
  at it.
- **Proof artifacts** are the point of the format. Set `proof.kind` to `tests`,
  `diff` or `video`. For `tests`/`diff`, put the raw output at
  `src/proof/<slug>/<name>.txt` and reference it as `proof.file`. Until that
  file exists the page renders a labelled frame naming the exact path it wants.
- `draft: true` keeps a file in the repo and off the site — out of `/`, `/work`,
  the sitemap, and the build output. Nothing is currently drafted; both case
  studies are published.

## Dropping in real assets

Every path is declared once in `src/config/assets.ts`. Overwrite the placeholder
at the same filename and nothing in the codebase changes.

| Path | Ratio / size |
| --- | --- |
| `public/assets/portrait.jpg` | 4:5 — 1000 × 1250 |
| `public/assets/<slug>/shot-01.png`, `shot-02.png` | 16:9 — 1920 × 1080 |
| `public/assets/<slug>/demo.mp4` | 16:9, h.264 (poster falls back to `shot-01`) |
| `public/assets/resume.pdf` | — |
| `public/assets/og/<route>.png` | 1200 × 630 |

The current media files are generated placeholders, so nothing 404s and layout is
correct before the real files land.

```bash
npm run fonts:register   # once per machine — registers the webfonts with fontconfig
npm run assets           # regenerate placeholders + OG cards
npm run assets -- --og   # OG cards only
```

OG cards are generated from `scripts/gen-assets.mjs` in the site's own typefaces.
Edit the `cards` array there when copy changes; the script throws rather than
silently truncating a title that no longer fits.

## Fonts

Archivo Variable and JetBrains Mono Variable, latin subset, self-hosted from
`public/fonts` — two files, ~75 kB, preloaded. `npm run fonts:sync` re-copies
them from the Fontsource packages after an upgrade.

## Quality floor

`scripts/verify.mjs` checks it: Lighthouse mobile on every route, horizontal
overflow at 360 / 900 / 1440, and a visible focus ring on every tab stop.

```bash
npm run build && npm run preview &
npm i -D playwright lighthouse chrome-launcher   # not project deps — they pull a browser
node scripts/verify.mjs
```

Phase 2 baseline, mobile:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 | 1.7 s | 0 |
| `/work` | 100 | 100 | 100 | 100 | 1.4 s | 0 |
| `/work/arc` | 100 | 100 | 100 | 100 | 1.4 s | 0 |
| `/about` | 100 | 100 | 100 | 100 | 1.4 s | 0 |

`/work`, `/work/arc` and `/about` ship no client JavaScript at all. `/` loads a
2.6 kB entry that pulls Lenis and GSAP only after `requestIdleCallback` fires,
and only when the reader has not asked for reduced motion. Keep it that way:
adding a route-wide script is the easiest way to lose these numbers.
