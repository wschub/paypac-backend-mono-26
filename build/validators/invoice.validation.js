"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceStatusSchema = exports.getEventInvoicesSchema = exports.getInvoiceByIdSchema = exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear factura
 */
exports.createInvoiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        event_id: zod_1.z.number().int().positive('El ID del evento es requerido'),
        items: zod_1.z
            .array(zod_1.z.object({
            stage_id: zod_1.z.number().int().positive('El ID del stage es requerido'),
            locality_id: zod_1.z.number().int().positive('El ID de la localidad es requerido'),
            qty_tickets: zod_1.z.number().int().positive('La cantidad debe ser mayor a 0'),
        }))
            .refine((arr) => arr.length > 0, {
            message: 'Debe agregar al menos un item',
        }),
        discount_code: zod_1.z.string().optional(),
        promoter_code: zod_1.z.string().optional(),
        user_num_doc: zod_1.z.string().optional(),
        user_type_doc: zod_1.z.enum(['CC', 'CE', 'PA', 'TI', 'NIT', 'SSN']).optional(),
        device_uuid: zod_1.z.string().min(1).optional(),
        sale_channel: zod_1.z.enum(['WEB', 'APP']).optional(),
        payment_method: zod_1.z.union([
            // Códigos Wompi + POINTS (interno) + alias legacy (CREDIT_CARD, BNPL)
            zod_1.z.enum([
                'CARD', 'NEQUI', 'PSE', 'BANCOLOMBIA_TRANSFER', 'BANCOLOMBIA_QR',
                'BANCOLOMBIA_COLLECT', 'DAVIPLATA', 'BANCOLOMBIA_BNPL', 'PCOL',
                'POINTS', 'CREDIT_CARD', 'BNPL',
            ]),
            zod_1.z.object({
                type: zod_1.z.string(),
                card_token: zod_1.z.string().optional(),
                installments: zod_1.z.number().int().optional(),
                brand: zod_1.z.string().optional(),
                last_four: zod_1.z.string().optional(),
            }),
        ]).optional(),
        points_to_use: zod_1.z.number().int().min(1).optional(),
    }),
});
/**
 * Schema para obtener factura por ID
 */
exports.getInvoiceByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener facturas por evento
 */
exports.getEventInvoicesSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
/**
 * Schema para actualizar estado de factura
 */
exports.updateInvoiceStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum([
            'ISSUED',
            'PRECESSING',
            'PAID',
            'PENDING',
            'REJECTED',
            'CANCELED',
            'REFUNDED',
        ]),
    }),
});
