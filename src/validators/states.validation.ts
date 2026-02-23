import { z } from 'zod';

/**
 * Schema para crear un estado
 */
export const createStateSchema = z.object({
  body: z.object({
    name_state: z.string().min(2, 'El nombre del estado debe tener al menos 2 caracteres'),
    country_id: z
      .number({ message: 'El country_id es requerido y debe ser un número' })
      .int('El country_id debe ser un número entero')
      .positive('El country_id debe ser un número positivo'),
  }),
});

/**
 * Schema para actualizar un estado
 */
export const updateStateSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      name_state: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
      country_id: z.number().int().positive('El country_id debe ser un número positivo').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener estado por ID
 */
export const getStateByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener estados por país
 */
export const getStatesByCountrySchema = z.object({
  params: z.object({
    country_id: z.string().regex(/^\d+$/, 'El country_id debe ser numérico'),
  }),
});

/**
 * Schema para filtrar estados (query params)
 */
export const getStatesQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      country_id: z.string().regex(/^\d+$/, 'El country_id debe ser numérico').optional(),
    })
    .optional(),
});

/**
 * Schema para stats (query params opcionales)
 */
export const getStatesStatsSchema = z.object({
  query: z
    .object({
      country_id: z.string().regex(/^\d+$/, 'El country_id debe ser numérico').optional(),
    })
    .optional(),
});