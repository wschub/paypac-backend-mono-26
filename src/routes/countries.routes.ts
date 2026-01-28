import { Router } from 'express';
import {
  createCountry,
  getCountries,
  getCountriesWithRelations,
  getCountriesStats,
  getCountryById,
  updateCountry,
  deleteCountry,
} from '../controllers/countries.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createCountrySchema,
  updateCountrySchema,
  getCountryByIdSchema,
  getCountriesQuerySchema,
} from '../validators/countries.validation';

const router = Router();

/**
 * POST /api/countries
 * Crear un nuevo país
 * Requiere: PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createCountrySchema),
  createCountry
);

/**
 * GET /api/countries
 * Listar todos los países
 * Requiere: PAYPAC
 * 
 * Query params opcionales:
 * - search: string (buscar por nombre o código)
 * - code: string (filtrar por código ISO)
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCountriesQuerySchema),
  getCountries
);

/**
 * GET /api/countries/with-relations
 * Listar países con estados y ciudades incluidos
 * Requiere: PAYPAC
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.get(
  '/with-relations',
  authenticate,
  authorizeRoles('PAYPAC'),
  getCountriesWithRelations
);

/**
 * GET /api/countries/stats
 * Obtener estadísticas de países
 * Requiere: PAYPAC
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  getCountriesStats
);

/**
 * GET /api/countries/:id
 * Obtener país por ID
 * Requiere: PAYPAC
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCountryByIdSchema),
  getCountryById
);

/**
 * PUT /api/countries/:id
 * Actualizar país
 * Requiere: PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateCountrySchema),
  updateCountry
);

/**
 * DELETE /api/countries/:id
 * Eliminar país
 * Requiere: PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCountryByIdSchema),
  deleteCountry
);

export default router;