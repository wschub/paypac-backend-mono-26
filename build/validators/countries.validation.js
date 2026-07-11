"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountriesQuerySchema = exports.getCountryByIdSchema = exports.updateCountrySchema = exports.createCountrySchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear un país
 */
exports.createCountrySchema = zod_1.z.object({
    body: zod_1.z.object({
        name_country: zod_1.z.string().min(2, 'El nombre del país debe tener al menos 2 caracteres'),
        code: zod_1.z.string().length(2, 'El código ISO debe tener exactamente 2 caracteres').toUpperCase(),
        phone_code: zod_1.z.string().min(1, 'El código telefónico es requerido').regex(/^\+?\d+$/, 'Debe ser un código telefónico válido (ej: +57)'),
        currency: zod_1.z.string().length(3, 'El código de moneda debe tener exactamente 3 caracteres').toUpperCase(),
        language_default: zod_1.z.string().length(2, 'El código de idioma debe tener exactamente 2 caracteres').toLowerCase(),
    }),
});
/**
 * Schema para actualizar un país
 */
exports.updateCountrySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        name_country: zod_1.z.string().min(2).optional(),
        code: zod_1.z.string().length(2).toUpperCase().optional(),
        phone_code: zod_1.z.string().min(1).regex(/^\+?\d+$/).optional(),
        currency: zod_1.z.string().length(3).toUpperCase().optional(),
        language_default: zod_1.z.string().length(2).toLowerCase().optional(),
    }),
});
/**
 * Schema para obtener país por ID
 */
exports.getCountryByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para filtrar países
 */
exports.getCountriesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(), // Buscar por nombre o código
        code: zod_1.z.string().length(2).toUpperCase().optional(), // Filtrar por código ISO
    }).optional(),
});
