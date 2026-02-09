import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const journalSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  category: z.enum(['women', 'kids', 'parents']),
  slug: z.string(),
  draft: z.boolean(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  ogImage: z.string().optional(),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: journalSchema,
});

export const collections = { journal };
