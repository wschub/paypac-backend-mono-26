"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistorySchema = exports.transferPointsSchema = void 0;
const zod_1 = require("zod");
exports.transferPointsSchema = zod_1.z.object({
    body: zod_1.z.object({
        to_user_id: zod_1.z.number().int().positive({ message: 'ID de usuario inválido' }),
        points: zod_1.z.number().int().positive({ message: 'La cantidad de puntos debe ser positiva' }),
        description: zod_1.z.string().max(500).optional(),
    }),
});
exports.getHistorySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        type: zod_1.z
            .enum(['EARNED', 'REDEEMED', 'EXPIRED', 'TRANSFER_SENT', 'TRANSFER_RECEIVED', 'ADJUSTMENT', 'BONUS', 'REFUND'])
            .optional(),
    }),
});
