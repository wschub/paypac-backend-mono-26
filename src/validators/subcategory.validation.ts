import { z } from 'zod';

/**
 * Schema para crear una subcategoría
 */
export const createSubCategorySchema = z.object({
  body: z.object({
    subcategory_name: z
      .string()
      .min(2, 'El nombre de la subcategoría debe tener al menos 2 caracteres'),
    category_id: z
      .number({ message: 'El category_id es requerido y debe ser un número' })
      .int('El category_id debe ser un número entero')
      .positive('El category_id debe ser un número positivo'),
  }),
});

/**
 * Schema para actualizar una subcategoría
 */
export const updateSubCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      subcategory_name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .optional(),
      category_id: z
        .number({ message: 'El category_id debe ser un número' })
        .int()
        .positive('El category_id debe ser un número positivo')
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener subcategoría por ID
 */
export const getSubCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener subcategorías por categoría
 */
export const getSubCategoriesByCategorySchema = z.object({
  params: z.object({
    category_id: z.string().regex(/^\d+$/, 'El category_id debe ser numérico'),
  }),
});

/**
 * Schema para filtrar subcategorías (query params)
 */
export const getSubCategoriesQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
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
export const getSubCategoriesStatsSchema = z.object({
  query: z
    .object({
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