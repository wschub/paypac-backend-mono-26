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
   getAvailableEventsForPromoter,
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
import { markEventViewConversion } from '../controllers/eventViews.controller';
import { markConversionSchema } from '../validators/eventViews.validation';

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
 *           Soporta múltiples separados por coma: status=ACTIVE,APPROVED
 * - event_type: PUBLICO | PRIVADO
 * - category_id: number
 * - subcategory_id: number
 * - subgenre_id: number
 * - country: string
 * - city: string
 * - search: string (busca en name, description, short_description)
 * - date_from: ISO datetime — eventos desde esta fecha (ej: 2026-03-01T00:00:00.000Z)
 * - date_to: ISO datetime — eventos hasta esta fecha (ej: 2026-12-31T23:59:59.000Z)
 * - latitude: string — latitud del usuario (para futura búsqueda por proximidad)
 * - longitude: string — longitud del usuario (para futura búsqueda por proximidad)
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
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
 * GET /api/events/promoter-available
 * Eventos con allow_external_promoters=true + resumen de ventas del promotor
 * Requiere: PROMOTER o STAFF_PROMOTER
 *
 * NOTA: Debe ir ANTES de /:id para evitar conflicto de rutas
 */
router.get(
  '/promoter-available',
  authenticate,
  authorizeRoles('PROMOTER', 'STAFF_PROMOTER', 'ORGANIZER'),
  getAvailableEventsForPromoter
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

router.post(
  '/:id/view/conversion',
  authenticate,
  authorizeRoles('CUSTOMER'),
  validateRequest(markConversionSchema),
  markEventViewConversion
);

export default router;