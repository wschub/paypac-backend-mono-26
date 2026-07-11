"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticket_controller_1 = require("../controllers/ticket.controller");
const ticket_consumption_controller_1 = require("../controllers/ticket_consumption.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const ticket_validation_1 = require("../validators/ticket.validation");
//admin
const ticket_admin_controller_1 = require("../controllers/ticket.admin.controller");
const ticket_admin_validation_1 = require("../validators/ticket.admin.validation");
const router = (0, express_1.Router)();
/*
ADMIN
*/
// GET /api/tickets/admin
router.get('/admin', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), (0, validate_middleware_1.validateRequest)(ticket_admin_validation_1.getAdminTicketsSchema), ticket_admin_controller_1.getAdminTickets);
// PATCH /api/tickets/admin/:id/status
router.patch('/admin/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(ticket_admin_validation_1.updateTicketStatusSchema), ticket_admin_controller_1.updateTicketStatus);
// POST /api/tickets/admin/:id/transfer
router.post('/admin/:id/transfer', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(ticket_admin_validation_1.adminTransferTicketSchema), ticket_admin_controller_1.adminTransferTicket);
/*=============== */
/**
 * GET /api/tickets/my-tickets
 * Obtener mis tickets (Wallet)
 * Acceso: Todos los usuarios autenticados
 */
router.get('/my-tickets', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), ticket_controller_1.getMyTickets);
/**
 * GET /api/tickets/upcoming
 * Obtener tickets próximos (para notificaciones)
 * Acceso: Todos los usuarios autenticados
 *
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get('/upcoming', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(ticket_validation_1.getUpcomingTicketsSchema), ticket_controller_1.getUpcomingTickets);
/**
 * GET /api/tickets/event/:eventId/stats
 * Obtener estadísticas de tickets por evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get('/event/:eventId/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC', 'STAFF'), (0, validate_middleware_1.validateRequest)(ticket_validation_1.getEventStatsSchema), ticket_controller_1.getEventTicketStats);
router.patch('/:id/public-key', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('CUSTOMER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(ticket_validation_1.registerPublicKeySchema), ticket_controller_1.registerPublicKey);
router.get('/:id/totp-secret', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('CUSTOMER', 'PAYPAC'), ticket_controller_1.getTotpSecret);
/**
 * GET /api/tickets/:id
 * Obtener un ticket específico por ID
 * Acceso: Solo el dueño del ticket
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(ticket_validation_1.getTicketByIdSchema), ticket_controller_1.getTicketById);
/**
 * POST /api/tickets/:id/transfer
 * Transferir/regalar/vender ticket
 * Acceso: Solo el dueño del ticket
 */
router.post('/:id/transfer', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(ticket_validation_1.transferTicketSchema), ticket_controller_1.transferTicket);
/**
 * POST /api/tickets/:id/validate
 * Validar ticket en la entrada del evento
 * Requiere: STAFF, STAFF_PROMOTER, ORGANIZER (del evento), PAYPAC
 */
router.post('/:id/validate', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER'), (0, validate_middleware_1.validateRequest)(ticket_validation_1.validateTicketSchema), ticket_controller_1.validateTicket);
/**
 * DELETE /api/tickets/:id
 * Cancelar ticket
 * Acceso: Dueño del ticket o PAYPAC
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(ticket_validation_1.cancelTicketSchema), ticket_controller_1.cancelTicket);
/**
 * POST /api/tickets/:id/consume
 * Registrar consumo en ticket consumible
 * Requiere: STAFF, STAFF_PROMOTER, ORGANIZER, PAYPAC
 */
router.post('/:id/consume', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER'), ticket_consumption_controller_1.registerConsumption);
/**
 * GET /api/tickets/:id/consumptions
 * Ver historial de consumos
 * Requiere: dueño del ticket o staff
 */
router.get('/:id/consumptions', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), ticket_consumption_controller_1.getConsumptionHistory);
exports.default = router;
