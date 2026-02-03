import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getOrganizerStats,
} from '../controllers/event.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createEventSchema,
  updateEventSchema,
  getEventByIdSchema,
  updateEventStatusSchema,
  getEventsQuerySchema,
} from '../validators/event.validation';

const router = Router();

/**
 * POST /api/events
 * Crear un nuevo evento
 * Requiere: ORGANIZER o PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(createEventSchema),
  createEvent
);

/**
 * GET /api/events
 * Listar todos los eventos (con filtros)
 * Acceso: Todos los roles autenticados
 * 
 * Query params opcionales:
 * - status: CREATED | APPROVED | SCHEDULED | ACTIVE | CANCELED | RE_SCHEDULED | FINALIZED
 * - event_type: PUBLICO | PRIVADO
 * - category_id: number
 * - country: string
 * - city: string
 * - search: string (busca en name, description, short_description)
 */
router.get(
  '/',
  //authenticate,
  //authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getEventsQuerySchema),
  getEvents
);

/**
 * GET /api/events/my-events
 * Obtener eventos del organizador autenticado
 * Requiere: ORGANIZER
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get(
  '/my-events',
  authenticate,
  authorizeRoles('ORGANIZER'),
  getMyEvents
);

/**
 * GET /api/events/organizer/stats
 * Obtener estadísticas de eventos del organizador
 * Requiere: ORGANIZER
 */
router.get(
  '/organizer/stats',
  authenticate,
  authorizeRoles('ORGANIZER'),
  getOrganizerStats
);

/**
 * GET /api/events/:id
 * Obtener un evento específico por ID
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getEventByIdSchema),
  getEventById
);

/**
 * PUT /api/events/:id
 * Actualizar un evento completo
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(updateEventSchema),
  updateEvent
);

/**
 * PATCH /api/events/:id/status
 * Actualizar solo el status del evento (aprobar, rechazar, cancelar, etc.)
 * Requiere: PAYPAC
 */
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateEventStatusSchema),
  updateEventStatus
);

/**
 * DELETE /api/events/:id
 * Eliminar un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getEventByIdSchema),
  deleteEvent
);

export default router;