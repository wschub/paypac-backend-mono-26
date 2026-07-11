"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventIdParamSchema = exports.blockSeatSchema = exports.releaseSeatSchema = exports.holdSeatSchema = exports.initializeSeatMapSchema = exports.getSeatsByPlaceSchema = exports.getSeatsByRowSchema = exports.getSeatByIdSchema = exports.updateSeatStatusSchema = exports.createBulkSeatsSchema = exports.createSeatSchema = exports.getRowsByZoneSchema = exports.getRowByIdSchema = exports.updateRowSchema = exports.createRowSchema = exports.getZonesByPlaceSchema = exports.getZoneByIdSchema = exports.updateZoneSchema = exports.createZoneSchema = exports.getPlacesQuerySchema = exports.getPlaceByIdSchema = exports.updatePlaceMapSchema = exports.updatePlaceSchema = exports.createPlaceSchema = void 0;
const zod_1 = require("zod");
// ── EventPlaces ───────────────────────────────────────────────────────────────
/**
 * Schema para crear un lugar
 */
exports.createPlaceSchema = zod_1.z.object({
    body: zod_1.z.object({
        name_place: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
        type_place: zod_1.z.enum(['CLUB', 'DISCOTECA', 'TEATRO', 'CINE', 'ESTADIO'], {
            error: 'type_place debe ser CLUB, DISCOTECA, TEATRO, CINE o ESTADIO',
        }),
        place_type: zod_1.z.enum(['NUMERADO', 'SIN_NUMERAR'], {
            error: 'place_type debe ser NUMERADO o SIN_NUMERAR',
        }),
        capacity: zod_1.z
            .number({ message: 'La capacidad es requerida y debe ser un número' })
            .int('La capacidad debe ser un número entero')
            .positive('La capacidad debe ser mayor a 0'),
        map_place: zod_1.z.any().optional(),
    }),
});
/**
 * Schema para actualizar un lugar
 */
exports.updatePlaceSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z
        .object({
        name_place: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
        type_place: zod_1.z.enum(['CLUB', 'DISCOTECA', 'TEATRO', 'CINE', 'ESTADIO']).optional(),
        place_type: zod_1.z.enum(['NUMERADO', 'SIN_NUMERAR']).optional(),
        capacity: zod_1.z.number().int().positive('La capacidad debe ser mayor a 0').optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    }),
});
/**
 * Schema para actualizar solo el mapa JSON del lugar
 */
exports.updatePlaceMapSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        map_place: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    }),
});
/**
 * Schema para obtener lugar por ID
 */
exports.getPlaceByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para filtrar lugares (query params)
 */
exports.getPlacesQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().optional(),
        type_place: zod_1.z.enum(['CLUB', 'DISCOTECA', 'TEATRO', 'CINE', 'ESTADIO']).optional(),
        place_type: zod_1.z.enum(['NUMERADO', 'SIN_NUMERAR']).optional(),
    })
        .optional(),
});
// ── EventPlaceZone ────────────────────────────────────────────────────────────
/**
 * Schema para crear una zona
 */
exports.createZoneSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'El nombre de la zona es requerido'),
        capacity: zod_1.z
            .number({ message: 'La capacidad es requerida y debe ser un número' })
            .int()
            .positive('La capacidad debe ser mayor a 0'),
        place_id: zod_1.z
            .number({ message: 'El place_id es requerido y debe ser un número' })
            .int()
            .positive(),
    }),
});
/**
 * Schema para actualizar una zona
 */
exports.updateZoneSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1, 'El nombre no puede estar vacío').optional(),
        capacity: zod_1.z.number().int().positive('La capacidad debe ser mayor a 0').optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    }),
});
/**
 * Schema para obtener zona por ID
 */
exports.getZoneByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener zonas por lugar
 */
exports.getZonesByPlaceSchema = zod_1.z.object({
    params: zod_1.z.object({
        place_id: zod_1.z.string().regex(/^\d+$/, 'El place_id debe ser numérico'),
    }),
});
// ── EventPlaceRow ─────────────────────────────────────────────────────────────
/**
 * Schema para crear una fila
 */
exports.createRowSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'El nombre de la fila es requerido'),
        zone_id: zod_1.z
            .number({ message: 'El zone_id es requerido y debe ser un número' })
            .int()
            .positive(),
    }),
});
/**
 * Schema para actualizar una fila
 */
exports.updateRowSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1, 'El nombre no puede estar vacío').optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    }),
});
/**
 * Schema para obtener fila por ID
 */
exports.getRowByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener filas por zona
 */
exports.getRowsByZoneSchema = zod_1.z.object({
    params: zod_1.z.object({
        zone_id: zod_1.z.string().regex(/^\d+$/, 'El zone_id debe ser numérico'),
    }),
});
// ── EventPlaceSeat ────────────────────────────────────────────────────────────
/**
 * Schema para crear una silla individual
 */
exports.createSeatSchema = zod_1.z.object({
    body: zod_1.z.object({
        seat_number: zod_1.z.string().min(1, 'El número de silla es requerido'),
        row_id: zod_1.z
            .number({ message: 'El row_id es requerido y debe ser un número' })
            .int()
            .positive(),
    }),
});
/**
 * Schema para crear múltiples sillas de una fila (bulk)
 */
exports.createBulkSeatsSchema = zod_1.z.object({
    body: zod_1.z.object({
        row_id: zod_1.z
            .number({ message: 'El row_id es requerido y debe ser un número' })
            .int()
            .positive(),
        seat_numbers: zod_1.z
            .array(zod_1.z.string().min(1))
            .min(1, 'Debe incluir al menos un número de silla')
            .max(200, 'Máximo 200 sillas por lote'),
    }),
});
/**
 * Schema para cambiar estado permanente de silla (mantenimiento)
 */
exports.updateSeatStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['ACTIVE', 'BLOCKED_MAINTENANCE'], {
            error: 'El estado debe ser ACTIVE o BLOCKED_MAINTENANCE',
        }),
    }),
});
/**
 * Schema para obtener silla por ID
 */
exports.getSeatByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener sillas por fila
 */
exports.getSeatsByRowSchema = zod_1.z.object({
    params: zod_1.z.object({
        row_id: zod_1.z.string().regex(/^\d+$/, 'El row_id debe ser numérico'),
    }),
});
/**
 * Schema para obtener sillas por lugar (con filtro opcional de status)
 */
exports.getSeatsByPlaceSchema = zod_1.z.object({
    params: zod_1.z.object({
        place_id: zod_1.z.string().regex(/^\d+$/, 'El place_id debe ser numérico'),
    }),
    query: zod_1.z
        .object({
        status: zod_1.z.enum(['ACTIVE', 'BLOCKED_MAINTENANCE']).optional(),
    })
        .optional(),
});
// ── EventSeatStatus ───────────────────────────────────────────────────────────
/**
 * Schema para inicializar el mapa de sillas de un evento
 */
exports.initializeSeatMapSchema = zod_1.z.object({
    body: zod_1.z.object({
        place_id: zod_1.z
            .number({ message: 'El place_id es requerido y debe ser un número' })
            .int()
            .positive(),
        event_id: zod_1.z
            .number({ message: 'El event_id es requerido y debe ser un número' })
            .int()
            .positive(),
    }),
});
/**
 * Schema para reservar una silla en carrito (HELD)
 */
exports.holdSeatSchema = zod_1.z.object({
    body: zod_1.z.object({
        seat_id: zod_1.z
            .number({ message: 'El seat_id es requerido y debe ser un número' })
            .int()
            .positive(),
        event_id: zod_1.z
            .number({ message: 'El event_id es requerido y debe ser un número' })
            .int()
            .positive(),
    }),
});
/**
 * Schema para liberar una silla del carrito
 */
exports.releaseSeatSchema = zod_1.z.object({
    body: zod_1.z.object({
        seat_id: zod_1.z
            .number({ message: 'El seat_id es requerido y debe ser un número' })
            .int()
            .positive(),
        event_id: zod_1.z
            .number({ message: 'El event_id es requerido y debe ser un número' })
            .int()
            .positive(),
    }),
});
/**
 * Schema para bloquear una silla en un evento (cortesía, prensa, producción)
 */
exports.blockSeatSchema = zod_1.z.object({
    body: zod_1.z.object({
        seat_id: zod_1.z
            .number({ message: 'El seat_id es requerido y debe ser un número' })
            .int()
            .positive(),
        event_id: zod_1.z
            .number({ message: 'El event_id es requerido y debe ser un número' })
            .int()
            .positive(),
    }),
});
/**
 * Schema para endpoints que solo reciben event_id como param
 */
exports.eventIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        event_id: zod_1.z.string().regex(/^\d+$/, 'El event_id debe ser numérico'),
    }),
});
