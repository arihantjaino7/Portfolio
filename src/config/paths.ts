/**
 * Base-path awareness.
 *
 * GitHub Pages serves a project repo from a subdirectory — this site lives at
 * /Portfolio/ — while Cloudflare Pages and a custom domain serve from the root.
 * Astro does not rewrite absolute URLs in markup, so every internal href and
 * asset path must go through here.
 *
 * With no base configured, BASE_URL is "/" and withBase is the identity
 * function, so the same source works on both targets untouched.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}`;
}
