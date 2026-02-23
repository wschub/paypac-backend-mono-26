import { Router } from 'express';
import {
  createCity,
  getCities,
  getCitiesStats,
  getCitiesByCountry,
  getCitiesByState,
  getCityById,
  updateCity,
  deleteCity,
} from '../controllers/cities.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createCitySchema,
  updateCitySchema,
  getCityByIdSchema,
  getCitiesByCountrySchema,
  getCitiesByStateSchema,
  getCitiesQuerySchema,
  getCitiesStatsSchema,
} from '../validators/cities.validation';

const router = Router();

const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];

/**
 * GET /api/cities
 * Listar ciudades con filtros opcionales (?search=&country_id=&state_id=)
 * Acceso: todos los roles autenticados
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCitiesQuerySchema),
  getCities
);

/**
 * GET /api/cities/stats
 * Estadísticas (?country_id=&state_id= opcionales)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCitiesStatsSchema),
  getCitiesStats
);

/**
 * GET /api/cities/by-country/:country_id
 * Ciudades de un país directamente, sin pasar por estados
 * Retorna las ciudades agrupadas con su estado como referencia
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/by-country/:country_id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCitiesByCountrySchema),
  getCitiesByCountry
);

/**
 * GET /api/cities/by-state/:state_id
 * Ciudades de un estado específico
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/by-state/:state_id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCitiesByStateSchema),
  getCitiesByState
);

/**
 * GET /api/cities/:id
 * Obtener ciudad por ID
 * Acceso: todos los roles autenticados
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getCityByIdSchema),
  getCityById
);

/**
 * POST /api/cities
 * Crear una nueva ciudad
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createCitySchema),
  createCity
);

/**
 * PUT /api/cities/:id
 * Actualizar ciudad
 * Acceso: solo PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateCitySchema),
  updateCity
);

/**
 * DELETE /api/cities/:id
 * Eliminar ciudad
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getCityByIdSchema),
  deleteCity
);

export default router;