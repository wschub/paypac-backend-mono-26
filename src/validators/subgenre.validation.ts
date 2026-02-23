import { z } from 'zod';

/**
 * Schema para crear un subgénero
 */
export const createSubgenreSchema = z.object({
  body: z.object({
    subcategory_name: z
      .string()
      .min(2, 'El nombre del subgénero debe tener al menos 2 caracteres'),
    subcategory_id: z
      .number({ message: 'El subcategory_id es requerido y debe ser un número' })
      .int('El subcategory_id debe ser un número entero')
      .positive('El subcategory_id debe ser un número positivo'),
  }),
});

/**
 * Schema para actualizar un subgénero
 */
export const updateSubgenreSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      subcategory_name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .optional(),
      subcategory_id: z
        .number({ message: 'El subcategory_id debe ser un número' })
        .int()
        .positive('El subcategory_id debe ser un número positivo')
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener subgénero por ID
 */
export const getSubgenreByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener subgéneros por subcategoría
 */
export const getSubgenresBySubCategorySchema = z.object({
  params: z.object({
    subcategory_id: z.string().regex(/^\d+$/, 'El subcategory_id debe ser numérico'),
  }),
});

/**
 * Schema para filtrar subgéneros (query params)
 * Soporta filtro en cascada: subcategory_id → category_id → country_id
 */
export const getSubgenresQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      subcategory_id: z
        .string()
        .regex(/^\d+$/, 'El subcategory_id debe ser numérico')
        .optional(),
      category_id: z
        .string()
        .regex(/^\d+$/, 'El category_id debe ser numérico')
        .optional(),
      country_id: z
        .string()
        .regex(/^\d+$/, 'El country_id debe ser numérico')
        .optional(),
    })
    .optional(),
});

/**
 * Schema para stats (query params opcionales)
 */
export const getSubgenresStatsSchema = z.object({
  query: z
    .object({
      subcategory_id: z
        .string()
        .regex(/^\d+$/, 'El subcategory_id debe ser numérico')
        .optional(),
      category_id: z
        .string()
        .regex(/^\d+$/, 'El category_id debe ser numérico')
        .optional(),
      country_id: z
        .string()
        .regex(/^\d+$/, 'El country_id debe ser numérico')
        .optional(),
    })
    .optional(),
});