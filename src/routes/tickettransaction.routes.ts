import { Router } from 'express';
import {
  getPendingTransactions,
  getUserHistory,
  getSentTransactions,
  getReceivedTransactions,
  getTicketHistory,
  getTransactionById,
  acceptTransfer,
  rejectTransfer,
  cancelTransfer,
  countPendingTransactions,
   sendTransfer,
  acceptByContact,
} from '../controllers/tickettransaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  getTransactionByIdSchema,
  acceptTransferSchema,
  rejectTransferSchema,
  cancelTransferSchema,
  getTicketHistorySchema,
  sendTransferSchema, 
  acceptByContactSchema
} from '../validators/tickettransaction.validation';

const router = Router();

/**
 * GET /api/ticket-transactions/pending
 * Obtener transferencias pendientes para el usuario autenticado
 * Acceso: Todos los usuarios autenticados
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get(
  '/pending',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getPendingTransactions
);

/**
 * GET /api/ticket-transactions/history
 * Obtener historial completo de transacciones del usuario
 * Acceso: Todos los usuarios autenticados
 */
router.get(
  '/history',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getUserHistory
);

/**
 * GET /api/ticket-transactions/sent
 * Obtener transacciones enviadas por el usuario
 * Acceso: Todos los usuarios autenticados
 */
router.get(
  '/sent',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getSentTransactions
);

/**
 * GET /api/ticket-transactions/received
 * Obtener transacciones recibidas por el usuario
 * Acceso: Todos los usuarios autenticados
 */
router.get(
  '/received',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getReceivedTransactions
);

/**
 * GET /api/ticket-transactions/count/pending
 * Contar transacciones pendientes (para notificaciones)
 * Acceso: Todos los usuarios autenticados
 */
router.get(
  '/count/pending',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  countPendingTransactions
);

/**
 * GET /api/ticket-transactions/ticket/:ticketId/history
 * Obtener historial de un ticket específico
 * Acceso: Solo el dueño del ticket
 */
router.get(
  '/ticket/:ticketId/history',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getTicketHistorySchema),
  getTicketHistory
);


//transfer
// POST /api/ticket-transactions — enviar transferencia
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(sendTransferSchema),
  sendTransfer
);
 
// POST /api/ticket-transactions/accept-by-contact — al registrarse busca pendientes
router.post(
  '/accept-by-contact',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(acceptByContactSchema),
  acceptByContact
);


/**
 * GET /api/ticket-transactions/:id
 * Obtener detalles de una transacción específica
 * Acceso: Solo usuarios involucrados en la transacción
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getTransactionByIdSchema),
  getTransactionById
);

/**
 * POST /api/ticket-transactions/:id/accept
 * Aceptar transferencia de ticket
 * Acceso: Solo el receptor de la transferencia
 */
router.post(
  '/:id/accept',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(acceptTransferSchema),
  acceptTransfer
);

/**
 * POST /api/ticket-transactions/:id/reject
 * Rechazar transferencia de ticket
 * Acceso: Solo el receptor de la transferencia
 */
router.post(
  '/:id/reject',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(rejectTransferSchema),
  rejectTransfer
);

/**
 * POST /api/ticket-transactions/:id/cancel
 * Cancelar transferencia pendiente
 * Acceso: Solo el remitente de la transferencia
 */
router.post(
  '/:id/cancel',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(cancelTransferSchema),
  cancelTransfer
);

export default router;
