// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Change this to the production hostname once the domain is attached.
// Everything else (sitemap, canonical tags, OG urls) reads from it.
const SITE = 'https://arihantjain.pages.dev';

export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/404') })],
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: 'auto' },
  image: { responsiveStyles: true },
});
