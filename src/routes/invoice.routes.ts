import { Router } from 'express';
import {
  createInvoice,
  getInvoiceById,
  getMyInvoices,
  getEventInvoices,
  updateInvoiceStatus,
  cancelInvoice,
  getEventInvoiceStats,
} from '../controllers/invoice.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createInvoiceSchema,
  getInvoiceByIdSchema,
  getEventInvoicesSchema,
  updateInvoiceStatusSchema,
} from '../validators/invoice.validation';

const router = Router();

/**
 * POST /api/invoices
 * Crear una nueva factura
 * Acceso: Todos los roles autenticados
 * 
 * Body:
 * - event_id: number
 * - items: Array<{ stage_id, locality_id, qty_tickets }>
 * - discount_code?: string
 */
router.post(
  '/invoices',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(createInvoiceSchema),
  createInvoice
);

/**
 * GET /api/invoices/my-invoices
 * Obtener facturas del usuario autenticado
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/invoices/my-invoices',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getMyInvoices
);

/**
 * GET /api/invoices/:id
 * Obtener factura por ID
 * Acceso: Dueño de la factura, ORGANIZER del evento, PAYPAC
 */
router.get(
  '/invoices/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getInvoiceByIdSchema),
  getInvoiceById
);

/**
 * GET /api/events/:eventId/invoices
 * Obtener facturas de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get(
  '/events/:eventId/invoices',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getEventInvoicesSchema),
  getEventInvoices
);

/**
 * GET /api/events/:eventId/invoices/stats
 * Obtener estadísticas de facturas de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get(
  '/events/:eventId/invoices/stats',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getEventInvoicesSchema),
  getEventInvoiceStats
);

/**
 * PATCH /api/invoices/:id/status
 * Actualizar estado de factura
 * (Usado internamente por webhook de pago)
 * Requiere: PAYPAC (o llamada interna autenticada)
 */
router.patch(
  '/invoices/:id/status',
  // authenticate, // TODO: Agregar autenticación de webhook
  validateRequest(updateInvoiceStatusSchema),
  updateInvoiceStatus
);

/**
 * PATCH /api/invoices/:id/cancel
 * Cancelar factura
 * Acceso: Dueño de la factura o PAYPAC
 */
router.patch(
  '/invoices/:id/cancel',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getInvoiceByIdSchema),
  cancelInvoice
);

export default router;