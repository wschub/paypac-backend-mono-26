"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteStaffSchema = exports.getStaffStatsSchema = exports.checkOutStaffSchema = exports.checkInStaffSchema = exports.removeStaffSchema = exports.getEventStaffSchema = exports.assignStaffSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para asignar STAFF a evento
 */
exports.assignStaffSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
    body: zod_1.z.object({
        user_id: zod_1.z.number({ message: 'El user_id es requerido y debe ser un número' }).int().positive(),
        role_type: zod_1.z.enum(['STAFF', 'STAFF_PROMOTER'], {
            message: 'El tipo de rol debe ser STAFF o STAFF_PROMOTER',
        }),
    }),
});
/**
 * Schema para obtener staff de un evento
 */
exports.getEventStaffSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
/**
 * Schema para remover staff de evento
 */
exports.removeStaffSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
        staffUserId: zod_1.z.string().regex(/^\d+$/, 'El staffUserId debe ser numérico'),
    }),
});
/**
 * Schema para check-in de staff
 */
exports.checkInStaffSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
    body: zod_1.z.object({
        latitude: zod_1.z.string().optional(),
        longitude: zod_1.z.string().optional(),
    }).optional(),
});
/**
 * Schema para check-out de staff
 */
exports.checkOutStaffSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
/**
 * Schema para obtener stats de staff
 */
exports.getStaffStatsSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
//enviar invitacion 
exports.inviteStaffSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
    query: zod_1.z.object({
        invite: zod_1.z.literal('true'),
    }),
    body: zod_1.z.object({
        role_type: zod_1.z.enum(['STAFF', 'STAFF_PROMOTER'], {
            error: 'role_type debe ser STAFF o STAFF_PROMOTER',
        }),
        door_identifier: zod_1.z.string().optional(),
        email_or_phone: zod_1.z
            .string()
            .min(5, 'Email o teléfono requerido')
            .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\+?[\d\s\-]{7,15}$/.test(val), { message: 'Debe ser un email o teléfono válido' }),
    }),
});
