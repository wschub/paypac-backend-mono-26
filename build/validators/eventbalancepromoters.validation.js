"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCutoffDateSchema = exports.createRefundBalanceSchema = exports.bulkMarkAsPaidSchema = exports.markAsPaidSchema = exports.getPromoterBalanceSchema = exports.getBalancesByEventIdSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para obtener balances por evento
 */
exports.getBalancesByEventIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
/**
 * Schema para obtener balance de promotor
 */
exports.getPromoterBalanceSchema = zod_1.z.object({
    params: zod_1.z.object({
        promoterId: zod_1.z.string().regex(/^\d+$/, 'El promoterId debe ser numérico'),
    }),
});
/**
 * Schema para marcar como pagado
 */
exports.markAsPaidSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        payment_method: zod_1.z.string().optional(),
        payment_reference: zod_1.z.string().optional(),
    }).optional(),
});
/**
 * Schema para pago en lote
 */
exports.bulkMarkAsPaidSchema = zod_1.z.object({
    body: zod_1.z.object({
        balance_ids: zod_1.z.
            array(zod_1.z.number().int().positive())
            .min(1, 'Debe proporcionar al menos un ID de balance'),
        payment_date: zod_1.z.string().datetime().optional(),
        payment_method: zod_1.z.string().optional(),
        payment_reference: zod_1.z.string().optional(),
    }),
});
/**
 * Schema para crear balance de reembolso
 */
exports.createRefundBalanceSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id del balance original debe ser numérico'),
    }),
});
/**
 * Schema para asignar fecha de corte
 */
exports.assignCutoffDateSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
    body: zod_1.z.object({
        days_after_event: zod_1.z.number().int().positive().optional().default(15),
    }).optional(),
});
