"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventViewSchema = exports.createEventViewSchema = void 0;
const zod_1 = require("zod");
exports.createEventViewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        session_token: zod_1.z.string().uuid(),
        user_id: zod_1.z.number().optional().nullable(),
        session_channel: zod_1.z.enum(['WEB', 'APP']),
        country_id: zod_1.z.number().optional().nullable(),
        city_id: zod_1.z.number().optional().nullable(),
    }),
});
exports.updateEventViewSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
        sessionToken: zod_1.z.string().uuid(),
    }),
    body: zod_1.z.object({
        duration: zod_1.z.number().int().positive(),
    }),
});
