import { z } from 'zod';

/**
 * Schema para crear una comisión por franquicia
 */
export const createFranchiseFeeSchema = z.object({
  body: z.object({
    franchise: z
      .string()
      .min(2, 'La franquicia debe tener al menos 2 caracteres')
      .regex(/^[A-Z0-9_]+$/, 'La franquicia solo puede contener letras mayúsculas, números y guiones bajos (ej: VISA, MASTERCARD)'),
    commission_pct: z.number().min(0, 'La comisión debe ser positiva'),
    commission_amount: z.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
  }),
});

/**
 * Schema para actualizar una comisión por franquicia
 */
export const updateFranchiseFeeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      franchise: z
        .string()
        .min(2)
        .regex(/^[A-Z0-9_]+$/, 'La franquicia solo puede contener letras mayúsculas, números y guiones bajos')
        .optional(),
      commission_pct: z.number().min(0).optional(),
      commission_amount: z.number().int().min(0).optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener/eliminar por ID
 */
export const getFranchiseFeeByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para filtrar (query params)
 */
export const getFranchiseFeesQuerySchema = z.object({
  query: z
    .object({
      is_active: z.enum(['true', 'false']).optional(),
    })
    .optional(),
});
