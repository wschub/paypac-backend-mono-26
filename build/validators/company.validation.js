"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompaniesStatsSchema = exports.getCompaniesQuerySchema = exports.updateCompanyStatusSchema = exports.getCompanyByIdSchema = exports.updateCompanySchema = exports.createCompanySchema = void 0;
const zod_1 = require("zod");
const locationFields = {
    country_id: zod_1.z
        .number({ message: 'El country_id debe ser un número' })
        .int().positive().optional(),
    state_id: zod_1.z
        .number({ message: 'El state_id debe ser un número' })
        .int().positive().optional(),
    city_id: zod_1.z
        .number({ message: 'El city_id debe ser un número' })
        .int().positive().optional(),
};
/**
 * Schema para crear una empresa
 */
exports.createCompanySchema = zod_1.z.object({
    body: zod_1.z.object(Object.assign({ company_name: zod_1.z
            .string()
            .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'), company_description: zod_1.z.string().optional(), company_logo: zod_1.z.string().url('Debe ser una URL válida').optional().or(zod_1.z.literal('')), company_cover: zod_1.z.string().url('Debe ser una URL válida').optional().or(zod_1.z.literal('')), company_phone_number: zod_1.z.string().optional(), company_email: zod_1.z.string().email('Debe ser un email válido').optional(), type_identification: zod_1.z.string().optional(), num_identification: zod_1.z.string().optional(), website: zod_1.z.string().url('Debe ser una URL válida').optional().or(zod_1.z.literal('')), address: zod_1.z.string().optional(), company_presentation: zod_1.z.string().optional() }, locationFields)),
});
/**
 * Schema para actualizar una empresa
 */
exports.updateCompanySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z
        .object(Object.assign({ company_name: zod_1.z.string().min(2).optional(), company_description: zod_1.z.string().optional(), company_logo: zod_1.z.string().url().optional().or(zod_1.z.literal('')), company_cover: zod_1.z.string().url().optional().or(zod_1.z.literal('')), company_phone_number: zod_1.z.string().optional(), company_email: zod_1.z.string().email().optional(), type_identification: zod_1.z.string().optional(), num_identification: zod_1.z.string().optional(), website: zod_1.z.string().url().optional().or(zod_1.z.literal('')), address: zod_1.z.string().optional(), company_presentation: zod_1.z.string().optional() }, locationFields))
        .refine((data) => Object.keys(data).length > 0, {
        message: 'Debes enviar al menos un campo para actualizar',
    }),
});
/**
 * Schema para obtener empresa por ID
 */
exports.getCompanyByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para actualizar status
 */
exports.updateCompanyStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        status: zod_1.z
            .number({ message: 'El status debe ser un número' })
            .int()
            .min(0)
            .max(2, 'Status inválido (0: pendiente, 1: aprobado, 2: suspendido)'),
    }),
});
/**
 * Schema para filtrar empresas (query params)
 */
exports.getCompaniesQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().optional(),
        country_id: zod_1.z.string().regex(/^\d+$/).optional(),
        state_id: zod_1.z.string().regex(/^\d+$/).optional(),
        city_id: zod_1.z.string().regex(/^\d+$/).optional(),
        status: zod_1.z.string().regex(/^\d+$/).optional(),
    })
        .optional(),
});
/**
 * Schema para stats
 */
exports.getCompaniesStatsSchema = zod_1.z.object({
    query: zod_1.z
        .object({
        country_id: zod_1.z.string().regex(/^\d+$/).optional(),
        status: zod_1.z.string().regex(/^\d+$/).optional(),
    })
        .optional(),
});
