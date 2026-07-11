"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const user_validation_1 = require("../validators/user.validation");
const router = (0, express_1.Router)();
/**
 * GET /api/users
 * Listar usuarios
 * PAYPAC: Ve todos los usuarios
 * ORGANIZER: Ve solo usuarios de su empresa
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), (0, validate_middleware_1.validateRequest)(user_validation_1.getUsersSchema), user_controller_1.getUsers);
/**
 * GET /api/users/me/profile
 * Obtener perfil del usuario autenticado
 * Acceso: Todos los roles
 *
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.get('/me/profile', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), user_controller_1.getMyProfile);
/**
 * GET /api/users/stats/all
 * Obtener estadísticas de usuarios
 * Requiere: PAYPAC
 */
router.get('/stats/all', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), user_controller_1.getUserStats);
/**
 * GET /api/users/search?q=<email_o_telefono>&role=STAFF,STAFF_PROMOTER
 * Buscar usuarios por email o teléfono con filtro opcional de roles
 * Acceso: PAYPAC y ORGANIZER
 * ⚠️ Antes de /:id
 */
router.get('/search', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), (0, validate_middleware_1.validateRequest)(user_validation_1.searchUsersSchema), user_controller_1.searchUsers);
/**
 * GET /api/users/role/:role
 * Obtener usuarios por rol
 * Requiere: PAYPAC
 */
router.get('/role/:role', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(user_validation_1.getUsersByRoleSchema), user_controller_1.getUsersByRole);
/**
 * GET /api/users/:id
 * Obtener usuario por ID
 * Acceso: Propio usuario, usuarios de su empresa, o PAYPAC
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(user_validation_1.getUserByIdSchema), user_controller_1.getUserById);
/**
 * PUT /api/users/:id
 * Actualizar usuario
 * Acceso: Propio usuario o PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(user_validation_1.updateUserSchema), user_controller_1.updateUser);
/**
 * DELETE /api/users/:id
 * Eliminar usuario
 * Requiere: PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(user_validation_1.getUserByIdSchema), user_controller_1.deleteUser);
/*// REGISTRO (Firebase + PostgreSQL)
POST   /api/auth/register         // Solo admin (PAYPAC)

// AUTENTICACIÓN
GET    /api/auth/me               // Perfil autenticado
GET    /api/auth/users            // Listar usuarios (admin)

// GESTIÓN DE USUARIOS (Solo PostgreSQL)
GET    /api/users                 // Listar (PAYPAC, ORGANIZER)
GET    /api/users/me/profile      // Mi perfil completo
GET    /api/users/:id             // Ver usuario
PUT    /api/users/:id             // Actualizar usuario
DELETE /api/users/:id             // Eliminar usuario (PAYPAC) */
exports.default = router;
