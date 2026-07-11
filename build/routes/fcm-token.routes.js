"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fcm_token_controller_1 = require("../controllers/fcm-token.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
/**
 * PUT /api/users/fcm-token
 * Actualizar FCM token del usuario
 */
router.put('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), fcm_token_controller_1.updateFcmToken);
/**
 * DELETE /api/users/fcm-token
 * Eliminar FCM token del usuario (logout)
 */
router.delete('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), fcm_token_controller_1.deleteFcmToken);
exports.default = router;
