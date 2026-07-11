"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStagesByLocalityIdSchema = exports.getStageByIdSchema = exports.updateStageSchema = exports.createStageSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear una etapa (stage)
 */
exports.createStageSchema = zod_1.z.object({
    params: zod_1.z.object({
        localityId: zod_1.z.string().regex(/^\d+$/, 'El localityId debe ser numérico'),
    }),
    body: zod_1.z.object({
        stage_name: zod_1.z.string().min(2, 'El nombre de la etapa debe tener al menos 2 caracteres'),
        date_start: zod_1.z.string().datetime('Debe ser una fecha válida ISO 8601'),
        date_end: zod_1.z.string().datetime('Debe ser una fecha válida ISO 8601'),
        price_ticket: zod_1.z.number().int().positive('El precio del ticket debe ser un número positivo'),
    }).refine((data) => {
        const start = new Date(data.date_start);
        const end = new Date(data.date_end);
        return end > start;
    }, {
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['date_end'],
    }),
});
/**
 * Schema para actualizar una etapa
 */
exports.updateStageSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        stage_name: zod_1.z.string().min(2).optional(),
        date_start: zod_1.z.string().datetime().optional(),
        date_end: zod_1.z.string().datetime().optional(),
        price_ticket: zod_1.z.number().int().positive().optional(),
    }).refine((data) => {
        // Solo validar si ambas fechas están presentes
        if (data.date_start && data.date_end) {
            const start = new Date(data.date_start);
            const end = new Date(data.date_end);
            return end > start;
        }
        return true;
    }, {
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
        path: ['date_end'],
    }),
});
/**
 * Schema para obtener etapa por ID
 */
exports.getStageByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener etapas por localidad
 */
exports.getStagesByLocalityIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        localityId: zod_1.z.string().regex(/^\d+$/, 'El localityId debe ser numérico'),
    }),
});
