"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCardsSchema = exports.deletePaymentMethodCardSchema = exports.getPaymentMethodCardByIdSchema = exports.createPaymentMethodCardSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para guardar una tarjeta tokenizada
 * Este endpoint se llama DESPUÉS de tokenizar en Wompi
 */
exports.createPaymentMethodCardSchema = zod_1.z.object({
    body: zod_1.z.object({
        id_token: zod_1.z.string().min(10, 'El token de la tarjeta es requerido'),
        created_at: zod_1.z.string(), // ISO 8601 timestamp de Wompi
        brand: zod_1.z.string().min(2, 'La marca de la tarjeta es requerida'), // VISA, MASTERCARD, AMEX
        name: zod_1.z.string().min(3, 'El nombre descriptivo es requerido'), // Ej: "VISA-4242"
        last_four: zod_1.z.string().length(4, 'Deben ser los últimos 4 dígitos'),
        bin: zod_1.z.string().length(6, 'El BIN debe tener 6 dígitos'),
        exp_year: zod_1.z.string().length(2, 'El año debe tener 2 dígitos'), // "28"
        exp_month: zod_1.z.string().regex(/^(0[1-9]|1[0-2])$/, 'Mes inválido (01-12)'), // "08"
        card_holder: zod_1.z.string().min(3, 'El nombre del titular es requerido'),
        created_with_cvc: zod_1.z.boolean().default(true),
        expires_at: zod_1.z.string(), // ISO 8601 timestamp
        validity_ends_at: zod_1.z.string(), // ISO 8601 timestamp
    }),
});
/**
 * Schema para obtener tarjeta por ID
 */
exports.getPaymentMethodCardByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para eliminar tarjeta
 */
exports.deletePaymentMethodCardSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para listar tarjetas del usuario
 * No requiere validación adicional, usa el user_id del token
 */
exports.getMyCardsSchema = zod_1.z.object({
    query: zod_1.z.object({
        active_only: zod_1.z.enum(['true', 'false']).optional(), // Filtrar solo tarjetas no expiradas
    }).optional(),
});
