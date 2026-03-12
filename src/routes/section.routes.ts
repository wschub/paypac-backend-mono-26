import { Router } from 'express';
import {
  createSection,
  getAllSections,
  getSectionById,
  getMenu,
  updateSection,
  deleteSection,
  reorderSections,
} from '../controllers/section.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createSectionSchema,
  updateSectionSchema,
  sectionIdParamSchema,
  reorderSectionsSchema,
} from '../validators/section.validation';

const router = Router();

/**
 * GET /api/sections/menu
 * Menú dinámico para el usuario autenticado — rol viene del token
 * Acceso: PAYPAC, ORGANIZER
 * NOTA: debe ir ANTES de /:id
 */
router.get(
  '/menu',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  getMenu
);

/**
 * POST /api/sections/reorder
 * Reordenar secciones
 * Acceso: PAYPAC
 */
router.post(
  '/reorder',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(reorderSectionsSchema),
  reorderSections
);

/**
 * GET /api/sections
 * Listar todas las secciones
 * Acceso: PAYPAC
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  getAllSections
);

/**
 * POST /api/sections
 * Crear sección
 * Acceso: PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createSectionSchema),
  createSection
);

/**
 * GET /api/sections/:id
 * Obtener sección por ID
 * Acceso: PAYPAC
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(sectionIdParamSchema),
  getSectionById
);

/**
 * PUT /api/sections/:id
 * Actualizar sección
 * Acceso: PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateSectionSchema),
  updateSection
);

/**
 * DELETE /api/sections/:id
 * Soft delete sección
 * Acceso: PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(sectionIdParamSchema),
  deleteSection
);

export default router;