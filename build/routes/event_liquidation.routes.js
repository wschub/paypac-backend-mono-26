"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_liquidation_controller_1 = require("../controllers/event_liquidation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const event_liquidation_validation_1 = require("../validators/event_liquidation.validation");
const router = (0, express_1.Router)();
/**
 * GET /api/liquidations/my-balance
 * Balance del ORGANIZER autenticado — ANTES de /:id
 */
router.get('/my-balance', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER'), event_liquidation_controller_1.getMyBalance);
/**
 * GET /api/liquidations
 * PAYPAC: todas | ORGANIZER: solo las suyas
 */
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), (0, validate_middleware_1.validateRequest)(event_liquidation_validation_1.liquidationQuerySchema), event_liquidation_controller_1.getLiquidations);
/**
 * POST /api/liquidations
 * Crear liquidación — PAYPAC only
 */
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(event_liquidation_validation_1.createLiquidationSchema), event_liquidation_controller_1.createLiquidation);
/**
 * GET /api/liquidations/:id
 */
router.get('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER'), (0, validate_middleware_1.validateRequest)(event_liquidation_validation_1.liquidationIdParamSchema), event_liquidation_controller_1.getLiquidationById);
/**
 * PATCH /api/liquidations/:id/status
 * Actualizar estado — PAYPAC only
 */
router.patch('/:id/status', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(event_liquidation_validation_1.updateLiquidationStatusSchema), event_liquidation_controller_1.updateLiquidationStatus);
/**
 * DELETE /api/liquidations/:id
 * PAYPAC only
 */
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), (0, validate_middleware_1.validateRequest)(event_liquidation_validation_1.liquidationIdParamSchema), event_liquidation_controller_1.deleteLiquidation);
exports.default = router;
