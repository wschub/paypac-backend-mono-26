import { Router } from 'express';
import {
  getNotificationTypeConfigs,
  getNotificationTypeConfigById,
  updateNotificationTypeConfig,
} from '../controllers/notification_type_config.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  getNotificationTypeConfigByIdSchema,
  updateNotificationTypeConfigSchema,
} from '../validators/notification_type_config.validation';

const router = Router();

/**
 * Todas las rutas de este módulo son exclusivas de PAYPAC.
 * No hay create/delete: las filas están atadas al enum NotificationType
 * y se auto-siembran (syncMissingTypes) al listar.
 */

router.get('/', authenticate, authorizeRoles('PAYPAC'), getNotificationTypeConfigs);

router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getNotificationTypeConfigByIdSchema),
  getNotificationTypeConfigById
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateNotificationTypeConfigSchema),
  updateNotificationTypeConfig
);

export default router;
