import { z } from 'zod';

/**
 * Schema para agregar favorito
 */
export const addFavoriteSchema = z.object({
  body: z.object({
    event_id: z.number().int().positive('El ID del evento es requerido'),
    price_ticket: z.number().int().min(0, 'El precio del ticket debe ser mayor o igual a 0'),
    locality_id: z.number().int().positive().optional().nullable(),
  }),
});

/**
 * Schema para actualizar favorito
 */
export const updateFavoriteSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    price_ticket: z.number().int().min(0).optional(),
    locality_id: z.number().int().positive().optional().nullable(),
  }),
});

/**
 * Schema para obtener favorito por ID
 */
export const getFavoriteByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para toggle favorito
 */
export const toggleFavoriteSchema = z.object({
  body: z.object({
    event_id: z.number().int().positive('El ID del evento es requerido'),
  }),
});

/**
 * Schema para verificar favorito
 */
export const checkFavoriteSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});

/**
 * Schema para obtener eventos populares
 */
export const getMostPopularEventsSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).optional(),
  }).optional(),
});

/**
 * Schema para obtener favoritos recientes
 */
export const getRecentFavoritesSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).optional(),
  }).optional(),
});

/**
 * Schema para obtener conteo de favoritos de un evento
 */
export const getEventFavoritesCountSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
  }),
});