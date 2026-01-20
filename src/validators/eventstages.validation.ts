import { z } from 'zod';

/**
 * Schema para crear una etapa (stage)
 */
export const createStageSchema = z.object({
  params: z.object({
    localityId: z.string().regex(/^\d+$/, 'El localityId debe ser numérico'),
  }),
  body: z.object({
    stage_name: z.string().min(2, 'El nombre de la etapa debe tener al menos 2 caracteres'),
    date_start: z.string().datetime('Debe ser una fecha válida ISO 8601'),
    date_end: z.string().datetime('Debe ser una fecha válida ISO 8601'),
    price_ticket: z.number().int().positive('El precio del ticket debe ser un número positivo'),
  }).refine(
    (data) => {
      const start = new Date(data.date_start);
      const end = new Date(data.date_end);
      return end > start;
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      path: ['date_end'],
    }
  ),
});

/**
 * Schema para actualizar una etapa
 */
export const updateStageSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    stage_name: z.string().min(2).optional(),
    date_start: z.string().datetime().optional(),
    date_end: z.string().datetime().optional(),
    price_ticket: z.number().int().positive().optional(),
  }).refine(
    (data) => {
      // Solo validar si ambas fechas están presentes
      if (data.date_start && data.date_end) {
        const start = new Date(data.date_start);
        const end = new Date(data.date_end);
        return end > start;
      }
      return true;
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      path: ['date_end'],
    }
  ),
});

/**
 * Schema para obtener etapa por ID
 */
export const getStageByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener etapas por localidad
 */
export const getStagesByLocalityIdSchema = z.object({
  params: z.object({
    localityId: z.string().regex(/^\d+$/, 'El localityId debe ser numérico'),
  }),
});