"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const promoter_request_controller_1 = require("../controllers/promoter_request.controller");
const router = (0, express_1.Router)();
// POST   /api/promoter-requests            → aplicar (CUSTOMER)
// GET    /api/promoter-requests/my-request → ver mi solicitud (cualquier rol)
// GET    /api/promoter-requests            → listar todas (PAYPAC)
// PATCH  /api/promoter-requests/:id/approve → aprobar (PAYPAC)
// PATCH  /api/promoter-requests/:id/reject  → rechazar (PAYPAC)
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('CUSTOMER', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER'), promoter_request_controller_1.applyToBePromoter);
router.get('/my-request', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('CUSTOMER', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER'), promoter_request_controller_1.getMyRequest);
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), promoter_request_controller_1.getAllRequests);
router.patch('/:id/approve', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), promoter_request_controller_1.approveRequest);
router.patch('/:id/reject', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC'), promoter_request_controller_1.rejectRequest);
exports.default = router;
