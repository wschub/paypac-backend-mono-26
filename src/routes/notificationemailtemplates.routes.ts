import { Router } from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplateStats,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from '../controllers/notificationemailtemplates.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
  getEmailTemplateByIdSchema,
  getEmailTemplatesByTypeSchema,
} from '../validators/notificationemailtemplates.validation';

const router = Router();

/**
 * POST /api/email-templates
 * Crear un nuevo template
 * Requiere: PAYPAC
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(createEmailTemplateSchema),
  createTemplate
);

/**
 * GET /api/email-templates
 * Listar todos los templates (con filtros opcionales)
 * Acceso: PAYPAC, ORGANIZER
 * 
 * Query params opcionales:
 * - template_type: REGISTRATION | PASSWORD_RESET | EVENT_NOTIFICATION | TRANSACTION | PROMOTER_UPDATE | MARKETING
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  validateRequest(getEmailTemplatesByTypeSchema),
  getTemplates
);

/**
 * GET /api/email-templates/stats
 * Obtener estadísticas de templates
 * Requiere: PAYPAC
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  getTemplateStats
);

/**
 * GET /api/email-templates/:id
 * Obtener template por ID
 * Acceso: PAYPAC, ORGANIZER
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER'),
  validateRequest(getEmailTemplateByIdSchema),
  getTemplateById
);

/**
 * PUT /api/email-templates/:id
 * Actualizar template
 * Requiere: PAYPAC
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(updateEmailTemplateSchema),
  updateTemplate
);

/**
 * DELETE /api/email-templates/:id
 * Eliminar template
 * Requiere: PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getEmailTemplateByIdSchema),
  deleteTemplate
);

export default router;