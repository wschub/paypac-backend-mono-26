import { z } from 'zod';

/**
 * Schema para crear un país
 */
export const createCountrySchema = z.object({
  body: z.object({
    name_country: z.string().min(2, 'El nombre del país debe tener al menos 2 caracteres'),
    code: z.string().length(2, 'El código ISO debe tener exactamente 2 caracteres').toUpperCase(),
    phone_code: z.string().min(1, 'El código telefónico es requerido').regex(/^\+?\d+$/, 'Debe ser un código telefónico válido (ej: +57)'),
    currency: z.string().length(3, 'El código de moneda debe tener exactamente 3 caracteres').toUpperCase(),
    language_default: z.string().length(2, 'El código de idioma debe tener exactamente 2 caracteres').toLowerCase(),
  }),
});

/**
 * Schema para actualizar un país
 */
export const updateCountrySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    name_country: z.string().min(2).optional(),
    code: z.string().length(2).toUpperCase().optional(),
    phone_code: z.string().min(1).regex(/^\+?\d+$/).optional(),
    currency: z.string().length(3).toUpperCase().optional(),
    language_default: z.string().length(2).toLowerCase().optional(),
  }),
});

/**
 * Schema para obtener país por ID
 */
export const getCountryByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para filtrar países
 */
export const getCountriesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(), // Buscar por nombre o código
    code: z.string().length(2).toUpperCase().optional(), // Filtrar por código ISO
  }).optional(),
});