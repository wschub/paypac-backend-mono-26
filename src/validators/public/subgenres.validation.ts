import { z } from 'zod';

export const getPublicSubgenresQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    subcategory_id: z.string().regex(/^\d+$/).optional(),
    category_id: z.string().regex(/^\d+$/).optional(),
  }).optional(),
});
