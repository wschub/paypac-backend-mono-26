import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { updatePreferenceSchema, getNotificationsSchema } from '../validators/notifications.validation';

const router = Router();
const notificationsController = new NotificationsController();

router.use(authenticate);
router.use(authorizeRoles('CUSTOMER'));

router.get('/preferences', notificationsController.getPreferences.bind(notificationsController));
router.patch('/preferences', validateRequest(updatePreferenceSchema), notificationsController.updatePreference.bind(notificationsController));

// IMPORTANTE: /read-all debe ir ANTES de /:id/read para evitar conflicto de rutas
router.patch('/read-all', notificationsController.markAllAsRead.bind(notificationsController));

router.get('/', validateRequest(getNotificationsSchema), notificationsController.getNotifications.bind(notificationsController));
router.patch('/:id/read', notificationsController.markAsRead.bind(notificationsController));

export default router;
