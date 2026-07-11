"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liquidationQuerySchema = exports.liquidationIdParamSchema = exports.updateLiquidationStatusSchema = exports.createLiquidationSchema = void 0;
const zod_1 = require("zod");
exports.createLiquidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        company_id: zod_1.z.number().int().positive(),
        event_id: zod_1.z.number().int().positive(),
        gross_amount: zod_1.z.number().positive(),
        paypac_commission: zod_1.z.number().min(0),
        promoter_commission: zod_1.z.number().min(0).optional(),
        refunds: zod_1.z.number().min(0).optional(),
        liquidation_date: zod_1.z.string().datetime(),
    }),
});
exports.updateLiquidationStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'PAID', 'OVERDUE'], { error: 'Status inválido' }),
    }),
});
exports.liquidationIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, { message: 'id debe ser numérico' }),
    }),
});
exports.liquidationQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
        event_id: zod_1.z.string().regex(/^\d+$/).optional(),
        from: zod_1.z.string().datetime().optional(),
        to: zod_1.z.string().datetime().optional(),
    }).optional(),
});
