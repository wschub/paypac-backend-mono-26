import { Router } from 'express';
import {
  queueEmail,
  processPendingMessages,
  getMessages,
  getQueueStats,
  getMyMessages,
  getMessageById,
  retryMessage,
  deleteMessage,
  cleanOldMessages,
} from '../controllers/notificationmessagequeue.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  queueEmailSchema,
  getMessageByIdSchema,
  getMessagesQuerySchema,
  retryMessageSchema,
  cleanOldMessagesSchema,
} from '../validators/notificationmessagequeue.validation';

const router = Router();

/**
 * POST /api/email-queue
 * Encolar un nuevo email para envío
 * Acceso: Todos los roles autenticados
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(queueEmailSchema),
  queueEmail
);

/**
 * POST /api/email-queue/process
 * Procesar mensajes pendientes manualmente
 * Requiere: PAYPAC
 * NOTA: Normalmente el CRON job hace esto automáticamente
 */
router.post(
  '/process',
  authenticate,
  authorizeRoles('PAYPAC'),
  processPendingMessages
);

/**
 * POST /api/email-queue/clean-old
 * Limpiar mensajes antiguos (enviados hace más de X días)
 * Requiere: PAYPAC
 */
router.post(
  '/clean-old',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(cleanOldMessagesSchema),
  cleanOldMessages
);

/**
 * GET /api/email-queue
 * Listar mensajes de la cola
 * Acceso: PAYPAC (todos), usuarios (solo sus mensajes)
 * 
 * Query params opcionales:
 * - status: 0 (Pendiente) | 1 (Enviado) | 2 (Fallido)
 * - user_id: number (solo PAYPAC)
 * - template_id: number
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getMessagesQuerySchema),
  getMessages
);

/**
 * GET /api/email-queue/stats
 * Obtener estadísticas de la cola
 * Requiere: PAYPAC
 */
router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  getQueueStats
);

/**
 * GET /api/email-queue/my-messages
 * Obtener mensajes del usuario autenticado
 * Acceso: Todos los roles
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.get(
  '/my-messages',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getMyMessages
);

/**
 * GET /api/email-queue/:id
 * Obtener mensaje por ID
 * Acceso: PAYPAC (cualquier mensaje), usuarios (solo sus mensajes)
 */
router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getMessageByIdSchema),
  getMessageById
);

/**
 * POST /api/email-queue/:id/retry
 * Reintentar envío de mensaje fallido
 * Requiere: PAYPAC
 */
router.post(
  '/:id/retry',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(retryMessageSchema),
  retryMessage
);

/**
 * DELETE /api/email-queue/:id
 * Eliminar mensaje
 * Requiere: PAYPAC
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getMessageByIdSchema),
  deleteMessage
);

export default router;