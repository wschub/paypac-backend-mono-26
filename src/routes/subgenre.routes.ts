import { Router } from 'express';
import {
  createSubgenre,
  getSubgenres,
  getSubgenresStats,
  getSubgenresBySubCategory,
  getSubgenreById,
  updateSubgenre,
  deleteSubgenre,
} from '../controllers/subgenre.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createSubgenreSchema,
  updateSubgenreSchema,
  getSubgenreByIdSchema,
  getSubgenresBySubCategorySchema,
  getSubgenresQuerySchema,
  getSubgenresStatsSchema,
} from '../validators/subgenre.validation';

const router = Router();

const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];

/**
 * GET /api/subgenres
 * Listar subgéneros con filtros opcionales
 * (?search=&subcategory_id=&category_id=&country_id=)
 * Acceso: todos los roles autenticados
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getSubgenresQuerySchema),
  getSubgenres
);

/**
 * GET /api/subgenres/stats
 * Estadísticas (?subcategory_id=&category_id=&country_id= opcionales)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getSubgenresStatsSchema),
  getSubgenresStats
);

/**
 * GET /api/subgenres/by-subcategory/:subcategory_id
 * Subgéneros de una subcategoría específica
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/by-subcategory/:subcategory_id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getSubgenresBySubCategorySchema),
  getSubgenresBySubCategory
);

/**
 * GET /api/subgenres/:id
 * Subgénero por ID con jerarquía completa
 * Acceso: todos los roles autenticados
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getSubgenreByIdSchema),
  getSubgenreById
);

/**
 * POST /api/subgenres
 * Crear nuevo subgénero
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createSubgenreSchema),
  createSubgenre
);

/**
 * PUT /api/subgenres/:id
 * Actualizar subgénero (nombre y/o subcategoría padre)
 * Acceso: solo PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateSubgenreSchema),
  updateSubgenre
);

/**
 * DELETE /api/subgenres/:id
 * Eliminar subgénero (solo si no tiene eventos asociados)
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getSubgenreByIdSchema),
  deleteSubgenre
);

export default router;