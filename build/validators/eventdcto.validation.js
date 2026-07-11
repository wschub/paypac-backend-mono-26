"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicableDiscountsSchema = exports.calculateDiscountSchema = exports.validateDiscountSchema = exports.getDiscountsByEventIdSchema = exports.getDiscountByIdSchema = exports.updateDiscountSchema = exports.createDiscountSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear un descuento
 */
exports.createDiscountSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
    body: zod_1.z.object({
        name_dcto: zod_1.z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        description: zod_1.z.string().optional(),
        type_dcto: zod_1.z.number().int().min(1).max(2),
        value_dcto: zod_1.z.number().int().positive('El valor debe ser mayor a 0'),
        min_qty_tickets: zod_1.z.number().int().positive().optional().nullable(),
        max_qty_tickets: zod_1.z.number().int().positive().optional().nullable(),
        locality_id: zod_1.z.number().int().positive().optional().nullable(),
        code: zod_1.z.string().min(3).max(20)
            .regex(/^[A-Z0-9\-_]+$/i)
            .optional(),
        is_active: zod_1.z.boolean().optional(),
        max_uses: zod_1.z.number().int().positive().optional().nullable(),
    })
        .refine((data) => !(data.type_dcto === 1 && data.value_dcto > 100), { message: 'El porcentaje no puede ser mayor a 100%', path: ['value_dcto'] })
        .refine((data) => {
        if (data.min_qty_tickets && data.max_qty_tickets) {
            return data.min_qty_tickets <= data.max_qty_tickets;
        }
        return true;
    }, { message: 'La cantidad mínima no puede ser mayor a la máxima', path: ['max_qty_tickets'] }),
});
/**
 * Schema para actualizar un descuento
 */
exports.updateDiscountSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        name_dcto: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().optional(),
        type_dcto: zod_1.z.number().int().min(1).max(2).optional(),
        value_dcto: zod_1.z.number().int().positive().optional(),
        min_qty_tickets: zod_1.z.number().int().positive().optional().nullable(),
        max_qty_tickets: zod_1.z.number().int().positive().optional().nullable(),
        locality_id: zod_1.z.number().int().positive().optional().nullable(),
    }).refine((data) => {
        if (data.type_dcto === 1 && data.value_dcto && data.value_dcto > 100) {
            return false;
        }
        return true;
    }, {
        message: 'El descuento por porcentaje no puede ser mayor a 100%',
        path: ['value_dcto'],
    }),
});
/**
 * Schema para obtener descuento por ID
 */
exports.getDiscountByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener descuentos por evento
 */
exports.getDiscountsByEventIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
/**
 * Schema para validar un código de descuento
 */
exports.validateDiscountSchema = zod_1.z.object({
    body: zod_1.z.object({
        event_id: zod_1.z.number().int().positive('El ID del evento es requerido'),
        discount_name: zod_1.z.string().min(1, 'El nombre del descuento es requerido'),
        quantity: zod_1.z.number().int().positive('La cantidad debe ser mayor a 0'),
        locality_id: zod_1.z.number().int().positive().optional(),
    }),
});
/**
 * Schema para calcular descuento
 */
exports.calculateDiscountSchema = zod_1.z.object({
    body: zod_1.z.object({
        total_amount: zod_1.z.number().int().positive('El monto total debe ser mayor a 0'),
        discount_type: zod_1.z.number().int().min(1).max(2),
        discount_value: zod_1.z.number().int().positive('El valor del descuento debe ser mayor a 0'),
    }),
});
/**
 * Schema para obtener descuentos aplicables
 */
exports.getApplicableDiscountsSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
    query: zod_1.z.object({
        quantity: zod_1.z.string().regex(/^\d+$/, 'La cantidad debe ser numérica'),
        locality_id: zod_1.z.string().regex(/^\d+$/).optional(),
    }),
});
