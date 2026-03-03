import { z } from 'zod';

// ── EventPlaces ───────────────────────────────────────────────────────────────

/**
 * Schema para crear un lugar
 */
export const createPlaceSchema = z.object({
  body: z.object({
    name_place: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    type_place: z.enum(['CLUB', 'DISCOTECA', 'TEATRO', 'CINE', 'ESTADIO'], {
      error: 'type_place debe ser CLUB, DISCOTECA, TEATRO, CINE o ESTADIO',
    }),
    place_type: z.enum(['NUMERADO', 'SIN_NUMERAR'], {
      error: 'place_type debe ser NUMERADO o SIN_NUMERAR',
    }),
    capacity: z
      .number({ message: 'La capacidad es requerida y debe ser un número' })
      .int('La capacidad debe ser un número entero')
      .positive('La capacidad debe ser mayor a 0'),
    map_place: z.any().optional(),
  }),
});

/**
 * Schema para actualizar un lugar
 */
export const updatePlaceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      name_place: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
      type_place: z.enum(['CLUB', 'DISCOTECA', 'TEATRO', 'CINE', 'ESTADIO']).optional(),
      place_type: z.enum(['NUMERADO', 'SIN_NUMERAR']).optional(),
      capacity: z.number().int().positive('La capacidad debe ser mayor a 0').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para actualizar solo el mapa JSON del lugar
 */
export const updatePlaceMapSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    map_place: z.record(z.string(), z.any()),
  }),
});

/**
 * Schema para obtener lugar por ID
 */
export const getPlaceByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para filtrar lugares (query params)
 */
export const getPlacesQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      type_place: z.enum(['CLUB', 'DISCOTECA', 'TEATRO', 'CINE', 'ESTADIO']).optional(),
      place_type: z.enum(['NUMERADO', 'SIN_NUMERAR']).optional(),
    })
    .optional(),
});

// ── EventPlaceZone ────────────────────────────────────────────────────────────

/**
 * Schema para crear una zona
 */
export const createZoneSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'El nombre de la zona es requerido'),
    capacity: z
      .number({ message: 'La capacidad es requerida y debe ser un número' })
      .int()
      .positive('La capacidad debe ser mayor a 0'),
    place_id: z
      .number({ message: 'El place_id es requerido y debe ser un número' })
      .int()
      .positive(),
  }),
});

/**
 * Schema para actualizar una zona
 */
export const updateZoneSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      name: z.string().min(1, 'El nombre no puede estar vacío').optional(),
      capacity: z.number().int().positive('La capacidad debe ser mayor a 0').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener zona por ID
 */
export const getZoneByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener zonas por lugar
 */
export const getZonesByPlaceSchema = z.object({
  params: z.object({
    place_id: z.string().regex(/^\d+$/, 'El place_id debe ser numérico'),
  }),
});

// ── EventPlaceRow ─────────────────────────────────────────────────────────────

/**
 * Schema para crear una fila
 */
export const createRowSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'El nombre de la fila es requerido'),
    zone_id: z
      .number({ message: 'El zone_id es requerido y debe ser un número' })
      .int()
      .positive(),
  }),
});

/**
 * Schema para actualizar una fila
 */
export const updateRowSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z
    .object({
      name: z.string().min(1, 'El nombre no puede estar vacío').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar',
    }),
});

/**
 * Schema para obtener fila por ID
 */
export const getRowByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener filas por zona
 */
export const getRowsByZoneSchema = z.object({
  params: z.object({
    zone_id: z.string().regex(/^\d+$/, 'El zone_id debe ser numérico'),
  }),
});

// ── EventPlaceSeat ────────────────────────────────────────────────────────────

/**
 * Schema para crear una silla individual
 */
export const createSeatSchema = z.object({
  body: z.object({
    seat_number: z.string().min(1, 'El número de silla es requerido'),
    row_id: z
      .number({ message: 'El row_id es requerido y debe ser un número' })
      .int()
      .positive(),
  }),
});

/**
 * Schema para crear múltiples sillas de una fila (bulk)
 */
export const createBulkSeatsSchema = z.object({
  body: z.object({
    row_id: z
      .number({ message: 'El row_id es requerido y debe ser un número' })
      .int()
      .positive(),
    seat_numbers: z
      .array(z.string().min(1))
      .min(1, 'Debe incluir al menos un número de silla')
      .max(200, 'Máximo 200 sillas por lote'),
  }),
});

/**
 * Schema para cambiar estado permanente de silla (mantenimiento)
 */
export const updateSeatStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    status: z.enum(['ACTIVE', 'BLOCKED_MAINTENANCE'], {
      error: 'El estado debe ser ACTIVE o BLOCKED_MAINTENANCE',
    }),
  }),
});

/**
 * Schema para obtener silla por ID
 */
export const getSeatByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener sillas por fila
 */
export const getSeatsByRowSchema = z.object({
  params: z.object({
    row_id: z.string().regex(/^\d+$/, 'El row_id debe ser numérico'),
  }),
});

/**
 * Schema para obtener sillas por lugar (con filtro opcional de status)
 */
export const getSeatsByPlaceSchema = z.object({
  params: z.object({
    place_id: z.string().regex(/^\d+$/, 'El place_id debe ser numérico'),
  }),
  query: z
    .object({
      status: z.enum(['ACTIVE', 'BLOCKED_MAINTENANCE']).optional(),
    })
    .optional(),
});

// ── EventSeatStatus ───────────────────────────────────────────────────────────

/**
 * Schema para inicializar el mapa de sillas de un evento
 */
export const initializeSeatMapSchema = z.object({
  body: z.object({
    place_id: z
      .number({ message: 'El place_id es requerido y debe ser un número' })
      .int()
      .positive(),
    event_id: z
      .number({ message: 'El event_id es requerido y debe ser un número' })
      .int()
      .positive(),
  }),
});

/**
 * Schema para reservar una silla en carrito (HELD)
 */
export const holdSeatSchema = z.object({
  body: z.object({
    seat_id: z
      .number({ message: 'El seat_id es requerido y debe ser un número' })
      .int()
      .positive(),
    event_id: z
      .number({ message: 'El event_id es requerido y debe ser un número' })
      .int()
      .positive(),
  }),
});

/**
 * Schema para liberar una silla del carrito
 */
export const releaseSeatSchema = z.object({
  body: z.object({
    seat_id: z
      .number({ message: 'El seat_id es requerido y debe ser un número' })
      .int()
      .positive(),
    event_id: z
      .number({ message: 'El event_id es requerido y debe ser un número' })
      .int()
      .positive(),
  }),
});

/**
 * Schema para bloquear una silla en un evento (cortesía, prensa, producción)
 */
export const blockSeatSchema = z.object({
  body: z.object({
    seat_id: z
      .number({ message: 'El seat_id es requerido y debe ser un número' })
      .int()
      .positive(),
    event_id: z
      .number({ message: 'El event_id es requerido y debe ser un número' })
      .int()
      .positive(),
  }),
});

/**
 * Schema para endpoints que solo reciben event_id como param
 */
export const eventIdParamSchema = z.object({
  params: z.object({
    event_id: z.string().regex(/^\d+$/, 'El event_id debe ser numérico'),
  }),
});