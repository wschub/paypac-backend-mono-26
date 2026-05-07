import { z } from 'zod';

export const getPublicSubcategoriesParamsSchema = z.object({
  params: z.object({
    categoryId: z.string().regex(/^\d+$/, 'El categoryId debe ser numérico'),
  }),
});
