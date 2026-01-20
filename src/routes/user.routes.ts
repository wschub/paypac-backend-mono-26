import { Router } from 'express';
import {
  getUsers,
  getUserById,
  getMyProfile,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUserStats,
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  updateUserSchema,
  getUserByIdSchema,
  getUsersSchema,
  getUsersByRoleSchema,
} from '../validators/user.validation';

const router = Router();

/**
 * GET /api/users
 * Listar usuarios
 * PAYPAC: Ve todos los usuarios
 * ORGANIZER: Ve solo usuarios de su empresa
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  validateRequest(getUsersSchema),
  getUsers
);

/**
 * GET /api/users/me/profile
 * Obtener perfil del usuario autenticado
 * Acceso: Todos los roles
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.get(
  '/me/profile',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getMyProfile
);

/**
 * GET /api/users/stats/all
 * Obtener estadísticas de usuarios
 * Requiere: PAYPAC
 */
router.get(
  '/stats/all',
  authenticate,
  authorizeRoles('PAYPAC'),
  getUserStats
);

/**
 * GET /api/users/role/:role
 * Obtener usuarios por rol
 * Requiere: PAYPAC
 */
router.get(
  '/role/:role',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getUsersByRoleSchema),
  getUsersByRole
);

/**
 * GET /api/users/:id
 * Obtener usuario por ID
 * Acceso: Propio usuario, usuarios de su empresa, o PAYPAC
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getUserByIdSchema),
  getUserById
);

/**
 * PUT /api/users/:id
 * Actualizar usuario
 * Acceso: Propio usuario o PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(updateUserSchema),
  updateUser
);

/**
 * DELETE /api/users/:id
 * Eliminar usuario
 * Requiere: PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getUserByIdSchema),
  deleteUser
);

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

export default router;