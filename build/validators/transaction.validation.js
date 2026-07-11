"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsByStatusSchema = exports.getTransactionByInvoiceIdSchema = exports.getTransactionByReferenceSchema = exports.getTransactionByIdSchema = exports.processTransactionSchema = exports.signatureSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para generar signature
 */
exports.signatureSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z
            .number({ message: 'El monto es requerido y debe ser un número' })
            .int()
            .positive('El monto debe ser mayor a 0'),
        currency: zod_1.z.string().min(3, 'La moneda es requerida').max(3, 'Código de moneda inválido'),
        expiration_date: zod_1.z.string().min(1, 'La fecha de expiración es requerida'),
    }),
});
/**
 * Schema para procesar transacción completa
 *
 * Dos modos:
 *  - Con invoice_id  → la factura ya existe (creada en POST /api/invoices);
 *    event_id, amount_in_cents y shoppingCart son opcionales.
 *  - Sin invoice_id  → flujo legacy; esos campos son obligatorios.
 *
 * El método de pago se envía en payment_method ({ type, ...campos del método }).
 * Por compatibilidad se acepta también paymentMethodType + token_card_user (CARD).
 */
exports.processTransactionSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        user_id: zod_1.z
            .number({ message: 'El user_id es requerido y debe ser un número' })
            .int()
            .positive(),
        user_uid: zod_1.z.string().min(1, 'El user_uid es requerido'),
        user_num_doc: zod_1.z.string().min(1, 'El número de documento es requerido'),
        user_type_doc: zod_1.z.string().min(1, 'El tipo de documento es requerido'),
        event_id: zod_1.z.number().int().positive().optional(),
        qty_items: zod_1.z.number().int().positive().optional(),
        apply_discount: zod_1.z.number().min(0).default(0),
        amount_in_cents: zod_1.z.number().int().positive().optional(),
        status: zod_1.z.string().default('PENDING'),
        customer_ID_phone: zod_1.z.string().min(1, 'El teléfono del cliente es requerido'),
        codeDCTO: zod_1.z.string().default(''),
        // ── Método de pago polimórfico ──
        payment_method: zod_1.z
            .looseObject({
            type: zod_1.z.string().min(1, 'payment_method.type es requerido'),
        })
            .optional(),
        // ── Compatibilidad CARD legacy ──
        paymentMethodType: zod_1.z.string().optional(),
        token_card_user: zod_1.z.string().optional(),
        installments_user: zod_1.z.number().int().min(1).max(36).default(1),
        shoppingCart: zod_1.z.array(zod_1.z.any()).optional(),
        // ── Flujo con factura existente / canal ──
        invoice_id: zod_1.z.number().int().positive().optional(),
        sale_channel: zod_1.z.enum(['WEB', 'APP']).optional(),
        redirect_url: zod_1.z.string().url('redirect_url debe ser una URL válida').optional(),
    })
        .superRefine((body, ctx) => {
        var _a;
        if (!((_a = body.payment_method) === null || _a === void 0 ? void 0 : _a.type) && !body.paymentMethodType) {
            ctx.addIssue({
                code: 'custom',
                message: 'Debes enviar payment_method.type (o paymentMethodType legacy)',
                path: ['payment_method'],
            });
        }
        if (!body.invoice_id) {
            if (!body.event_id) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'event_id es requerido cuando no se envía invoice_id',
                    path: ['event_id'],
                });
            }
            if (!body.amount_in_cents) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'amount_in_cents es requerido cuando no se envía invoice_id',
                    path: ['amount_in_cents'],
                });
            }
            if (!body.shoppingCart || body.shoppingCart.length === 0) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'shoppingCart es requerido cuando no se envía invoice_id',
                    path: ['shoppingCart'],
                });
            }
        }
    }),
});
/**
 * Schema para obtener transacción por ID
 */
exports.getTransactionByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para buscar por reference
 */
exports.getTransactionByReferenceSchema = zod_1.z.object({
    params: zod_1.z.object({
        reference: zod_1.z.string().min(1, 'La referencia es requerida'),
    }),
});
/**
 * Schema para buscar por invoice_id
 */
exports.getTransactionByInvoiceIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        invoice_id: zod_1.z.string().min(1, 'El invoice_id es requerido'),
    }),
});
/**
 * Schema para filtrar por status
 */
exports.getTransactionsByStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        status: zod_1.z.enum(['APPROVED', 'PENDING', 'DECLINED', 'VOIDED', 'ERROR'], {
            error: 'Status inválido. Valores permitidos: APPROVED, PENDING, DECLINED, VOIDED, ERROR',
        }),
    }),
});
