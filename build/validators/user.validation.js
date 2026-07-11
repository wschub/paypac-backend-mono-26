"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsersSchema = exports.getUsersByRoleSchema = exports.getUsersSchema = exports.getUserByIdSchema = exports.updateUserSchema = exports.registerUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
/**
 * Schema para registrar usuario (usado en auth)
 */
exports.registerUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
        last_name: zod_1.z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
        // email y password son opcionales cuando se usa social_token
        email: zod_1.z.string().email('Email inválido').optional(),
        password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
        phone_number: zod_1.z.string().min(7, 'El teléfono debe tener al menos 7 dígitos'),
        role: zod_1.z.nativeEnum(client_1.ROLES),
        company_id: zod_1.z.number().int().positive().optional(),
        num_doc: zod_1.z.string().optional(),
        type_doc: zod_1.z.nativeEnum(client_1.DocType).optional(),
        birth_date: zod_1.z.string().datetime({ offset: true }).optional(),
        lang_user: zod_1.z.string().optional(),
        country_id: zod_1.z.number().int().positive().optional(),
        gender: zod_1.z.nativeEnum(client_1.Gender).optional(),
        source: zod_1.z.enum(['app', 'web']).optional(),
        // Registro social: token de Firebase (Google/Apple) ya autenticado
        social_token: zod_1.z.string().optional(),
    }).refine(d => d.social_token || (d.email && d.password), { message: 'Se requiere email+password o social_token' }),
});
/**
 * Schema para actualizar usuario
 */
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        last_name: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional(),
        phone_number: zod_1.z.string().optional(),
        num_doc: zod_1.z.string().optional(),
        type_doc: zod_1.z.number().int().optional(),
        role: zod_1.z.nativeEnum(client_1.ROLES).optional(), // ✅ SIN errorMap
        company_id: zod_1.z.number().int().positive().optional().nullable(),
        lang_user: zod_1.z.string().optional(),
        verified_user: zod_1.z.number().int().min(0).max(1).optional(),
        status: zod_1.z.number().int().min(0).max(1).optional(),
    }),
});
/**
 * Schema para obtener usuario por ID
 */
exports.getUserByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener usuarios (query params)
 */
exports.getUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        role: zod_1.z.nativeEnum(client_1.ROLES).optional(), // ✅ SIN errorMap
        company_id: zod_1.z.string().regex(/^\d+$/).optional(),
        status: zod_1.z.string().regex(/^[01]$/).optional(),
    }).optional(),
});
/**
 * Schema para obtener usuarios por rol
 */
exports.getUsersByRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        role: zod_1.z.nativeEnum(client_1.ROLES), // ✅ SIN errorMap
    }),
});
/**
  * Buscar si existe un usuario para asignarlo como STAFF
  */
exports.searchUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        q: zod_1.z.string().min(3, 'El término de búsqueda debe tener al menos 3 caracteres'),
        role: zod_1.z
            .string()
            .regex(/^(PAYPAC|ORGANIZER|STAFF|STAFF_PROMOTER|PROMOTER|CUSTOMER)(,(PAYPAC|ORGANIZER|STAFF|STAFF_PROMOTER|PROMOTER|CUSTOMER))*$/, 'Roles inválidos')
            .optional(),
    }),
});
