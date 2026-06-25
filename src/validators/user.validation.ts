import { z } from 'zod';
import { ROLES, DocType, Gender } from '@prisma/client';

/**
 * Schema para registrar usuario (usado en auth)
 */
export const registerUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    // email y password son opcionales cuando se usa social_token
    email: z.string().email('Email inválido').optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
    phone_number: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos'),
    role: z.nativeEnum(ROLES),
    company_id: z.number().int().positive().optional(),
    num_doc: z.string().optional(),
    type_doc: z.nativeEnum(DocType).optional(),
    birth_date: z.string().datetime({ offset: true }).optional(),
    lang_user: z.string().optional(),
    country_id: z.number().int().positive().optional(),
    gender: z.nativeEnum(Gender).optional(),
    source: z.enum(['app', 'web']).optional(),
    // Registro social: token de Firebase (Google/Apple) ya autenticado
    social_token: z.string().optional(),
  }).refine(
    d => d.social_token || (d.email && d.password),
    { message: 'Se requiere email+password o social_token' }
  ),
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
    role: z.nativeEnum(ROLES).optional(), // ✅ SIN errorMap
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
    role: z.nativeEnum(ROLES).optional(), // ✅ SIN errorMap
    company_id: z.string().regex(/^\d+$/).optional(),
    status: z.string().regex(/^[01]$/).optional(),
  }).optional(),
});

/**
 * Schema para obtener usuarios por rol
 */
export const getUsersByRoleSchema = z.object({
  params: z.object({
    role: z.nativeEnum(ROLES), // ✅ SIN errorMap
  }),
});


 /**
   * Buscar si existe un usuario para asignarlo como STAFF
   */
export const searchUsersSchema = z.object({
  query: z.object({
    q: z.string().min(3, 'El término de búsqueda debe tener al menos 3 caracteres'),
    role: z
      .string()
      .regex(
        /^(PAYPAC|ORGANIZER|STAFF|STAFF_PROMOTER|PROMOTER|CUSTOMER)(,(PAYPAC|ORGANIZER|STAFF|STAFF_PROMOTER|PROMOTER|CUSTOMER))*$/,
        'Roles inválidos'
      )
      .optional(),
  }),
});