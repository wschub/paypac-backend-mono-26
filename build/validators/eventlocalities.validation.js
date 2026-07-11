"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalitiesByEventIdSchema = exports.getLocalityByIdSchema = exports.updateLocalitySchema = exports.createLocalitySchema = void 0;
const zod_1 = require("zod");
/**
 * Validación de color hexadecimal
 */
const hexColorSchema = zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Debe ser un color hexadecimal válido (ej: #FF5733)');
/**
 * Schema para crear una localidad
 */
exports.createLocalitySchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
    body: zod_1.z.object({
        name_locality: zod_1.z.string().min(2, 'El nombre de la localidad debe tener al menos 2 caracteres'),
        bkg_color: hexColorSchema,
    }),
});
/**
 * Schema para actualizar una localidad
 */
exports.updateLocalitySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        name_locality: zod_1.z.string().min(2).optional(),
        bkg_color: hexColorSchema.optional(),
    }),
});
/**
 * Schema para obtener localidad por ID
 */
exports.getLocalityByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener localidades por evento
 */
exports.getLocalitiesByEventIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
