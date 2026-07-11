"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanOldMessagesSchema = exports.retryMessageSchema = exports.getMessagesQuerySchema = exports.getMessageByIdSchema = exports.queueEmailSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para encolar un email
 */
exports.queueEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.number().int().positive(),
        email: zod_1.z.string().email(),
        templateCode: zod_1.z.string().min(3),
        variables: zod_1.z.record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), zod_1.z.number()])),
        sendAt: zod_1.z.string().datetime().optional(),
    }),
});
/**
 * Schema para obtener mensaje por ID
 */
exports.getMessageByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/),
    }),
});
/**
 * Schema para filtrar mensajes
 */
exports.getMessagesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['0', '1', '2']).optional(),
        user_id: zod_1.z.string().regex(/^\d+$/).optional(),
    }).optional(),
});
/**
 * Schema para reintentar mensaje
 */
exports.retryMessageSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/),
    }),
});
/**
 * Schema para limpiar antiguos
 */
exports.cleanOldMessagesSchema = zod_1.z.object({
    body: zod_1.z.object({
        days_old: zod_1.z.number().int().min(1).max(365).default(30),
    }),
});
