import { Router } from 'express';
import {
  assignStaffToEvent,
  getEventStaff,
  getMyAssignedEvents,
  removeStaffFromEvent,
  checkInStaff,
  checkOutStaff,
  getEventStaffStats,
  inviteStaffToEvent,
} from '../controllers/event_staff_assignment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  assignStaffSchema,
  getEventStaffSchema,
  removeStaffSchema,
  checkInStaffSchema,
  checkOutStaffSchema,
  getStaffStatsSchema,
  inviteStaffSchema,
} from '../validators/event_staff_assignment.validation';

const router = Router();

/**
 * GET /api/staff/my-events
 * Obtener eventos asignados al STAFF autenticado
 * Requiere: STAFF, STAFF_PROMOTER
 * 
 * NOTA: Esta ruta debe registrarse ANTES que las rutas de /api/events
 */
router.get(
  '/my-events',
  authenticate,
  authorizeRoles('STAFF', 'STAFF_PROMOTER', 'PAYPAC'),
  getMyAssignedEvents
);

/**
 * POST /api/events/:eventId/staff
 * Asignar staff existente o invitar uno nuevo (?invite=true)
 * Requiere: ORGANIZER o PAYPAC
 */
/** */
router.post(
  '/:eventId/staff',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  (req, res, next) => {
    const schema = req.query.invite === 'true' ? inviteStaffSchema : assignStaffSchema;
    validateRequest(schema)(req, res, next);
  },
  (req, res) => {
    if (req.query.invite === 'true') {
      return inviteStaffToEvent(req, res);
    }
    return assignStaffToEvent(req, res);
  }
);


/**
 * GET /api/events/:eventId/staff
 * Obtener todos los STAFF asignados a un evento
 * Requiere: ORGANIZER (dueño), STAFF del evento, o PAYPAC
 */
router.get(
  '/:eventId/staff',
  authenticate,
  authorizeRoles('ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PAYPAC'),
  validateRequest(getEventStaffSchema),
  getEventStaff
);

/**
 * GET /api/events/:eventId/staff/stats
 * Obtener estadísticas de STAFF del evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get(
  '/:eventId/staff/stats',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getStaffStatsSchema),
  getEventStaffStats
);

/**
 * POST /api/events/:eventId/staff/check-in
 * Check-in del STAFF en el evento
 * Requiere: STAFF, STAFF_PROMOTER
 */
router.post(
  '/:eventId/staff/check-in',
  authenticate,
  authorizeRoles('STAFF', 'STAFF_PROMOTER', 'PAYPAC'),
  validateRequest(checkInStaffSchema),
  checkInStaff
);

/**
 * POST /api/events/:eventId/staff/check-out
 * Check-out del STAFF del evento
 * Requiere: STAFF, STAFF_PROMOTER
 */
router.post(
  '/:eventId/staff/check-out',
  authenticate,
  authorizeRoles('STAFF', 'STAFF_PROMOTER', 'PAYPAC'),
  validateRequest(checkOutStaffSchema),
  checkOutStaff
);

/**
 * DELETE /api/events/:eventId/staff/:staffUserId
 * Remover un STAFF de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.delete(
  '/:eventId/staff/:staffUserId',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(removeStaffSchema),
  removeStaffFromEvent
);




export default router;
