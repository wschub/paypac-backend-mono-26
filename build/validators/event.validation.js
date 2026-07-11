"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsQuerySchema = exports.updateEventStatusSchema = exports.getEventByIdSchema = exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear un evento
 */
exports.createEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        short_description: zod_1.z.string().min(10, 'La descripción corta debe tener al menos 10 caracteres'),
        description: zod_1.z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
        image: zod_1.z.string().url('Debe ser una URL válida').optional().or(zod_1.z.literal('')),
        cover: zod_1.z.string().url('Debe ser una URL válida').optional().or(zod_1.z.literal('')),
        date_event: zod_1.z.string().datetime('Debe ser una fecha válida ISO 8601'),
        place_address: zod_1.z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
        latitude: zod_1.z.string().optional().or(zod_1.z.literal('')),
        longitude: zod_1.z.string().optional().or(zod_1.z.literal('')),
        city: zod_1.z.string().min(2, 'La ciudad es requerida'),
        country: zod_1.z.string().min(2, 'El país es requerido'),
        currency: zod_1.z.string().default('COP'),
        event_type: zod_1.z.enum(['PUBLICO', 'PRIVADO']).default('PUBLICO'),
        type_venue: zod_1.z.enum(['NUMERADO', 'SIN_NUMERAR']).default('SIN_NUMERAR'),
        date_type: zod_1.z.enum(['SINGLE', 'MULTIPLE', 'RANGE_DATE', 'RANGE_DATE_EXCEPT', 'EXPLICIT_DATES']).default('SINGLE'),
        url_video: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        num_max_tickets: zod_1.z.number().int().positive('El número máximo de tickets debe ser positivo').optional().default(0),
        // Configuración de negocio
        apply_dcto: zod_1.z.boolean().default(false),
        allow_external_promoters: zod_1.z.boolean().default(false),
        allow_paypac_promotion: zod_1.z.boolean().default(false),
        sales_channel: zod_1.z.string().default('app'),
        commission_to_charge: zod_1.z.number().min(0).max(100).default(0),
        commission_to_promoter: zod_1.z.number().min(0).max(100).default(0),
        // Lugar numerado (opcional)
        numbered_place_id: zod_1.z.number().int().positive().optional().nullable(),
    }),
});
/**
 * Schema para actualizar un evento
 */
exports.updateEventSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).optional(),
        short_description: zod_1.z.string().min(10).optional(),
        description: zod_1.z.string().min(20).optional(),
        image: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        cover: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        date_event: zod_1.z.string().datetime().optional(),
        place_address: zod_1.z.string().min(5).optional(),
        latitude: zod_1.z.string().optional(),
        longitude: zod_1.z.string().optional(),
        city: zod_1.z.string().min(2).optional(),
        country: zod_1.z.string().min(2).optional(),
        currency: zod_1.z.string().optional(),
        event_type: zod_1.z.enum(['PUBLICO', 'PRIVADO']).optional(),
        type_venue: zod_1.z.enum(['NUMERADO', 'SIN_NUMERAR']).optional(),
        date_type: zod_1.z.enum(['SINGLE', 'MULTIPLE', 'RANGE_DATE', 'RANGE_DATE_EXCEPT', 'EXPLICIT_DATES']).optional(),
        url_video: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        num_max_tickets: zod_1.z.number().int().positive().optional(),
        apply_dcto: zod_1.z.boolean().optional(),
        allow_external_promoters: zod_1.z.boolean().optional(),
        allow_paypac_promotion: zod_1.z.boolean().optional(),
        sales_channel: zod_1.z.string().optional(),
        commission_to_charge: zod_1.z.number().min(0).max(100).optional(),
        commission_to_promoter: zod_1.z.number().min(0).max(100).optional(),
        numbered_place_id: zod_1.z.number().int().positive().optional().nullable(),
    }),
});
/**
 * Schema para obtener evento por ID
 */
exports.getEventByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().refine((val) => /^\d+$/.test(val) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), 'El id debe ser numérico o un public_id UUID'),
    }),
});
/**
 * Schema para actualizar el status del evento
 */
exports.updateEventStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum([
            'CREATED',
            'APPROVED',
            'SCHEDULED',
            'ACTIVE',
            'CANCELED',
            'RE_SCHEDULED',
            'FINALIZED',
        ]),
    }),
});
/**
 * Schema para validar query params en GET /events
 */
const EVENT_STATUS_VALUES = [
    'CREATED', 'APPROVED', 'SCHEDULED', 'ACTIVE',
    'CANCELED', 'RE_SCHEDULED', 'FINALIZED',
];
exports.getEventsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.string()
            .optional()
            .refine((val) => !val || val.split(',').every(s => EVENT_STATUS_VALUES.includes(s)), { message: `Status inválido. Valores permitidos: ${EVENT_STATUS_VALUES.join(', ')}` }),
        event_type: zod_1.z.enum(['PUBLICO', 'PRIVADO']).optional(),
        category_id: zod_1.z.string().regex(/^\d+$/).optional(),
        subcategory_id: zod_1.z.string().regex(/^\d+$/).optional(), // ← agregar
        subgenre_id: zod_1.z.string().regex(/^\d+$/).optional(), // ← agregar
        country: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        date_from: zod_1.z.string().datetime().optional(), // ← agregar
        date_to: zod_1.z.string().datetime().optional(), // ← agregar
        latitude: zod_1.z.string().optional(), // ← agregar
        longitude: zod_1.z.string().optional(),
        allow_external_promoters: zod_1.z.enum(['true', 'false']).optional(), // ← agregar
    }).optional(),
});
