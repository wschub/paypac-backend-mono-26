import { z } from 'zod';

export const createCodeSchema = z.object({
  body: z.object({
    custom_code: z.string()
      .min(4, { message: 'El código debe tener al menos 4 caracteres' })
      .max(20, { message: 'El código no puede tener más de 20 caracteres' })
      .regex(/^[A-Z0-9\-_]+$/i, { message: 'Solo letras, números, guiones y guiones bajos' })
      .optional(),
  }),
});

export const codeParamSchema = z.object({
  params: z.object({
    code: z.string().min(1, { message: 'Código requerido' }),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { message: 'id debe ser numérico' }),
  }),
});