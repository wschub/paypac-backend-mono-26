"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoriesStatsSchema = exports.getCategoriesQuerySchema = exports.getCategoriesByCountrySchema = exports.getCategoryByIdSchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear una categoría
 */
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        category_name: zod_1.z
            .string()
            .min(2, 'El nombre de la categoría debe tener al menos 2 caracteres'),
        category_icon: zod_1.z.string().optional(),
        country_id: zod_1.z
            .number({ message: 'El country_id es requerido y debe ser un número' })
            .int('El country_id debe ser un número entero')
            .positive('El country_id debe ser un número positivo'),
    }),
});
/**
 * Schema para actualizar una categoría
 */
exports.updateCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z
        .object({
        category_name: zod_1.z
            .string()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .optional(),
        category_icon: zod_1.z.string().optional(),
        country_id: zod_1.z
            .number({ message: 'El country_id debe ser un número' })
            .int()
            .positive('El country_id debe ser un número positivo')
            .optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    }),
});
/**
 * Schema para obtener categoría por ID
 */
exports.getCategoryByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener categorías por país
 */
exports.getCategoriesByCountrySchema = zod_1.z.object({
    params: zod_1.z.object({
        country_id: zod_1.z.string().regex(/^\d+$/, 'El country_id debe ser numérico'),
    }),
});
/**
 * Schema para filtrar categorías (query params)
 */
exports.getCategoriesQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().optional(),
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
exports.getCategoriesStatsSchema = zod_1.z.object({
    query: zod_1.z
        .object({
        country_id: zod_1.z
            .string()
            .regex(/^\d+$/, 'El country_id debe ser numérico')
            .optional(),
    })
        .optional(),
});
