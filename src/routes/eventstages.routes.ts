import { Router } from 'express';
import {
  createStage,
  getStagesByLocalityId,
  getStageById,
  updateStage,
  deleteStage,
  getActiveStage,
  getUpcomingStages,
  getPriceStats,
  checkAvailability,
} from '../controllers/eventstages.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createStageSchema,
  updateStageSchema,
  getStageByIdSchema,
  getStagesByLocalityIdSchema,
} from '../validators/eventstages.validation';

const router = Router();

/**
 * POST /api/localities/:localityId/stages
 * Crear una nueva etapa para una localidad
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.post(
  '/localities/:localityId/stages',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(createStageSchema),
  createStage
);

/**
 * GET /api/localities/:localityId/stages
 * Obtener todas las etapas de una localidad
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/localities/:localityId/stages',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getStagesByLocalityIdSchema),
  getStagesByLocalityId
);

/**
 * GET /api/localities/:localityId/stages/active
 * Obtener la etapa activa actual de una localidad
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/localities/:localityId/stages/active',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getStagesByLocalityIdSchema),
  getActiveStage
);

/**
 * GET /api/localities/:localityId/stages/upcoming
 * Obtener próximas etapas de una localidad
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/localities/:localityId/stages/upcoming',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getStagesByLocalityIdSchema),
  getUpcomingStages
);

/**
 * GET /api/localities/:localityId/stages/price-stats
 * Obtener estadísticas de precios de una localidad
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/localities/:localityId/stages/price-stats',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getStagesByLocalityIdSchema),
  getPriceStats
);

/**
 * GET /api/stages/:id
 * Obtener una etapa específica por ID
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/stages/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getStageByIdSchema),
  getStageById
);

/**
 * GET /api/stages/:id/availability
 * Verificar disponibilidad de una etapa
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/stages/:id/availability',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getStageByIdSchema),
  checkAvailability
);

/**
 * PUT /api/stages/:id
 * Actualizar una etapa
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.put(
  '/stages/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(updateStageSchema),
  updateStage
);

/**
 * DELETE /api/stages/:id
 * Eliminar una etapa
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.delete(
  '/stages/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getStageByIdSchema),
  deleteStage
);

export default router;