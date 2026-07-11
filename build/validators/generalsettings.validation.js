"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsQuerySchema = exports.getSettingByNameSchema = exports.getSettingByIdSchema = exports.updateSettingSchema = exports.createSettingSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear una variable de configuración
 */
exports.createSettingSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .regex(/^[A-Z0-9_]+$/, 'El nombre solo puede contener letras mayúsculas, números y guiones bajos (ej: MAX_TICKETS_PER_USER)'),
        value: zod_1.z.string().min(1, 'El valor es requerido'),
        description: zod_1.z.string().optional(),
    }),
});
/**
 * Schema para actualizar una variable
 */
exports.updateSettingSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .min(2)
            .regex(/^[A-Z0-9_]+$/, 'El nombre solo puede contener letras mayúsculas, números y guiones bajos')
            .optional(),
        value: zod_1.z.string().min(1, 'El valor no puede estar vacío').optional(),
        description: zod_1.z.string().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    }),
});
/**
 * Schema para obtener variable por ID
 */
exports.getSettingByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener variable por nombre
 */
exports.getSettingByNameSchema = zod_1.z.object({
    params: zod_1.z.object({
        name: zod_1.z.string().min(1, 'El nombre es requerido'),
    }),
});
/**
 * Schema para filtrar variables (query params)
 */
exports.getSettingsQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().optional(),
    })
        .optional(),
});
