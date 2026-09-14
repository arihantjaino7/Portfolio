// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Deploy target. Defaults to GitHub Pages, which serves this project repo from
// a subdirectory. Override both for a root-served host — Cloudflare Pages or a
// custom domain — with:
//
//   SITE_URL=https://arihantjain.dev BASE_PATH=/ npm run build
//
// Everything else (sitemap, canonical tags, OG urls, every internal link and
// asset path via src/config/paths.ts) is derived from these two values.
const SITE = process.env.SITE_URL ?? 'https://arihantjaino7.github.io';
const BASE = process.env.BASE_PATH ?? '/Portfolio';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/404') })],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
  image: { responsiveStyles: true },
});
