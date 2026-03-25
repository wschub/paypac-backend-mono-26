import { Router } from 'express';
import {
  getMyTickets,
  getTicketById,
  transferTicket,
  validateTicket,
  getUpcomingTickets,
  cancelTicket,
  getEventTicketStats,
  registerPublicKey, getTotpSecret,
} from '../controllers/ticket.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  getTicketByIdSchema,
  transferTicketSchema,
  validateTicketSchema,
  getUpcomingTicketsSchema,
  cancelTicketSchema,
  getEventStatsSchema,
  registerPublicKeySchema,
} from '../validators/ticket.validation';
//admin
import {
  getAdminTickets,
  updateTicketStatus,
  adminTransferTicket,
} from '../controllers/ticket.admin.controller';
import {
  getAdminTicketsSchema,
  updateTicketStatusSchema,
  adminTransferTicketSchema,
} from '../validators/ticket.admin.validation';

const router = Router();


/*
ADMIN
*/
// GET /api/tickets/admin
router.get(
  '/admin',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  validateRequest(getAdminTicketsSchema),
  getAdminTickets
);

// PATCH /api/tickets/admin/:id/status
router.patch(
  '/admin/:id/status',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateTicketStatusSchema),
  updateTicketStatus
);

// POST /api/tickets/admin/:id/transfer
router.post(
  '/admin/:id/transfer',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(adminTransferTicketSchema),
  adminTransferTicket
);

/*=============== */



/**
 * GET /api/tickets/my-tickets
 * Obtener mis tickets (Wallet)
 * Acceso: Todos los usuarios autenticados
 */
router.get(
  '/my-tickets',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getMyTickets
);

/**
 * GET /api/tickets/upcoming
 * Obtener tickets próximos (para notificaciones)
 * Acceso: Todos los usuarios autenticados
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get(
  '/upcoming',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getUpcomingTicketsSchema),
  getUpcomingTickets
);

/**
 * GET /api/tickets/event/:eventId/stats
 * Obtener estadísticas de tickets por evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get(
  '/event/:eventId/stats',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC', 'STAFF'),
  validateRequest(getEventStatsSchema),
  getEventTicketStats
);

router.patch(
  '/:id/public-key',
  authenticate,
  authorizeRoles('CUSTOMER', 'PAYPAC'),
  validateRequest(registerPublicKeySchema),
  registerPublicKey
);

router.get(
  '/:id/totp-secret',
  authenticate,
  authorizeRoles('CUSTOMER', 'PAYPAC'),
  getTotpSecret
);


/**
 * GET /api/tickets/:id
 * Obtener un ticket específico por ID
 * Acceso: Solo el dueño del ticket
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getTicketByIdSchema),
  getTicketById
);

/**
 * POST /api/tickets/:id/transfer
 * Transferir/regalar/vender ticket
 * Acceso: Solo el dueño del ticket
 */
router.post(
  '/:id/transfer',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(transferTicketSchema),
  transferTicket
);

/**
 * POST /api/tickets/:id/validate
 * Validar ticket en la entrada del evento
 * Requiere: STAFF, STAFF_PROMOTER, ORGANIZER (del evento), PAYPAC
 */
router.post(
  '/:id/validate',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER'),
  validateRequest(validateTicketSchema),
  validateTicket
);

/**
 * DELETE /api/tickets/:id
 * Cancelar ticket
 * Acceso: Dueño del ticket o PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(cancelTicketSchema),
  cancelTicket
);

export default router;
