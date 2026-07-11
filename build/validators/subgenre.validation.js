"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubgenresStatsSchema = exports.getSubgenresQuerySchema = exports.getSubgenresBySubCategorySchema = exports.getSubgenreByIdSchema = exports.updateSubgenreSchema = exports.createSubgenreSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear un subgénero
 */
exports.createSubgenreSchema = zod_1.z.object({
    body: zod_1.z.object({
        subcategory_name: zod_1.z
            .string()
            .min(2, 'El nombre del subgénero debe tener al menos 2 caracteres'),
        subcategory_id: zod_1.z
            .number({ message: 'El subcategory_id es requerido y debe ser un número' })
            .int('El subcategory_id debe ser un número entero')
            .positive('El subcategory_id debe ser un número positivo'),
    }),
});
/**
 * Schema para actualizar un subgénero
 */
exports.updateSubgenreSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z
        .object({
        subcategory_name: zod_1.z
            .string()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .optional(),
        subcategory_id: zod_1.z
            .number({ message: 'El subcategory_id debe ser un número' })
            .int()
            .positive('El subcategory_id debe ser un número positivo')
            .optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    }),
});
/**
 * Schema para obtener subgénero por ID
 */
exports.getSubgenreByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener subgéneros por subcategoría
 */
exports.getSubgenresBySubCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        subcategory_id: zod_1.z.string().regex(/^\d+$/, 'El subcategory_id debe ser numérico'),
    }),
});
/**
 * Schema para filtrar subgéneros (query params)
 * Soporta filtro en cascada: subcategory_id → category_id → country_id
 */
exports.getSubgenresQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().optional(),
        subcategory_id: zod_1.z
            .string()
            .regex(/^\d+$/, 'El subcategory_id debe ser numérico')
            .optional(),
        category_id: zod_1.z
            .string()
            .regex(/^\d+$/, 'El category_id debe ser numérico')
            .optional(),
        country_id: zod_1.z
            .string()
            .regex(/^\d+$/, 'El country_id debe ser numérico')
            .optional(),
    })
        .optional(),
});
/**
 * Schema para stats (query params opcionales)
 */
exports.getSubgenresStatsSchema = zod_1.z.object({
    query: zod_1.z
        .object({
        subcategory_id: zod_1.z
            .string()
            .regex(/^\d+$/, 'El subcategory_id debe ser numérico')
            .optional(),
        category_id: zod_1.z
            .string()
            .regex(/^\d+$/, 'El category_id debe ser numérico')
            .optional(),
        country_id: zod_1.z
            .string()
            .regex(/^\d+$/, 'El country_id debe ser numérico')
            .optional(),
    })
        .optional(),
});
