import { z } from 'zod';

export const createSectionSchema = z.object({
  body: z.object({
    name_section: z.string().min(1, { message: 'El nombre es requerido' }),
    icon:         z.string().optional(),
    link:         z.string().optional(),
    section_order: z.number().int().min(0).optional(),
    level:        z.number().int().min(0).optional(),
    parent_id:    z.number().int().positive().optional().nullable(),
    is_active:    z.boolean().optional(),
  }),
});

export const updateSectionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { message: 'El id debe ser numérico' }),
  }),
  body: z.object({
    name_section: z.string().min(1).optional(),
    icon:         z.string().optional(),
    link:         z.string().optional(),
    section_order: z.number().int().min(0).optional(),
    level:        z.number().int().min(0).optional(),
    parent_id:    z.number().int().positive().optional().nullable(),
    is_active:    z.boolean().optional(),
  }),
});

export const sectionIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, { message: 'El id debe ser numérico' }),
  }),
});

export const reorderSectionsSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        id:    z.number().int().positive(),
        section_order: z.number().int().min(0).optional(),
      })
    ).min(1, { message: 'Debes enviar al menos un item' }),
  }),
});