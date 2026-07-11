"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tickettransaction_controller_1 = require("../controllers/tickettransaction.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const tickettransaction_validation_1 = require("../validators/tickettransaction.validation");
const router = (0, express_1.Router)();
/**
 * GET /api/ticket-transactions/pending
 * Obtener transferencias pendientes para el usuario autenticado
 * Acceso: Todos los usuarios autenticados
 *
 * NOTA: Esta ruta debe ir ANTES de /:id para evitar conflictos
 */
router.get('/pending', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), tickettransaction_controller_1.getPendingTransactions);
/**
 * GET /api/ticket-transactions/history
 * Obtener historial completo de transacciones del usuario
 * Acceso: Todos los usuarios autenticados
 */
router.get('/history', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), tickettransaction_controller_1.getUserHistory);
/**
 * GET /api/ticket-transactions/sent
 * Obtener transacciones enviadas por el usuario
 * Acceso: Todos los usuarios autenticados
 */
router.get('/sent', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), tickettransaction_controller_1.getSentTransactions);
/**
 * GET /api/ticket-transactions/received
 * Obtener transacciones recibidas por el usuario
 * Acceso: Todos los usuarios autenticados
 */
router.get('/received', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), tickettransaction_controller_1.getReceivedTransactions);
/**
 * GET /api/ticket-transactions/count/pending
 * Contar transacciones pendientes (para notificaciones)
 * Acceso: Todos los usuarios autenticados
 */
router.get('/count/pending', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), tickettransaction_controller_1.countPendingTransactions);
/**
 * GET /api/ticket-transactions/ticket/:ticketId/history
 * Obtener historial de un ticket específico
 * Acceso: Solo el dueño del ticket
 */
router.get('/ticket/:ticketId/history', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(tickettransaction_validation_1.getTicketHistorySchema), tickettransaction_controller_1.getTicketHistory);
//transfer
// POST /api/ticket-transactions — enviar transferencia
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(tickettransaction_validation_1.sendTransferSchema), tickettransaction_controller_1.sendTransfer);
// POST /api/ticket-transactions/accept-by-contact — al registrarse busca pendientes
router.post('/accept-by-contact', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(tickettransaction_validation_1.acceptByContactSchema), tickettransaction_controller_1.acceptByContact);
/**
 * GET /api/ticket-transactions/:id
 * Obtener detalles de una transacción específica
 * Acceso: Solo usuarios involucrados en la transacción
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(tickettransaction_validation_1.getTransactionByIdSchema), tickettransaction_controller_1.getTransactionById);
/**
 * POST /api/ticket-transactions/:id/accept
 * Aceptar transferencia de ticket
 * Acceso: Solo el receptor de la transferencia
 */
router.post('/:id/accept', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(tickettransaction_validation_1.acceptTransferSchema), tickettransaction_controller_1.acceptTransfer);
/**
 * POST /api/ticket-transactions/:id/reject
 * Rechazar transferencia de ticket
 * Acceso: Solo el receptor de la transferencia
 */
router.post('/:id/reject', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(tickettransaction_validation_1.rejectTransferSchema), tickettransaction_controller_1.rejectTransfer);
/**
 * POST /api/ticket-transactions/:id/cancel
 * Cancelar transferencia pendiente
 * Acceso: Solo el remitente de la transferencia
 */
router.post('/:id/cancel', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(tickettransaction_validation_1.cancelTransferSchema), tickettransaction_controller_1.cancelTransfer);
exports.default = router;
