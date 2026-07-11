"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subcategory_controller_1 = require("../controllers/subcategory.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const subcategory_validation_1 = require("../validators/subcategory.validation");
const router = (0, express_1.Router)();
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
/**
 * GET /api/subcategories
 * Listar subcategorías con filtros opcionales (?search=&category_id=&country_id=)
 * Acceso: todos los roles autenticados
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(subcategory_validation_1.getSubCategoriesQuerySchema), subcategory_controller_1.getSubCategories);
/**
 * GET /api/subcategories/stats
 * Estadísticas (?category_id=&country_id= opcionales)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(subcategory_validation_1.getSubCategoriesStatsSchema), subcategory_controller_1.getSubCategoriesStats);
/**
 * GET /api/subcategories/by-category/:category_id
 * Subcategorías de una categoría con sus subgéneros anidados
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/by-category/:category_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(subcategory_validation_1.getSubCategoriesByCategorySchema), subcategory_controller_1.getSubCategoriesByCategory);
/**
 * GET /api/subcategories/:id
 * Subcategoría por ID con subgéneros anidados
 * Acceso: todos los roles autenticados
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(subcategory_validation_1.getSubCategoryByIdSchema), subcategory_controller_1.getSubCategoryById);
/**
 * POST /api/subcategories
 * Crear nueva subcategoría
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(subcategory_validation_1.createSubCategorySchema), subcategory_controller_1.createSubCategory);
/**
 * PUT /api/subcategories/:id
 * Actualizar subcategoría (nombre y/o categoría padre)
 * Acceso: solo PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(subcategory_validation_1.updateSubCategorySchema), subcategory_controller_1.updateSubCategory);
/**
 * DELETE /api/subcategories/:id
 * Eliminar subcategoría (solo si no tiene subgéneros ni eventos)
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(subcategory_validation_1.getSubCategoryByIdSchema), subcategory_controller_1.deleteSubCategory);
exports.default = router;
