import { z } from 'zod';

const VALID_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'] as const;

const permissionFields = {
  can_view:   z.boolean().optional(),
  can_create: z.boolean().optional(),
  can_edit:   z.boolean().optional(),
  can_delete: z.boolean().optional(),
  can_export: z.boolean().optional(),
};

export const upsertPermissionSchema = z.object({
  body: z.object({
    role:       z.enum(VALID_ROLES, { error: 'Rol inválido' }),
    section_id: z.number().int().positive({ message: 'section_id requerido' }),
    ...permissionFields,
  }),
});

export const roleParamSchema = z.object({
  params: z.object({
    role: z.enum(VALID_ROLES, { error: 'Rol inválido' }),
  }),
});

export const roleAndSectionParamSchema = z.object({
  params: z.object({
    role:      z.enum(VALID_ROLES, { error: 'Rol inválido' }),
    sectionId: z.string().regex(/^\d+$/, { message: 'sectionId debe ser numérico' }),
  }),
});

export const bulkUpsertSchema = z.object({
  params: z.object({
    sectionId: z.string().regex(/^\d+$/, { message: 'sectionId debe ser numérico' }),
  }),
  body: z.object({
    permissions: z.array(
      z.object({
        role: z.enum(VALID_ROLES, { error: 'Rol inválido' }),
        ...permissionFields,
      })
    ).min(1, { message: 'Debes enviar al menos un permiso' }),
  }),
});