"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_controller_1 = require("../controllers/notifications.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const notifications_validation_1 = require("../validators/notifications.validation");
const router = (0, express_1.Router)();
const notificationsController = new notifications_controller_1.NotificationsController();
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.authorizeRoles)('CUSTOMER'));
router.get('/preferences', notificationsController.getPreferences.bind(notificationsController));
router.patch('/preferences', (0, validate_middleware_1.validateRequest)(notifications_validation_1.updatePreferenceSchema), notificationsController.updatePreference.bind(notificationsController));
// IMPORTANTE: /read-all debe ir ANTES de /:id/read para evitar conflicto de rutas
router.patch('/read-all', notificationsController.markAllAsRead.bind(notificationsController));
router.get('/', (0, validate_middleware_1.validateRequest)(notifications_validation_1.getNotificationsSchema), notificationsController.getNotifications.bind(notificationsController));
router.patch('/:id/read', notificationsController.markAsRead.bind(notificationsController));
exports.default = router;
