import { z } from 'zod';

/**
 * Validación de color hexadecimal
 */
const hexColorSchema = z.string().regex(
  /^#[0-9A-F]{6}$/i,
  'Debe ser un color hexadecimal válido (ej: #FF5733)'
);

/**
 * Schema para crear una localidad
 */
export const createLocalitySchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
  body: z.object({
    name_locality: z.string().min(2, 'El nombre de la localidad debe tener al menos 2 caracteres'),
    bkg_color: hexColorSchema,
    title_color: hexColorSchema,
    text_color: hexColorSchema,
    title_color_location: hexColorSchema,
  }),
});

/**
 * Schema para actualizar una localidad
 */
export const updateLocalitySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    name_locality: z.string().min(2).optional(),
    bkg_color: hexColorSchema.optional(),
    title_color: hexColorSchema.optional(),
    text_color: hexColorSchema.optional(),
    title_color_location: hexColorSchema.optional(),
  }),
});

/**
 * Schema para obtener localidad por ID
 */
export const getLocalityByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener localidades por evento
 */
export const getLocalitiesByEventIdSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});