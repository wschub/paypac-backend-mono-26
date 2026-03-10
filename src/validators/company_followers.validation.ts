import { z } from 'zod';

export const companyIdParamSchema = z.object({
  params: z.object({
    companyId: z.string().regex(/^\d+$/, { error: 'companyId debe ser un número entero positivo' }),
  }),
});