import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * A case study is one .mdx file. Everything the /work/[slug] spine renders —
 * problem, architecture diagram, decision, proof artifact, stack, links —
 * comes from this frontmatter. The MDX body is optional long-form notes.
 */

const diagramNode = z.object({
  label: z.string(),
  note: z.string().optional(),
  /** At most one per diagram. Renders in --mark. */
  emphasis: z.boolean().default(false),
});

const diagramLayer = z.object({
  title: z.string(),
  nodes: z.array(diagramNode).min(1).max(4),
});

const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    year: z.number().int(),
    /** One line, used on the home page and in meta descriptions. */
    summary: z.string(),
    /**
     * Two or three words naming what the thing *is*, shown beside the year in
     * the home page's work rows ("2026, SECURITY SCANNER"). Optional so a new
     * case study renders without it rather than failing the build.
     */
    category: z.string().optional(),
    role: z.string(),
    team: z.string().optional(),
    /** Ascending. Controls home-page and /work ordering. */
    order: z.number().int(),
    /** draft: true keeps the file in the repo and off the site. */
    draft: z.boolean().default(false),
    stack: z.array(z.string()).min(1),
    links: z
      .object({ repo: z.string().url().optional(), live: z.string().url().optional() })
      .default({}),

    /** Spine step I — two sentences. Enforced by review, not by zod. */
    problem: z.string(),

    /** Spine step II — data in, inline SVG out. */
    diagram: z
      .object({
        caption: z.string(),
        /** Escape hatch: a hand-authored SVG dropped in public/ wins over layers. */
        svg: z.string().optional(),
        layers: z.array(diagramLayer).min(2).max(5).optional(),
      })
      .optional(),

    /** Spine step III — the one hard decision. */
    decision: z
      .object({
        question: z.string(),
        chose: z.string(),
        rejected: z.array(z.string()).min(1),
        why: z.string(),
      })
      .optional(),

    /** Spine step IV — the artifact. Missing file/video renders a drop-in frame. */
    proof: z
      .object({
        kind: z.enum(['tests', 'diff', 'video']),
        /** Headline claim, always shown. */
        summary: z.string(),
        caption: z.string().optional(),
        /** Path under src/proof/, e.g. "arc/tests.txt". */
        file: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { work };
