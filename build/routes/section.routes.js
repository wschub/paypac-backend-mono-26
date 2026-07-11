"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const section_controller_1 = require("../controllers/section.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const section_validation_1 = require("../validators/section.validation");
const router = (0, express_1.Router)();
/**
 * GET /api/sections/menu
 * Menú dinámico para el usuario autenticado — rol viene del token
 * Acceso: PAYPAC, ORGANIZER
 * NOTA: debe ir ANTES de /:id
 */
router.get('/menu', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), section_controller_1.getMenu);
/**
 * POST /api/sections/reorder
 * Reordenar secciones
 * Acceso: PAYPAC
 */
router.post('/reorder', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(section_validation_1.reorderSectionsSchema), section_controller_1.reorderSections);
/**
 * GET /api/sections
 * Listar todas las secciones
 * Acceso: PAYPAC
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), section_controller_1.getAllSections);
/**
 * POST /api/sections
 * Crear sección
 * Acceso: PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(section_validation_1.createSectionSchema), section_controller_1.createSection);
/**
 * GET /api/sections/:id
 * Obtener sección por ID
 * Acceso: PAYPAC
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(section_validation_1.sectionIdParamSchema), section_controller_1.getSectionById);
/**
 * PUT /api/sections/:id
 * Actualizar sección
 * Acceso: PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(section_validation_1.updateSectionSchema), section_controller_1.updateSection);
/**
 * DELETE /api/sections/:id
 * Soft delete sección
 * Acceso: PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(section_validation_1.sectionIdParamSchema), section_controller_1.deleteSection);
exports.default = router;
