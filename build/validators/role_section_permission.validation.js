"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpsertSchema = exports.roleAndSectionParamSchema = exports.roleParamSchema = exports.upsertPermissionSchema = void 0;
const zod_1 = require("zod");
const VALID_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
const permissionFields = {
    can_view: zod_1.z.boolean().optional(),
    can_create: zod_1.z.boolean().optional(),
    can_edit: zod_1.z.boolean().optional(),
    can_delete: zod_1.z.boolean().optional(),
    can_export: zod_1.z.boolean().optional(),
};
exports.upsertPermissionSchema = zod_1.z.object({
    body: zod_1.z.object(Object.assign({ role: zod_1.z.enum(VALID_ROLES, { error: 'Rol inválido' }), section_id: zod_1.z.number().int().positive({ message: 'section_id requerido' }) }, permissionFields)),
});
exports.roleParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        role: zod_1.z.enum(VALID_ROLES, { error: 'Rol inválido' }),
    }),
});
exports.roleAndSectionParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        role: zod_1.z.enum(VALID_ROLES, { error: 'Rol inválido' }),
        sectionId: zod_1.z.string().regex(/^\d+$/, { message: 'sectionId debe ser numérico' }),
    }),
});
exports.bulkUpsertSchema = zod_1.z.object({
    params: zod_1.z.object({
        sectionId: zod_1.z.string().regex(/^\d+$/, { message: 'sectionId debe ser numérico' }),
    }),
    body: zod_1.z.object({
        permissions: zod_1.z.array(zod_1.z.object(Object.assign({ role: zod_1.z.enum(VALID_ROLES, { error: 'Rol inválido' }) }, permissionFields))).min(1, { message: 'Debes enviar al menos un permiso' }),
    }),
});
