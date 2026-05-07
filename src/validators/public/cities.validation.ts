import { z } from 'zod';

export const getPublicCitiesQuerySchema = z.object({
  query: z.object({
    country_id: z.string().regex(/^\d+$/).optional(),
  }).optional(),
});
