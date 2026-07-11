"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderSectionsSchema = exports.sectionIdParamSchema = exports.updateSectionSchema = exports.createSectionSchema = void 0;
const zod_1 = require("zod");
exports.createSectionSchema = zod_1.z.object({
    body: zod_1.z.object({
        name_section: zod_1.z.string().min(1, { message: 'El nombre es requerido' }),
        icon: zod_1.z.string().optional(),
        link: zod_1.z.string().optional(),
        section_order: zod_1.z.number().int().min(0).optional(),
        level: zod_1.z.number().int().min(0).optional(),
        parent_id: zod_1.z.number().int().positive().optional().nullable(),
        is_active: zod_1.z.boolean().optional(),
    }),
});
exports.updateSectionSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, { message: 'El id debe ser numérico' }),
    }),
    body: zod_1.z.object({
        name_section: zod_1.z.string().min(1).optional(),
        icon: zod_1.z.string().optional(),
        link: zod_1.z.string().optional(),
        section_order: zod_1.z.number().int().min(0).optional(),
        level: zod_1.z.number().int().min(0).optional(),
        parent_id: zod_1.z.number().int().positive().optional().nullable(),
        is_active: zod_1.z.boolean().optional(),
    }),
});
exports.sectionIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, { message: 'El id debe ser numérico' }),
    }),
});
exports.reorderSectionsSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.number().int().positive(),
            section_order: zod_1.z.number().int().min(0).optional(),
        })).min(1, { message: 'Debes enviar al menos un item' }),
    }),
});
