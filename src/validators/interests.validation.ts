import { z } from 'zod';

export const createInterestSchema = z.object({
  body: z.object({
    category_id: z.number().int().positive(),
    subcategory_id: z.number().int().positive().optional(),
    subgenre_id: z.number().int().positive().optional(),
    interest_level: z.number().int().min(1).max(5),
  }),
});

export const updateInterestSchema = z.object({
  body: z.object({
    interest_level: z.number().int().min(1).max(5),
  }),
});
