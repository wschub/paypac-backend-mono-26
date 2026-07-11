"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const category_validation_1 = require("../validators/category.validation");
const router = (0, express_1.Router)();
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];
/**
 * GET /api/categories
 * Listar categorías con filtros opcionales (?search=&country_id=)
 * Acceso: todos los roles autenticados
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(category_validation_1.getCategoriesQuerySchema), category_controller_1.getCategories);
/**
 * GET /api/categories/stats
 * Estadísticas de categorías (?country_id= opcional)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(category_validation_1.getCategoriesStatsSchema), category_controller_1.getCategoriesStats);
/**
 * GET /api/categories/by-country/:country_id
 * Jerarquía completa: categorías → subcategorías → subgéneros de un país
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get('/by-country/:country_id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(category_validation_1.getCategoriesByCountrySchema), category_controller_1.getCategoriesByCountry);
/**
 * GET /api/categories/:id
 * Categoría por ID con subcategorías y subgéneros anidados
 * Acceso: todos los roles autenticados
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(...ALL_ROLES), (0, validate_middleware_1.validateRequest)(category_validation_1.getCategoryByIdSchema), category_controller_1.getCategoryById);
/**
 * POST /api/categories
 * Crear nueva categoría
 * Acceso: solo PAYPAC
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(category_validation_1.createCategorySchema), category_controller_1.createCategory);
/**
 * PUT /api/categories/:id
 * Actualizar categoría
 * Acceso: solo PAYPAC
 */
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(category_validation_1.updateCategorySchema), category_controller_1.updateCategory);
/**
 * DELETE /api/categories/:id
 * Eliminar categoría (solo si no tiene subcategorías ni eventos)
 * Acceso: solo PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(category_validation_1.getCategoryByIdSchema), category_controller_1.deleteCategory);
exports.default = router;
