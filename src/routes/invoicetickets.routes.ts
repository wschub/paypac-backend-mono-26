import { Router } from 'express';
import {
  getInvoiceItems,
  getItemById,
  getTicketsSoldByStage,
  getTicketsSoldByLocality,
  getRevenueByStage,
  getSalesSummaryByEvent,
} from '../controllers/invoicetickets.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  getInvoiceItemsSchema,
  getItemByIdSchema,
  getTicketsSoldByStageSchema,
  getTicketsSoldByLocalitySchema,
  getSalesSummaryByEventSchema,
} from '../validators/invoicetickets.validation';

const router = Router();

/**
 * GET /api/invoices/:invoiceId/items
 * Obtener items de una factura
 * Acceso: Dueño de la factura o PAYPAC
 */
router.get(
  '/invoices/:invoiceId/items',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getInvoiceItemsSchema),
  getInvoiceItems
);

/**
 * GET /api/invoice-items/:id
 * Obtener item por ID
 * Acceso: Dueño de la factura o PAYPAC
 */
router.get(
  '/invoice-items/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getItemByIdSchema),
  getItemById
);

/**
 * GET /api/stages/:stageId/tickets-sold
 * Obtener tickets vendidos por stage
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/stages/:stageId/tickets-sold',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getTicketsSoldByStageSchema),
  getTicketsSoldByStage
);

/**
 * GET /api/localities/:localityId/tickets-sold
 * Obtener tickets vendidos por localidad
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/localities/:localityId/tickets-sold',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getTicketsSoldByLocalitySchema),
  getTicketsSoldByLocality
);

/**
 * GET /api/stages/:stageId/revenue
 * Obtener ingresos por stage
 * Requiere: ORGANIZER o PAYPAC
 */
router.get(
  '/stages/:stageId/revenue',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getTicketsSoldByStageSchema),
  getRevenueByStage
);

/**
 * GET /api/events/:eventId/sales-summary
 * Obtener resumen de ventas por evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get(
  '/events/:eventId/sales-summary',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getSalesSummaryByEventSchema),
  getSalesSummaryByEvent
);

export default router;