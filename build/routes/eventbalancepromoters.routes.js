"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventbalancepromoters_controller_1 = require("../controllers/eventbalancepromoters.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const eventbalancepromoters_validation_1 = require("../validators/eventbalancepromoters.validation");
const router = (0, express_1.Router)();
/**
 * GET /api/events/:eventId/balances
 * Obtener todos los balances de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get('/events/:eventId/balances', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventbalancepromoters_validation_1.getBalancesByEventIdSchema), eventbalancepromoters_controller_1.getBalancesByEventId);
/**
 * GET /api/events/:eventId/balances/stats
 * Obtener estadísticas de balances del evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get('/events/:eventId/balances/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventbalancepromoters_validation_1.getBalancesByEventIdSchema), eventbalancepromoters_controller_1.getEventBalanceStats);
/**
 * POST /api/events/:eventId/balances/assign-cutoff
 * Asignar fecha de corte manualmente (normalmente es automático)
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.post('/events/:eventId/balances/assign-cutoff', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventbalancepromoters_validation_1.assignCutoffDateSchema), eventbalancepromoters_controller_1.assignCutoffDate);
/**
 * GET /api/balances/pending
 * Obtener todos los balances pendientes de pago
 * Requiere: PAYPAC
 */
router.get('/balances/pending', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), eventbalancepromoters_controller_1.getAllPendingBalances);
/**
 * GET /api/balances/promoter/:promoterId
 * Obtener extracto de un promotor específico
 * Acceso: El mismo promotor, ORGANIZER o PAYPAC
 */
router.get('/balances/promoter/:promoterId', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'PROMOTER', 'STAFF_PROMOTER'), (0, validate_middleware_1.validateRequest)(eventbalancepromoters_validation_1.getPromoterBalanceSchema), eventbalancepromoters_controller_1.getPromoterBalance);
/**
 * GET /api/promoters/my-balance
 * Obtener extracto del promotor autenticado
 * Requiere: PROMOTER o STAFF_PROMOTER
 */
router.get('/promoters/my-balance', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PROMOTER', 'STAFF_PROMOTER'), eventbalancepromoters_controller_1.getMyBalance);
/**
 * GET /api/promoters/my-balance/stats
 * Obtener estadísticas del promotor autenticado
 * Requiere: PROMOTER o STAFF_PROMOTER
 */
router.get('/promoters/my-balance/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PROMOTER', 'STAFF_PROMOTER'), eventbalancepromoters_controller_1.getMyBalanceStats);
/**
 * PATCH /api/balances/:id/mark-paid
 * Marcar un balance como pagado
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.patch('/balances/:id/mark-paid', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventbalancepromoters_validation_1.markAsPaidSchema), eventbalancepromoters_controller_1.markAsPaid);
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
router.patch('/balances/bulk-pay', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventbalancepromoters_validation_1.bulkMarkAsPaidSchema), eventbalancepromoters_controller_1.bulkMarkAsPaid);
/**
 * POST /api/balances/:id/refund
 * Crear balance de reembolso (negativo)
 * Requiere: ORGANIZER (dueño) or PAYPAC
 */
router.post('/balances/:id/refund', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventbalancepromoters_validation_1.createRefundBalanceSchema), eventbalancepromoters_controller_1.createRefundBalance);
exports.default = router;
