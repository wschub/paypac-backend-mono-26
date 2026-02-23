import { z } from 'zod';

/**
 * Schema para crear una ciudad
 */
export const createCitySchema = z.object({
  body: z.object({
    name_city: z.string().min(2, 'El nombre de la ciudad debe tener al menos 2 caracteres'),
    state_id: z
      .number({ message: 'El state_id es requerido y debe ser un número' })
      .int('El state_id debe ser un número entero')
      .positive('El state_id debe ser un número positivo'),
    country_id: z
      .number({ message: 'El country_id es requerido y debe ser un número' })
      .int('El country_id debe ser un número entero')
      .positive('El country_id debe ser un número positivo'),
    latitude: z.string().optional().default(''),
    longitude: z.string().optional().default(''),
  }),
});

/**
 * Schema para actualizar una ciudad
 */
export const updateCitySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      name_city: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .optional(),
      state_id: z
        .number({ message: 'El state_id debe ser un número' })
        .int()
        .positive('El state_id debe ser un número positivo')
        .optional(),
      country_id: z
        .number({ message: 'El country_id debe ser un número' })
        .int()
        .positive('El country_id debe ser un número positivo')
        .optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener ciudad por ID
 */
export const getCityByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener ciudades por país
 */
export const getCitiesByCountrySchema = z.object({
  params: z.object({
    country_id: z.string().regex(/^\d+$/, 'El country_id debe ser numérico'),
  }),
});

/**
 * Schema para obtener ciudades por estado
 */
export const getCitiesByStateSchema = z.object({
  params: z.object({
    state_id: z.string().regex(/^\d+$/, 'El state_id debe ser numérico'),
  }),
});

/**
 * Schema para filtrar ciudades (query params)
 */
export const getCitiesQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      country_id: z.string().regex(/^\d+$/, 'El country_id debe ser numérico').optional(),
      state_id: z.string().regex(/^\d+$/, 'El state_id debe ser numérico').optional(),
    })
    .optional(),
});

/**
 * Schema para stats (query params opcionales)
 */
export const getCitiesStatsSchema = z.object({
  query: z
    .object({
      country_id: z.string().regex(/^\d+$/, 'El country_id debe ser numérico').optional(),
      state_id: z.string().regex(/^\d+$/, 'El state_id debe ser numérico').optional(),
    })
    .optional(),
});