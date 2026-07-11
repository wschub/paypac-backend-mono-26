"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentMethodUIStatusSchema = exports.getPaymentMethodUIByIdSchema = exports.updatePaymentMethodUISchema = exports.createPaymentMethodUISchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear un método de pago
 */
exports.createPaymentMethodUISchema = zod_1.z.object({
    body: zod_1.z.object({
        method_name: zod_1.z.string().min(3, 'El nombre del método debe tener al menos 3 caracteres'),
        mehtod_img: zod_1.z.string().url('Debe ser una URL válida del logo').or(zod_1.z.literal('')),
        method_status: zod_1.z.number().int().min(0).max(1).default(0), // 0: inactivo, 1: activo
    }),
});
/**
 * Schema para actualizar un método de pago
 */
exports.updatePaymentMethodUISchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        method_name: zod_1.z.string().min(3).optional(),
        mehtod_img: zod_1.z.string().url().or(zod_1.z.literal('')).optional(),
        method_status: zod_1.z.number().int().min(0).max(1).optional(),
    }),
});
/**
 * Schema para obtener método de pago por ID
 */
exports.getPaymentMethodUIByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para actualizar solo el status
 */
exports.updatePaymentMethodUIStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        method_status: zod_1.z.number().int().min(0).max(1),
    }),
});
