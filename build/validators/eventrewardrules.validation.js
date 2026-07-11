"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCodeSchema = exports.calculateRewardSchema = exports.getRewardRulesByEventIdSchema = exports.getRewardRuleByIdSchema = exports.updateRewardRuleSchema = exports.createRewardRuleSchema = void 0;
const zod_1 = require("zod");
const rewardTypeEnum = zod_1.z.enum([
    'NONE',
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'GUEST_LIST',
    'TICKET_REWARD',
    'CASH_REWARD',
    'CONSUMPTION_REWARD',
]);
const commissionBaseEnum = zod_1.z.enum(['ON_ORIGINAL', 'ON_DISCOUNTED']);
// ── Campos de descuento al cliente (compartidos entre create y update) ──
const customerDiscountFields = {
    apply_customer_discount: zod_1.z.boolean().optional().default(false),
    customer_discount_type: zod_1.z.number().int().min(1).max(2).optional().nullable(),
    customer_discount_value: zod_1.z.number().int().positive().optional().nullable(),
    commission_base: commissionBaseEnum.optional().default('ON_DISCOUNTED'),
};
/**
 * Schema para crear una regla de recompensa
 */
exports.createRewardRuleSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
    body: zod_1.z.object(Object.assign({ reward_type: rewardTypeEnum, reward_percentage: zod_1.z.number().int().min(1).max(100).optional().nullable(), reward_amount: zod_1.z.number().int().positive().optional().nullable(), min_qty_tickets: zod_1.z.number().int().positive().optional().nullable(), min_amount_tickets: zod_1.z.number().int().positive().optional().nullable(), locality_id: zod_1.z.number().int().positive().optional().nullable() }, customerDiscountFields))
        .refine((data) => !(data.reward_type === 'PERCENTAGE' && !data.reward_percentage), {
        message: 'El tipo PERCENTAGE requiere reward_percentage',
        path: ['reward_percentage'],
    })
        .refine((data) => !(['FIXED_AMOUNT', 'CASH_REWARD', 'TICKET_REWARD'].includes(data.reward_type) && !data.reward_amount), {
        message: 'Este tipo de recompensa requiere reward_amount',
        path: ['reward_amount'],
    })
        .refine((data) => {
        // Si aplica dcto al cliente, debe tener type y value
        if (data.apply_customer_discount) {
            return !!data.customer_discount_type && !!data.customer_discount_value;
        }
        return true;
    }, {
        message: 'Si apply_customer_discount es true, se requieren customer_discount_type y customer_discount_value',
        path: ['customer_discount_value'],
    }),
});
/**
 * Schema para actualizar una regla de recompensa
 */
exports.updateRewardRuleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object(Object.assign({ reward_type: rewardTypeEnum.optional(), reward_percentage: zod_1.z.number().int().min(1).max(100).optional().nullable(), reward_amount: zod_1.z.number().int().positive().optional().nullable(), min_qty_tickets: zod_1.z.number().int().positive().optional().nullable(), min_amount_tickets: zod_1.z.number().int().positive().optional().nullable(), locality_id: zod_1.z.number().int().positive().optional().nullable() }, customerDiscountFields))
        .refine((data) => Object.keys(data).length > 0, { message: 'Debes enviar al menos un campo para actualizar' })
        .refine((data) => {
        if (data.apply_customer_discount) {
            return !!data.customer_discount_type && !!data.customer_discount_value;
        }
        return true;
    }, {
        message: 'Si apply_customer_discount es true, se requieren customer_discount_type y customer_discount_value',
        path: ['customer_discount_value'],
    }),
});
/**
 * Schema para obtener regla por ID
 */
exports.getRewardRuleByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener reglas por evento
 */
exports.getRewardRulesByEventIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
/**
 * Schema para calcular recompensa
 */
exports.calculateRewardSchema = zod_1.z.object({
    body: zod_1.z.object({
        event_id: zod_1.z.number().int().positive('El ID del evento es requerido'),
        quantity: zod_1.z.number().int().positive('La cantidad debe ser mayor a 0'),
        total_amount: zod_1.z.number().int().positive('El monto total debe ser mayor a 0'),
        locality_id: zod_1.z.number().int().positive().optional(),
    }),
});
/**
 * Schema para validar código en checkout
 * GET /api/discounts/validate/:code?event_id=123
 */
exports.validateCodeSchema = zod_1.z.object({
    params: zod_1.z.object({
        code: zod_1.z.string().min(1, 'El código es requerido'),
    }),
    query: zod_1.z.object({
        event_id: zod_1.z.string().regex(/^\d+$/, 'event_id debe ser numérico'),
    }),
});
