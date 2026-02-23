import { z } from 'zod';

/**
 * Schema para crear una categoría
 */
export const createCategorySchema = z.object({
  body: z.object({
    category_name: z
      .string()
      .min(2, 'El nombre de la categoría debe tener al menos 2 caracteres'),
    category_icon: z.string().optional(),
    country_id: z
      .number({ message: 'El country_id es requerido y debe ser un número' })
      .int('El country_id debe ser un número entero')
      .positive('El country_id debe ser un número positivo'),
  }),
});

/**
 * Schema para actualizar una categoría
 */
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      category_name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .optional(),
      category_icon: z.string().optional(),
      country_id: z
        .number({ message: 'El country_id debe ser un número' })
        .int()
        .positive('El country_id debe ser un número positivo')
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener categoría por ID
 */
export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener categorías por país
 */
export const getCategoriesByCountrySchema = z.object({
  params: z.object({
    country_id: z.string().regex(/^\d+$/, 'El country_id debe ser numérico'),
  }),
});

/**
 * Schema para filtrar categorías (query params)
 */
export const getCategoriesQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
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
export const getCategoriesStatsSchema = z.object({
  query: z
    .object({
      country_id: z
        .string()
        .regex(/^\d+$/, 'El country_id debe ser numérico')
        .optional(),
    })
    .optional(),
});