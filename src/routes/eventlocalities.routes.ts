import { Router } from 'express';
import {
  createLocality,
  getLocalitiesByEventId,
  getLocalityById,
  updateLocality,
  deleteLocality,
  getLocalitiesStats,
} from '../controllers/eventlocalities.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createLocalitySchema,
  updateLocalitySchema,
  getLocalityByIdSchema,
  getLocalitiesByEventIdSchema,
} from '../validators/eventlocalities.validation';

const router = Router();

/**
 * POST /api/events/:eventId/localities
 * Crear una nueva localidad para un evento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.post(
  '/events/:eventId/localities',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(createLocalitySchema),
  createLocality
);

/**
 * GET /api/events/:eventId/localities
 * Obtener todas las localidades de un evento
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/events/:eventId/localities',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getLocalitiesByEventIdSchema),
  getLocalitiesByEventId
);

/**
 * GET /api/events/:eventId/localities/stats
 * Obtener estadísticas de localidades de un evento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.get(
  '/events/:eventId/localities/stats',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getLocalitiesByEventIdSchema),
  getLocalitiesStats
);

/**
 * GET /api/localities/:id
 * Obtener una localidad específica por ID
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/localities/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getLocalityByIdSchema),
  getLocalityById
);

/**
 * PUT /api/localities/:id
 * Actualizar una localidad
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.put(
  '/localities/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(updateLocalitySchema),
  updateLocality
);

/**
 * DELETE /api/localities/:id
 * Eliminar una localidad
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.delete(
  '/localities/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getLocalityByIdSchema),
  deleteLocality
);

export default router;