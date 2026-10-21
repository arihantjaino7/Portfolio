---
name: Arihant’s Woodland Workshop
description: Original playable pixel forest with readable portfolio inventories.
colors:
  pine: "#142a23"
  panel: "#20362d"
  deep: "#10231e"
  line: "#49614c"
  text: "#f2edda"
  muted: "#b5c0a7"
  gold: "#efc777"
  gold-dark: "#a8793e"
  mint: "#aedb9a"
typography:
  display:
    fontFamily: '"Pixelify Sans", sans-serif'
    fontSize: "clamp(42px, 4.7vw, 70px)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: '"Pixelify Sans", sans-serif'
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.08
  title:
    fontFamily: '"Pixelify Sans", sans-serif'
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.05
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.9
  label:
    fontFamily: '"Pixelify Sans", sans-serif'
    fontSize: "12px"
spacing:
  slot-gap: "5px"
  tag-gap: "6px"
  item-gap: "8px"
  action-gap: "12px"
  panel-gutter: "22px"
  content-inset: "30px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "#253421"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "#2f4935"
    textColor: "{colors.text}"
    padding: "12px 20px"
  inventory:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    width: "min(920px, calc(100vw - 48px))"
  hotbar-slot:
    backgroundColor: "#304733"
    textColor: "#c8d6af"
    width: "67px"
    height: "70px"
  hotbar-slot-active:
    backgroundColor: "#536344"
    textColor: "#ffdc8b"
  project-slot:
    backgroundColor: "#263e2e"
    padding: "12px 10px"
  project-slot-selected:
    backgroundColor: "#465538"
  stack-tag:
    textColor: "#d1dbbe"
    padding: "5px 8px"
---

# Design System: Arihant’s Woodland Workshop

## Overview

**Creative North Star: "Woodland workshop"**

The Woodland workshop is a small inhabited pixel world: dark pine surrounds, amber treasure, square inventory surfaces, and original procedural scenery. Crisp game lettering identifies places and actions; a quiet sans-serif keeps real project descriptions readable.

This system governs the homepage and its inventory, direct-reading fallback, and controls. It is extracted from the finished build, not an approved static comp. Existing /work, /work/[slug], /about, and /404 documents retain Base.astro and global.css; their earlier design record is preserved in docs/legacy-design.md. Do not treat this homepage system as an automatic migration of those routes.

**Key Characteristics:**
- Original code-native pixel scenery and authored SVG icons.
- Square layered forest surfaces with warm interaction accents.
- Readable HTML inventory beside keyboard, pointer, and touch exploration.

## Colors

A forest-dark interface keeps warm treasure and pale reading surfaces legible against the detailed scene. Frontmatter values are the canonical UI palette; terrain colors remain authored illustration colors in src/game/art.ts, not additional interface tokens.

### Primary

- **Gold:** primary buttons, focus, chest imagery, selected project borders, and interaction cues.
- **Gold dark:** supporting warm material shade in the extracted palette.

### Secondary

- **Mint:** availability and visited markers.

### Neutral

- **Pine / Deep:** page ground, recessed controls, and selection contrast.
- **Panel:** inventory body and loading fallback.
- **Line:** subdued structural separators in the direct portfolio.
- **Text / Muted:** primary reading and secondary information.

**The Warm Signal Rule.** Gold connects primary actions, focus, the chest, and selected inventory items; mint marks availability and visited progress.

## Typography

**Display Font:** Pixelify Sans, with sans-serif fallback; local 400, 500, and 600 faces.
**Body Font:** Manrope, with system-ui and sans-serif fallback; local variable face with swap loading.

### Hierarchy

- **Display:** frontmatter display role for the welcome heading; 50px at the intermediate width and 42px on phones.
- **Headline:** text-panel headings; 31px on phones.
- **Title:** project names; 28px on phones. Inventory title uses 25px, then 23px on phones.
- **Body:** project summaries and text panels retain the frontmatter body role on desktop and mobile, capped at 65ch. Welcome copy uses the same reading face, with a narrower 38ch measure.
- **Label:** pixel hotbar names. Compact metadata is smaller in the current build; those small sizes are not a recommended body scale.

**The Two Voices Rule.** Pixelify Sans names the world and its actions; Manrope carries project summaries and explanatory prose.

## Layout

The homepage is a full-viewport scene (100svh), with a 620px minimum height, raised to 640px on phones. The canvas draws a 960 × 640 authored world at half CSS resolution with smoothing disabled. HUD elements overlay it; actual content remains HTML. The initial mobile camera is centered on the player.

Desktop HUD margins are 44px, widening to 60px from 1500px. At 1050px they become 26px and the keyboard guide withdraws. At 760px, the minimap and world metadata withdraw, a directional pad and interaction control appear, and the five-slot hotbar remains centered above the safe area. Hotbar slots change from 67 × 70px to 55 × 60px; directional and header icon buttons are 44px targets.

The inventory is a centered scrolling dialog, capped at 85svh and 760px. Projects pair a 265px vertical selector with a flexible detail column. At 760px, it becomes a three-column tab strip above details; dialog width becomes viewport minus 24px, height viewport minus 40px. Details have 19px padding. About and skills grids also collapse to one column. Compact-height desktop adjustments begin below 700px; narrow header adjustments apply at 360px.

## Elevation & Depth

Depth combines square bevels, inset color steps, ambient shadows, a directional vignette, and a blurred dark modal backdrop. This is a pixel woodland, not a hard-offset-shadow system. Primary controls brighten and rise slightly on hover, then depress when pressed. Inventory entry uses a brief lift and opacity change. Reduced-motion CSS disables transitions and animations; the game removes decorative motion and camera easing while retaining navigation.

### Shadow Vocabulary

- **Control ambient:** `0 4px 16px #071b1940`, beneath pixel buttons.
- **HUD ambient:** `0 6px 25px #081c1955`, beneath the hotbar.
- **Inventory:** `0 28px 80px #051b16b3`, separating the dialog from the world.

**The Material Edge Rule.** Use square borders and lighter top edges to suggest inventory material; the world can retain its soft ambient light and shadows.

## Shapes

Controls, slots, surfaces, and status indicators use square corners. No reusable rounded scale is declared. Inventory uses a three-pixel frame with lighter top and darker bottom edges, reducing to two pixels on phones. Button bevels use three-pixel top and bottom borders. Authored icons use a 16 × 16 viewBox, square line caps, miter joins, and crisp-edge rendering. Canvas rectangles are rounded to the drawing grid; original trees, chests, buildings, water, and lamps carry the atmosphere.

## Components

### Buttons

Tactile rectangular controls. Primary actions use gold with a light top edge and dark lower edge; secondary actions use forest green. Both use Pixelify Sans, 19px type, 12px × 20px padding, and 46px minimum height in the base style. Hover brightens to 1.08 and moves up 2px; active moves down 1px. Gold focus outlines are 3px with a 5px offset. Header toggles and dialog close controls use 44px square targets. Text actions use underlines and reading type.

### Navigation

The five-slot hotbar uses authored SVGs, visible names, shortcuts, and visited indicators. Hover and active states share a lighter green fill and gold border, moving up 3px. Keys 1–5 and direct buttons open sections immediately. The desktop minimap offers click-to-travel landmarks. Mobile movement uses the authored arrow SVG rotated for four directions, with a lighter pressed fill.

### Inventory / Project Slots

A native modal dialog places forest surfaces over the blurred world. A sticky header and close action protect orientation while content scrolls. Project tabs combine a bordered item icon and pixel title; gold outlines and a lighter green identify selection. Desktop uses vertical arrow-key navigation; mobile uses horizontal arrow keys. Closing restores focus. Project actions lead to preserved real case studies, repositories, and live destinations.

### Stack Tags

Small, square, outlined technology labels wrap with compact spacing. They are content labels rather than interactive filters; no hover or selected state is invented.

### Reading Fallback

The direct portfolio is ordinary HTML with an 850px maximum width, 24px horizontal padding, and 1.8 line-height. It appears without JavaScript or when targeted by the skip link. It inherits the homepage palette and heading voice.

## Do's and Don'ts

### Do:

- **Do** use authored crisp SVG icons and pixelated canvas rendering.
- **Do** preserve visible gold focus and immediate HTML access to real portfolio content.
- **Do** keep project descriptions in Manrope with a comfortable reading measure.
- **Do** carry selected, visited, disabled, and pressed states through their existing color and edge treatments.

### Don't:

- **Don't** substitute copied game textures or sprites for original artwork.
- **Don't** require walking skill to reach the portfolio sections.
- **Don't** inherit legacy route styles into the homepage without an explicit reconciliation.
