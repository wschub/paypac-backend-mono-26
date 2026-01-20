import { Router } from 'express';
import {
  getBalancesByEventId,
  getPromoterBalance,
  getMyBalance,
  getMyBalanceStats,
  markAsPaid,
  bulkMarkAsPaid,
  createRefundBalance,
  getEventBalanceStats,
  getAllPendingBalances,
  assignCutoffDate,
} from '../controllers/eventBalancePromoters.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  getBalancesByEventIdSchema,
  getPromoterBalanceSchema,
  markAsPaidSchema,
  bulkMarkAsPaidSchema,
  createRefundBalanceSchema,
  assignCutoffDateSchema,
} from '../validators/eventBalancePromoters.validation';

const router = Router();

/**
 * GET /api/events/:eventId/balances
 * Obtener todos los balances de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get(
  '/events/:eventId/balances',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getBalancesByEventIdSchema),
  getBalancesByEventId
);

/**
 * GET /api/events/:eventId/balances/stats
 * Obtener estadísticas de balances del evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get(
  '/events/:eventId/balances/stats',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getBalancesByEventIdSchema),
  getEventBalanceStats
);

/**
 * POST /api/events/:eventId/balances/assign-cutoff
 * Asignar fecha de corte manualmente (normalmente es automático)
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.post(
  '/events/:eventId/balances/assign-cutoff',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(assignCutoffDateSchema),
  assignCutoffDate
);

/**
 * GET /api/balances/pending
 * Obtener todos los balances pendientes de pago
 * Requiere: PAYPAC
 */
router.get(
  '/balances/pending',
  authenticate,
  authorizeRoles('PAYPAC'),
  getAllPendingBalances
);

/**
 * GET /api/balances/promoter/:promoterId
 * Obtener extracto de un promotor específico
 * Acceso: El mismo promotor, ORGANIZER o PAYPAC
 */
router.get(
  '/balances/promoter/:promoterId',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'PROMOTER', 'STAFF_PROMOTER'),
  validateRequest(getPromoterBalanceSchema),
  getPromoterBalance
);

/**
 * GET /api/promoters/my-balance
 * Obtener extracto del promotor autenticado
 * Requiere: PROMOTER o STAFF_PROMOTER
 */
router.get(
  '/promoters/my-balance',
  authenticate,
  authorizeRoles('PROMOTER', 'STAFF_PROMOTER'),
  getMyBalance
);

/**
 * GET /api/promoters/my-balance/stats
 * Obtener estadísticas del promotor autenticado
 * Requiere: PROMOTER o STAFF_PROMOTER
 */
router.get(
  '/promoters/my-balance/stats',
  authenticate,
  authorizeRoles('PROMOTER', 'STAFF_PROMOTER'),
  getMyBalanceStats
);

/**
 * PATCH /api/balances/:id/mark-paid
 * Marcar un balance como pagado
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.patch(
  '/balances/:id/mark-paid',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(markAsPaidSchema),
  markAsPaid
);

/**
 * PATCH /api/balances/bulk-pay
 * Marcar múltiples balances como pagados en lote
 * Requiere: ORGANIZER (dueño) o PAYPAC
 * 
 * Body:
 * - balance_ids: number[]
 * - payment_date?: string
 * - payment_method?: string
 * - payment_reference?: string
 */
router.patch(
  '/balances/bulk-pay',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(bulkMarkAsPaidSchema),
  bulkMarkAsPaid
);

/**
 * POST /api/balances/:id/refund
 * Crear balance de reembolso (negativo)
 * Requiere: ORGANIZER (dueño) or PAYPAC
 */
router.post(
  '/balances/:id/refund',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(createRefundBalanceSchema),
  createRefundBalance
);

export default router;