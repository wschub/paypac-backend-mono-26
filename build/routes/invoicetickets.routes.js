"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoicetickets_controller_1 = require("../controllers/invoicetickets.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const invoicetickets_validation_1 = require("../validators/invoicetickets.validation");
const router = (0, express_1.Router)();
/**
 * GET /api/invoices/:invoiceId/items
 * Obtener items de una factura
 * Acceso: Dueño de la factura o PAYPAC
 */
router.get('/invoices/:invoiceId/items', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(invoicetickets_validation_1.getInvoiceItemsSchema), invoicetickets_controller_1.getInvoiceItems);
/**
 * GET /api/invoice-items/:id
 * Obtener item por ID
 * Acceso: Dueño de la factura o PAYPAC
 */
router.get('/invoice-items/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(invoicetickets_validation_1.getItemByIdSchema), invoicetickets_controller_1.getItemById);
/**
 * GET /api/stages/:stageId/tickets-sold
 * Obtener tickets vendidos por stage
 * Acceso: Todos los roles autenticados
 */
router.get('/stages/:stageId/tickets-sold', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(invoicetickets_validation_1.getTicketsSoldByStageSchema), invoicetickets_controller_1.getTicketsSoldByStage);
/**
 * GET /api/localities/:localityId/tickets-sold
 * Obtener tickets vendidos por localidad
 * Acceso: Todos los roles autenticados
 */
router.get('/localities/:localityId/tickets-sold', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(invoicetickets_validation_1.getTicketsSoldByLocalitySchema), invoicetickets_controller_1.getTicketsSoldByLocality);
/**
 * GET /api/stages/:stageId/revenue
 * Obtener ingresos por stage
 * Requiere: ORGANIZER o PAYPAC
 */
router.get('/stages/:stageId/revenue', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(invoicetickets_validation_1.getTicketsSoldByStageSchema), invoicetickets_controller_1.getRevenueByStage);
/**
 * GET /api/events/:eventId/sales-summary
 * Obtener resumen de ventas por evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get('/events/:eventId/sales-summary', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(invoicetickets_validation_1.getSalesSummaryByEventSchema), invoicetickets_controller_1.getSalesSummaryByEvent);
exports.default = router;
