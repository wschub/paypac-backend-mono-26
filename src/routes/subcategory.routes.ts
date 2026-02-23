import { Router } from 'express';
import {
  createSubCategory,
  getSubCategories,
  getSubCategoriesStats,
  getSubCategoriesByCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
} from '../controllers/subcategory.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createSubCategorySchema,
  updateSubCategorySchema,
  getSubCategoryByIdSchema,
  getSubCategoriesByCategorySchema,
  getSubCategoriesQuerySchema,
  getSubCategoriesStatsSchema,
} from '../validators/subcategory.validation';

const router = Router();

const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];

/**
 * GET /api/subcategories
 * Listar subcategorías con filtros opcionales (?search=&category_id=&country_id=)
 * Acceso: todos los roles autenticados
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getSubCategoriesQuerySchema),
  getSubCategories
);

/**
 * GET /api/subcategories/stats
 * Estadísticas (?category_id=&country_id= opcionales)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getSubCategoriesStatsSchema),
  getSubCategoriesStats
);

/**
 * GET /api/subcategories/by-category/:category_id
 * Subcategorías de una categoría con sus subgéneros anidados
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/by-category/:category_id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getSubCategoriesByCategorySchema),
  getSubCategoriesByCategory
);

/**
 * GET /api/subcategories/:id
 * Subcategoría por ID con subgéneros anidados
 * Acceso: todos los roles autenticados
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getSubCategoryByIdSchema),
  getSubCategoryById
);

/**
 * POST /api/subcategories
 * Crear nueva subcategoría
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createSubCategorySchema),
  createSubCategory
);

/**
 * PUT /api/subcategories/:id
 * Actualizar subcategoría (nombre y/o categoría padre)
 * Acceso: solo PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateSubCategorySchema),
  updateSubCategory
);

/**
 * DELETE /api/subcategories/:id
 * Eliminar subcategoría (solo si no tiene subgéneros ni eventos)
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getSubCategoryByIdSchema),
  deleteSubCategory
);

export default router;