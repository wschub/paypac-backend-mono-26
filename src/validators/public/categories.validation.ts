import { z } from 'zod';

export const getPublicCategoriesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    country_id: z.string().regex(/^\d+$/).optional(),
  }).optional(),
});
