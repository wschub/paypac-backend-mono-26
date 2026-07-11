"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_section_permission_controller_1 = require("../controllers/role_section_permission.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const role_section_permission_validation_1 = require("../validators/role_section_permission.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/permissions
 * Crear o actualizar permiso (upsert)
 * Acceso: PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(role_section_permission_validation_1.upsertPermissionSchema), role_section_permission_controller_1.upsertPermission);
/**
 * POST /api/permissions/sections/:sectionId/bulk
 * Asignar permisos de una sección a múltiples roles a la vez
 * Acceso: PAYPAC
 */
router.post('/sections/:sectionId/bulk', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(role_section_permission_validation_1.bulkUpsertSchema), role_section_permission_controller_1.bulkUpsertPermissions);
/**
 * GET /api/permissions/roles/:role
 * Ver todos los permisos de un rol
 * Acceso: PAYPAC
 */
router.get('/roles/:role', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(role_section_permission_validation_1.roleParamSchema), role_section_permission_controller_1.getPermissionsByRole);
/**
 * GET /api/permissions/roles/:role/sections/:sectionId
 * Ver permiso específico de un rol en una sección
 * Acceso: PAYPAC
 */
router.get('/roles/:role/sections/:sectionId', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(role_section_permission_validation_1.roleAndSectionParamSchema), role_section_permission_controller_1.getPermissionByRoleAndSection);
/**
 * DELETE /api/permissions/roles/:role/sections/:sectionId
 * Eliminar permiso de un rol en una sección
 * Acceso: PAYPAC
 */
router.delete('/roles/:role/sections/:sectionId', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(role_section_permission_validation_1.roleAndSectionParamSchema), role_section_permission_controller_1.deletePermission);
exports.default = router;
