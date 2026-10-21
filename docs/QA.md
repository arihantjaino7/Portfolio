# Playable portfolio verification

The redesign runs locally at `http://127.0.0.1:4323/Portfolio/` on branch `codex/pixel-world-portfolio`. Start it with `npm ci`, `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4323`. The existing GitHub Pages workflow deploys only `main`; the redesign branch does not replace production.

## Verified

- `npm run check`: no errors or warnings; one pre-existing unused Props hint in Reveal.astro.
- `npm run build`: seven static pages generated, including all three existing project case studies and about.
- Desktop 1440×900, mobile 390×844, compact app preview 359×666: world, hotbar, modal layout, and no horizontal overflow.
- Map click pathfinding reaches the project chest; E opens the inventory. Shortcut 3 opens skills. WASD/arrows and held touch input move the player; a 900ms touch hold moved 70 world units and released cleanly.
- All three projects select by click and arrow keys. Escape closes the dialog and restores focus to its trigger. Native dialog contains keyboard focus.
- All five landmark panels open. Source links match content collection values; resume, case studies, email, GitHub, LinkedIn, and X retain their original destinations.
- Reduced motion media setting removes inventory animation and ambient scene motion. Sound starts off and uses local Web Audio synthesis only.
- Direct `#direct-portfolio` navigation shows readable HTML and hides the game. HTML also exposes that content when JavaScript is disabled.
- Browser console reports no errors or warnings during gameplay/panel checks.
- Final mobile controls measured 44×44px; project summaries and panel prose compute to 14px.
- Independent finish review requested four fixes; final verdict is recorded in `.impeccable/review/verdict.md`.

Screenshots are development evidence in `.impeccable/review/` and do not ship in the static build. No paid APIs, purchases, hosted services, or game assets are used. The additional shared award-winning-website repository is a React/GSAP tutorial rather than an installable skill and was not installed or copied.

## Existing dependencies

The existing Astro 5 toolchain has npm advisories requiring a separate major-version migration (including Astro/MDX). This change preserves the existing static deployment; no server runtime or new external service is introduced. A major framework upgrade is outside this visual/game redesign.
