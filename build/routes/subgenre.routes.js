"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subgenre_controller_1 = require("../controllers/subgenre.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const subgenre_validation_1 = require("../validators/subgenre.validation");
const router = (0, express_1.Router)();
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
/**
 * GET /api/subgenres
 * Listar subgéneros con filtros opcionales
 * (?search=&subcategory_id=&category_id=&country_id=)
 * Acceso: todos los roles autenticados
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(subgenre_validation_1.getSubgenresQuerySchema), subgenre_controller_1.getSubgenres);
/**
 * GET /api/subgenres/stats
 * Estadísticas (?subcategory_id=&category_id=&country_id= opcionales)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(subgenre_validation_1.getSubgenresStatsSchema), subgenre_controller_1.getSubgenresStats);
/**
 * GET /api/subgenres/by-subcategory/:subcategory_id
 * Subgéneros de una subcategoría específica
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/by-subcategory/:subcategory_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(subgenre_validation_1.getSubgenresBySubCategorySchema), subgenre_controller_1.getSubgenresBySubCategory);
/**
 * GET /api/subgenres/:id
 * Subgénero por ID con jerarquía completa
 * Acceso: todos los roles autenticados
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(subgenre_validation_1.getSubgenreByIdSchema), subgenre_controller_1.getSubgenreById);
/**
 * POST /api/subgenres
 * Crear nuevo subgénero
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(subgenre_validation_1.createSubgenreSchema), subgenre_controller_1.createSubgenre);
/**
 * PUT /api/subgenres/:id
 * Actualizar subgénero (nombre y/o subcategoría padre)
 * Acceso: solo PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(subgenre_validation_1.updateSubgenreSchema), subgenre_controller_1.updateSubgenre);
/**
 * DELETE /api/subgenres/:id
 * Eliminar subgénero (solo si no tiene eventos asociados)
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(subgenre_validation_1.getSubgenreByIdSchema), subgenre_controller_1.deleteSubgenre);
exports.default = router;
