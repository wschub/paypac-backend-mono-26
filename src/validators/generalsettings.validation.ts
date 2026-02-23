import { z } from 'zod';

/**
 * Schema para crear una variable de configuración
 */
export const createSettingSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .regex(
        /^[A-Z0-9_]+$/,
        'El nombre solo puede contener letras mayúsculas, números y guiones bajos (ej: MAX_TICKETS_PER_USER)'
      ),
    value: z.string().min(1, 'El valor es requerido'),
    description: z.string().optional(),
  }),
});

/**
 * Schema para actualizar una variable
 */
export const updateSettingSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(2)
        .regex(
          /^[A-Z0-9_]+$/,
          'El nombre solo puede contener letras mayúsculas, números y guiones bajos'
        )
        .optional(),
      value: z.string().min(1, 'El valor no puede estar vacío').optional(),
      description: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener variable por ID
 */
export const getSettingByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener variable por nombre
 */
export const getSettingByNameSchema = z.object({
  params: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
  }),
});

/**
 * Schema para filtrar variables (query params)
 */
export const getSettingsQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
    })
    .optional(),
});