import { z } from 'zod';

/**
 * Schema para registrar usuario (usado en auth)
 */
export const registerUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER']),
    company_id: z.number().int().positive().optional(),
    phone_number: z.string().optional(),
    num_doc: z.string().optional(),
    type_doc: z.number().int().optional(),
  }),
});

/**
 * Schema para actualizar usuario
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    last_name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
    num_doc: z.string().optional(),
    type_doc: z.number().int().optional(),
    role: z.enum(['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER']).optional(),
    company_id: z.number().int().positive().optional().nullable(),
    lang_user: z.string().optional(),
    verified_user: z.number().int().min(0).max(1).optional(),
    status: z.number().int().min(0).max(1).optional(),
  }),
});

/**
 * Schema para obtener usuario por ID
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El id debe ser numérico'),
  }),
});

/**
 * Schema para obtener usuarios (query params)
 */
export const getUsersSchema = z.object({
  query: z.object({
    role: z.enum(['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER']).optional(),
    company_id: z.string().regex(/^\d+$/).optional(),
    status: z.string().regex(/^[01]$/).optional(),
  }).optional(),
});

/**
 * Schema para obtener usuarios por rol
 */
export const getUsersByRoleSchema = z.object({
  params: z.object({
    role: z.enum(['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER']),
  }),
});