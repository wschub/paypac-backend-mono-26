import { z } from 'zod';

export const followUserSchema = z.object({
  body: z.object({
    following_id: z.number().int().positive({ message: 'ID de usuario inválido' }),
  }),
});

export const getPaginatedSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
