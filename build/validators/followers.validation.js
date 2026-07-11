"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginatedSchema = exports.followUserSchema = void 0;
const zod_1 = require("zod");
exports.followUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        following_id: zod_1.z.number().int().positive({ message: 'ID de usuario inválido' }),
    }),
});
exports.getPaginatedSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
});
