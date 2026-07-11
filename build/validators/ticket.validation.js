"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPublicKeySchema = exports.getEventStatsSchema = exports.cancelTicketSchema = exports.getUpcomingTicketsSchema = exports.validateTicketSchema = exports.transferTicketSchema = exports.getTicketByIdSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para obtener ticket por ID
 */
exports.getTicketByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para transferir ticket
 */
exports.transferTicketSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        to_user_id: zod_1.z.number().int().positive('El ID del receptor es requerido'),
        to_user_uid: zod_1.z.string().min(1, 'El UID del receptor es requerido'),
        to_user_id_phone: zod_1.z.string().min(1, 'El ID del teléfono del receptor es requerido'),
        from_user_id_phone: zod_1.z.string().min(1, 'El ID del teléfono del remitente es requerido'),
        transaction_type: zod_1.z.enum(['transfer', 'sale', 'gift'], {
            message: 'El tipo de transacción debe ser: transfer, sale o gift',
        }),
        description: zod_1.z.string().optional(),
    }),
});
/**
 * 🆕 Schema para validar ticket en entrada del evento
 * ACTUALIZADO: Ahora requiere event_id
 */
exports.validateTicketSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        qr_token: zod_1.z.string().min(32, 'El token del QR es inválido'),
        event_id: zod_1.z.number().int().positive('El ID del evento es requerido'), // 🆕 Agregado
    }),
});
/**
 * Schema para obtener tickets próximos
 */
exports.getUpcomingTicketsSchema = zod_1.z.object({
    query: zod_1.z.object({
        days: zod_1.z.string().regex(/^\d+$/, 'Los días deben ser numéricos').optional(),
    }).optional(),
});
/**
 * Schema para cancelar ticket
 */
exports.cancelTicketSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener stats de evento
 */
exports.getEventStatsSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
exports.registerPublicKeySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, { message: 'id debe ser numérico' }),
    }),
    body: zod_1.z.object({
        device_public_key: zod_1.z.string().min(10, { message: 'Public key inválida' }),
    }),
});
