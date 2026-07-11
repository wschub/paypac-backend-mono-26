"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const invoice_validation_1 = require("../validators/invoice.validation");
const router = (0, express_1.Router)();
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
router.post('/invoices', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(invoice_validation_1.createInvoiceSchema), invoice_controller_1.createInvoice);
/**
 * GET /api/invoices/my-invoices
 * Obtener facturas del usuario autenticado
 * Acceso: Todos los roles autenticados
 */
router.get('/invoices/my-invoices', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), invoice_controller_1.getMyInvoices);
/**
 * GET /api/invoices/:id
 * Obtener factura por ID
 * Acceso: Dueño de la factura, ORGANIZER del evento, PAYPAC
 */
router.get('/invoices/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(invoice_validation_1.getInvoiceByIdSchema), invoice_controller_1.getInvoiceById);
/**
 * GET /api/events/:eventId/invoices
 * Obtener facturas de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get('/events/:eventId/invoices', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(invoice_validation_1.getEventInvoicesSchema), invoice_controller_1.getEventInvoices);
/**
 * GET /api/events/:eventId/invoices/stats
 * Obtener estadísticas de facturas de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get('/events/:eventId/invoices/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(invoice_validation_1.getEventInvoicesSchema), invoice_controller_1.getEventInvoiceStats);
/**
 * PATCH /api/invoices/:id/status
 * Actualizar estado de factura
 * (Usado internamente por webhook de pago)
 * Requiere: PAYPAC (o llamada interna autenticada)
 */
router.patch('/invoices/:id/status', 
// authenticate, // TODO: Agregar autenticación de webhook
(0, validate_middleware_1.validateRequest)(invoice_validation_1.updateInvoiceStatusSchema), invoice_controller_1.updateInvoiceStatus);
/**
 * PATCH /api/invoices/:id/cancel
 * Cancelar factura
 * Acceso: Dueño de la factura o PAYPAC
 */
router.patch('/invoices/:id/cancel', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(invoice_validation_1.getInvoiceByIdSchema), invoice_controller_1.cancelInvoice);
exports.default = router;
