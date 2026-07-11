"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubCategoriesStatsSchema = exports.getSubCategoriesQuerySchema = exports.getSubCategoriesByCategorySchema = exports.getSubCategoryByIdSchema = exports.updateSubCategorySchema = exports.createSubCategorySchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear una subcategoría
 */
exports.createSubCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        subcategory_name: zod_1.z
            .string()
            .min(2, 'El nombre de la subcategoría debe tener al menos 2 caracteres'),
        category_id: zod_1.z
            .number({ message: 'El category_id es requerido y debe ser un número' })
            .int('El category_id debe ser un número entero')
            .positive('El category_id debe ser un número positivo'),
    }),
});
/**
 * Schema para actualizar una subcategoría
 */
exports.updateSubCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z
        .object({
        subcategory_name: zod_1.z
            .string()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .optional(),
        category_id: zod_1.z
            .number({ message: 'El category_id debe ser un número' })
            .int()
            .positive('El category_id debe ser un número positivo')
            .optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    }),
});
/**
 * Schema para obtener subcategoría por ID
 */
exports.getSubCategoryByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener subcategorías por categoría
 */
exports.getSubCategoriesByCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        category_id: zod_1.z.string().regex(/^\d+$/, 'El category_id debe ser numérico'),
    }),
});
/**
 * Schema para filtrar subcategorías (query params)
 */
exports.getSubCategoriesQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().optional(),
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
exports.getSubCategoriesStatsSchema = zod_1.z.object({
    query: zod_1.z
        .object({
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
