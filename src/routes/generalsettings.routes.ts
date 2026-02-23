import { Router } from 'express';
import {
  createSetting,
  getSettings,
  getSettingByName,
  getSettingById,
  updateSetting,
  deleteSetting,
} from '../controllers/generalsettings.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createSettingSchema,
  updateSettingSchema,
  getSettingByIdSchema,
  getSettingByNameSchema,
  getSettingsQuerySchema,
} from '../validators/generalsettings.validation';

const router = Router();

/**
 * Todas las rutas de este módulo son exclusivas de PAYPAC
 */

/**
 * GET /api/settings
 * Listar todas las variables (?search= opcional)
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getSettingsQuerySchema),
  getSettings
);

/**
 * GET /api/settings/by-name/:name
 * Obtener variable por su clave única (ej: MAX_TICKETS_PER_USER)
 * ⚠️ Debe ir ANTES de /:id
 */
router.get(
  '/by-name/:name',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getSettingByNameSchema),
  getSettingByName
);

/**
 * GET /api/settings/:id
 * Obtener variable por ID
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getSettingByIdSchema),
  getSettingById
);

/**
 * POST /api/settings
 * Crear nueva variable de configuración
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createSettingSchema),
  createSetting
);

/**
 * PUT /api/settings/:id
 * Actualizar variable de configuración
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateSettingSchema),
  updateSetting
);

/**
 * DELETE /api/settings/:id
 * Eliminar variable de configuración
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getSettingByIdSchema),
  deleteSetting
);

export default router;