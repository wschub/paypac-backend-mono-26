"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// ── PAYPAC ────────────────────────────────────────────────────────────────────
/**
 * GET /api/reports/paypac/financiero
 * ?range=today|month|quarter|year|custom&from=&to=
 */
router.get('/paypac/financiero', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), reports_controller_1.getFinancialReport);
/**
 * GET /api/reports/paypac/organizadores
 * ?range=...
 */
router.get('/paypac/organizadores', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), reports_controller_1.getOrganizersReport);
/**
 * GET /api/reports/paypac/eventos
 * ?range=...
 */
router.get('/paypac/eventos', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), reports_controller_1.getEventsPortfolioReport);
/**
 * GET /api/reports/paypac/expansion
 */
router.get('/paypac/expansion', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), reports_controller_1.getExpansionReport);
/**
 * GET /api/reports/paypac/riesgo
 * ?range=...
 */
router.get('/paypac/riesgo', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), reports_controller_1.getRiskReport);
// ── ORGANIZER ─────────────────────────────────────────────────────────────────
/**
 * GET /api/reports/organizer/liquidacion
 * ?event_id=&range=...
 */
router.get('/organizer/liquidacion', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), reports_controller_1.getLiquidationReport);
/**
 * GET /api/reports/organizer/ventas
 * ?event_id=&range=...&granularity=day|hour&date=2026-03-14
 */
router.get('/organizer/ventas', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), reports_controller_1.getSalesReport);
/**
 * GET /api/reports/organizer/inteligencia
 * ?event_id=
 */
router.get('/organizer/inteligencia', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), reports_controller_1.getIntelligenceReport);
exports.default = router;
