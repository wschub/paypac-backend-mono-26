"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventrewardrules_controller_1 = require("../controllers/eventrewardrules.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const eventrewardrules_validation_1 = require("../validators/eventrewardrules.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/events/:eventId/reward-rules
 * Crear una nueva regla de recompensa para un evento
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.post('/events/:eventId/reward-rules', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventrewardrules_validation_1.createRewardRuleSchema), eventrewardrules_controller_1.createRewardRule);
/**
 * GET /api/events/:eventId/reward-rules
 * Obtener todas las reglas de recompensa de un evento
 * Acceso: Todos los roles autenticados
 */
router.get('/events/:eventId/reward-rules', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventrewardrules_validation_1.getRewardRulesByEventIdSchema), eventrewardrules_controller_1.getRewardRulesByEventId);
/**
 * POST /api/reward-rules/calculate
 * Calcular recompensa para una venta
 * Acceso: Todos los roles autenticados (útil para testing)
 *
 * Body:
 * - event_id: number
 * - quantity: number
 * - total_amount: number
 * - locality_id?: number
 */
router.post('/reward-rules/calculate', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'), (0, validate_middleware_1.validateRequest)(eventrewardrules_validation_1.calculateRewardSchema), eventrewardrules_controller_1.calculateReward);
/**
 * GET /api/discounts/validate/:code?event_id=123
 * Valida si un código es descuento u promotor y retorna sus reglas
 * Acceso: CUSTOMER + todos los roles autenticados
 * ⚠️ Antes de /:id
 */
router.get('/discounts/validate/:code', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventrewardrules_validation_1.validateCodeSchema), eventrewardrules_controller_1.validateCode);
/**
 * GET /api/reward-rules/:id
 * Obtener una regla específica por ID
 * Acceso: Todos los roles autenticados
 */
router.get('/reward-rules/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventrewardrules_validation_1.getRewardRuleByIdSchema), eventrewardrules_controller_1.getRewardRuleById);
/**
 * PUT /api/reward-rules/:id
 * Actualizar una regla de recompensa
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.put('/reward-rules/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventrewardrules_validation_1.updateRewardRuleSchema), eventrewardrules_controller_1.updateRewardRule);
/**
 * DELETE /api/reward-rules/:id
 * Eliminar una regla de recompensa
 * Requiere: ORGANIZER (dueño del evento) o PAYPAC
 */
router.delete('/reward-rules/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventrewardrules_validation_1.getRewardRuleByIdSchema), eventrewardrules_controller_1.deleteRewardRule);
exports.default = router;
