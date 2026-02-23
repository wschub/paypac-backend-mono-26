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

// Roles con acceso de lectura
const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];

/**
 * GET /api/countries
 * Listar países con filtros opcionales
 * Acceso: todos los roles autenticados
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCountriesQuerySchema),
  getCountries
);

/**
 * GET /api/countries/with-relations
 * Listar países con jerarquía completa: estados → ciudades
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id para evitar conflicto de rutas
 */
router.get(
  '/with-relations',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  getCountriesWithRelations
);

/**
 * GET /api/countries/stats
 * Estadísticas de países, estados y ciudades
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  getCountriesStats
);

/**
 * GET /api/countries/:id
 * Obtener país por ID con estados y ciudades anidados
 * Acceso: todos los roles autenticados
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCountryByIdSchema),
  getCountryById
);

/**
 * POST /api/countries
 * Crear un nuevo país
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createCountrySchema),
  createCountry
);

/**
 * PUT /api/countries/:id
 * Actualizar país
 * Acceso: solo PAYPAC
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
 * Eliminar país (solo si no tiene estados, ciudades o categorías)
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCountryByIdSchema),
  deleteCountry
);

export default router;