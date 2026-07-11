"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticatePublicWeb_1 = require("../../middlewares/authenticatePublicWeb");
const rateLimiters_1 = require("../../middlewares/rateLimiters");
const discounts_controller_1 = require("../../controllers/public/discounts.controller");
const router = (0, express_1.Router)();
/**
 * GET /api/public/discounts/validate/:code?event_id=123
 * Valida un código (descuento del organizador o código de promotor).
 * Mismo servicio unificado que usa la app en el checkout, pero para
 * visitantes web sin sesión Firebase (deep links de promotores).
 */
router.get('/validate/:code', authenticatePublicWeb_1.authenticatePublicWeb, rateLimiters_1.publicCatalogLimiter, discounts_controller_1.validatePublicCode);
exports.default = router;
