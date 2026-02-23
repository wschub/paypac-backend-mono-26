import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoriesStats,
  getCategoriesByCountry,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  getCategoriesByCountrySchema,
  getCategoriesQuerySchema,
  getCategoriesStatsSchema,
} from '../validators/category.validation';

const router = Router();

const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];

/**
 * GET /api/categories
 * Listar categorías con filtros opcionales (?search=&country_id=)
 * Acceso: todos los roles autenticados
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCategoriesQuerySchema),
  getCategories
);

/**
 * GET /api/categories/stats
 * Estadísticas de categorías (?country_id= opcional)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCategoriesStatsSchema),
  getCategoriesStats
);

/**
 * GET /api/categories/by-country/:country_id
 * Jerarquía completa: categorías → subcategorías → subgéneros de un país
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/by-country/:country_id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCategoriesByCountrySchema),
  getCategoriesByCountry
);

/**
 * GET /api/categories/:id
 * Categoría por ID con subcategorías y subgéneros anidados
 * Acceso: todos los roles autenticados
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCategoryByIdSchema),
  getCategoryById
);

/**
 * POST /api/categories
 * Crear nueva categoría
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createCategorySchema),
  createCategory
);

/**
 * PUT /api/categories/:id
 * Actualizar categoría
 * Acceso: solo PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateCategorySchema),
  updateCategory
);

/**
 * DELETE /api/categories/:id
 * Eliminar categoría (solo si no tiene subcategorías ni eventos)
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCategoryByIdSchema),
  deleteCategory
);

export default router;