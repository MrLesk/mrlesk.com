import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const talks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    event: z.string(),
    dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slidesStatus: z.enum(["ready", "soon", "none"]).optional(),
    url: z.string().optional(),
    videoUrl: z.string().optional(),
    logo: z
      .object({
        src: z.string(),
        alt: z.string(),
        width: z.number().optional(),
      })
      .optional(),
  }),
});

export const collections = { talks };
