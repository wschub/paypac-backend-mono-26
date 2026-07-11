"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
router.get('/organizer/app', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER'), dashboard_controller_1.getOrganizerAppDashboard);
/**
 * GET /api/dashboard/paypac
 * Dashboard PAYPAC — snapshot del mes actual
 */
router.get('/paypac', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), dashboard_controller_1.getPaypacDashboard);
/**
 * GET /api/dashboard/organizer
 * Dashboard ORGANIZER — snapshot del mes actual, filtrado por su empresa
 */
router.get('/organizer', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER'), dashboard_controller_1.getOrganizerDashboard);
exports.default = router;
