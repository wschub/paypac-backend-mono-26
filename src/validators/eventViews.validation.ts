import { z } from 'zod';

export const markConversionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    session_token: z.string().uuid(),
  }),
});
