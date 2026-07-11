"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCitiesStatsSchema = exports.getCitiesQuerySchema = exports.getCitiesByStateSchema = exports.getCitiesByCountrySchema = exports.getCityByIdSchema = exports.updateCitySchema = exports.createCitySchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear una ciudad
 */
exports.createCitySchema = zod_1.z.object({
    body: zod_1.z.object({
        name_city: zod_1.z.string().min(2, 'El nombre de la ciudad debe tener al menos 2 caracteres'),
        state_id: zod_1.z
            .number({ message: 'El state_id es requerido y debe ser un número' })
            .int('El state_id debe ser un número entero')
            .positive('El state_id debe ser un número positivo'),
        country_id: zod_1.z
            .number({ message: 'El country_id es requerido y debe ser un número' })
            .int('El country_id debe ser un número entero')
            .positive('El country_id debe ser un número positivo'),
        latitude: zod_1.z.string().optional().default(''),
        longitude: zod_1.z.string().optional().default(''),
    }),
});
/**
 * Schema para actualizar una ciudad
 */
exports.updateCitySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z
        .object({
        name_city: zod_1.z
            .string()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .optional(),
        state_id: zod_1.z
            .number({ message: 'El state_id debe ser un número' })
            .int()
            .positive('El state_id debe ser un número positivo')
            .optional(),
        country_id: zod_1.z
            .number({ message: 'El country_id debe ser un número' })
            .int()
            .positive('El country_id debe ser un número positivo')
            .optional(),
        latitude: zod_1.z.string().optional(),
        longitude: zod_1.z.string().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    }),
});
/**
 * Schema para obtener ciudad por ID
 */
exports.getCityByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener ciudades por país
 */
exports.getCitiesByCountrySchema = zod_1.z.object({
    params: zod_1.z.object({
        country_id: zod_1.z.string().regex(/^\d+$/, 'El country_id debe ser numérico'),
    }),
});
/**
 * Schema para obtener ciudades por estado
 */
exports.getCitiesByStateSchema = zod_1.z.object({
    params: zod_1.z.object({
        state_id: zod_1.z.string().regex(/^\d+$/, 'El state_id debe ser numérico'),
    }),
});
/**
 * Schema para filtrar ciudades (query params)
 */
exports.getCitiesQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().optional(),
        country_id: zod_1.z.string().regex(/^\d+$/, 'El country_id debe ser numérico').optional(),
        state_id: zod_1.z.string().regex(/^\d+$/, 'El state_id debe ser numérico').optional(),
    })
        .optional(),
});
/**
 * Schema para stats (query params opcionales)
 */
exports.getCitiesStatsSchema = zod_1.z.object({
    query: zod_1.z
        .object({
        country_id: zod_1.z.string().regex(/^\d+$/, 'El country_id debe ser numérico').optional(),
        state_id: zod_1.z.string().regex(/^\d+$/, 'El state_id debe ser numérico').optional(),
    })
        .optional(),
});
