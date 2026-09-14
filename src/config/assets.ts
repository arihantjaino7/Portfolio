/**
 * Every image, video and document path on the site is produced here.
 * No component builds a path inline.
 *
 * Drop real files at these exact locations and nothing else changes:
 *
 *   public/assets/portrait.jpg              4 : 5   (1000 × 1250 recommended)
 *   public/assets/<slug>/shot-01.png       16 : 9   (1920 × 1080)
 *   public/assets/<slug>/shot-02.png       16 : 9   (1920 × 1080)
 *   public/assets/<slug>/demo.mp4          16 : 9   (h.264, poster falls back to shot-01)
 *   public/assets/og/<route>.png         1200 × 630
 *   public/assets/resume.pdf
 */

export const ratio = {
  portrait: '4 / 5',
  media: '16 / 9',
  og: '1200 / 630',
} as const;

export const assets = {
  portrait: '/assets/portrait.jpg',
  resume: '/assets/resume.pdf',
  ogDefault: '/assets/og/default.png',
  favicon: '/favicon.svg',

  /** Per-project media, derived by slug — adding a project needs no edit here. */
  project(slug: string) {
    return {
      shot1: `/assets/${slug}/shot-01.png`,
      shot2: `/assets/${slug}/shot-02.png`,
      demo: `/assets/${slug}/demo.mp4`,
      og: `/assets/og/${slug}.png`,
    };
  },

  og(route: 'default' | 'work' | 'about' | (string & {})) {
    return `/assets/og/${route}.png`;
  },
} as const;
