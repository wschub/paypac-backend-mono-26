import { Router } from 'express';
import {
  createState,
  getStates,
  getStatesStats,
  getStatesByCountry,
  getStateById,
  updateState,
  deleteState,
} from '../controllers/states.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createStateSchema,
  updateStateSchema,
  getStateByIdSchema,
  getStatesByCountrySchema,
  getStatesQuerySchema,
  getStatesStatsSchema,
} from '../validators/states.validation';

const router = Router();

const ALL_ROLES = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'];

/**
 * GET /api/states
 * Listar estados con filtros opcionales (?search=&country_id=)
 * Acceso: todos los roles autenticados
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getStatesQuerySchema),
  getStates
);

/**
 * GET /api/states/stats
 * Estadísticas de estados (?country_id= opcional)
 * Acceso: solo PAYPAC
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getStatesStatsSchema),
  getStatesStats
);

/**
 * GET /api/states/by-country/:country_id
 * Estados de un país específico con sus ciudades anidadas
 * Acceso: todos los roles autenticados
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/by-country/:country_id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getStatesByCountrySchema),
  getStatesByCountry
);

/**
 * GET /api/states/:id
 * Obtener estado por ID con sus ciudades
 * Acceso: todos los roles autenticados
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  validateRequest(getStateByIdSchema),
  getStateById
);

/**
 * POST /api/states
 * Crear un nuevo estado
 * Acceso: solo PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createStateSchema),
  createState
);

/**
 * PUT /api/states/:id
 * Actualizar estado (nombre y/o país)
 * Acceso: solo PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateStateSchema),
  updateState
);

/**
 * DELETE /api/states/:id
 * Eliminar estado (solo si no tiene ciudades)
 * Acceso: solo PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getStateByIdSchema),
  deleteState
);

export default router;