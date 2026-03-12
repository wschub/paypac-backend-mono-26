import { Router } from 'express';
import {
  upsertPermission,
  getPermissionsByRole,
  getPermissionByRoleAndSection,
  deletePermission,
  bulkUpsertPermissions,
} from '../controllers/role_section_permission.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  upsertPermissionSchema,
  roleParamSchema,
  roleAndSectionParamSchema,
  bulkUpsertSchema,
} from '../validators/role_section_permission.validation';

const router = Router();

/**
 * POST /api/permissions
 * Crear o actualizar permiso (upsert)
 * Acceso: PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(upsertPermissionSchema),
  upsertPermission
);

/**
 * POST /api/permissions/sections/:sectionId/bulk
 * Asignar permisos de una sección a múltiples roles a la vez
 * Acceso: PAYPAC
 */
router.post(
  '/sections/:sectionId/bulk',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(bulkUpsertSchema),
  bulkUpsertPermissions
);

/**
 * GET /api/permissions/roles/:role
 * Ver todos los permisos de un rol
 * Acceso: PAYPAC
 */
router.get(
  '/roles/:role',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(roleParamSchema),
  getPermissionsByRole
);

/**
 * GET /api/permissions/roles/:role/sections/:sectionId
 * Ver permiso específico de un rol en una sección
 * Acceso: PAYPAC
 */
router.get(
  '/roles/:role/sections/:sectionId',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(roleAndSectionParamSchema),
  getPermissionByRoleAndSection
);

/**
 * DELETE /api/permissions/roles/:role/sections/:sectionId
 * Eliminar permiso de un rol en una sección
 * Acceso: PAYPAC
 */
router.delete(
  '/roles/:role/sections/:sectionId',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(roleAndSectionParamSchema),
  deletePermission
);

export default router;