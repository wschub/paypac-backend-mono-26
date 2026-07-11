"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitingListIdParamSchema = exports.localityIdParamSchema = exports.eventIdParamSchema = exports.registerWaitingListAuthSchema = exports.registerWaitingListSchema = void 0;
const zod_1 = require("zod");
exports.registerWaitingListSchema = zod_1.z.object({
    body: zod_1.z.object({
        event_id: zod_1.z.number().int().positive({ message: 'event_id es requerido' }),
        locality_id: zod_1.z.number().int().positive().nullable().optional(),
        name: zod_1.z.string().min(1).max(100),
        last_name: zod_1.z.string().min(1).max(100),
        email: zod_1.z.string().email({ message: 'email inválido' }),
        phone_number: zod_1.z.string().min(7).max(20),
        qty_requested: zod_1.z.number().int().min(1).max(10).optional(),
    }),
});
/** Registro autenticado (app): datos personales salen del token */
exports.registerWaitingListAuthSchema = zod_1.z.object({
    body: zod_1.z.object({
        event_id: zod_1.z.number().int().positive({ message: 'event_id es requerido' }),
        locality_id: zod_1.z.number().int().positive().nullable().optional(),
        qty_requested: zod_1.z.number().int().min(1).max(10).optional(),
    }),
});
exports.eventIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/).transform(Number),
    }),
});
exports.localityIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        localityId: zod_1.z.string().regex(/^\d+$/).transform(Number),
    }),
});
exports.waitingListIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/).transform(Number),
    }),
});
