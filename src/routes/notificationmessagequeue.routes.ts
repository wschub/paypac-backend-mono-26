import { Router } from 'express';
import {
  queueEmail,
  processPendingMessages,
  getMyMessages,
  getMessageById,
  retryMessage,
  deleteMessage,
  cleanOldMessages,
  getQueueStats,
} from '../controllers/notificationmessagequeue.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  queueEmailSchema,
  getMessageByIdSchema,
  retryMessageSchema,
  cleanOldMessagesSchema,
} from '../validators/notificationmessagequeue.validation';

const router = Router();

router.post(
  '/',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(queueEmailSchema),
  queueEmail
);

router.post(
  '/process',
  authenticate,
  authorizeRoles('PAYPAC'),
  processPendingMessages
);

router.post(
  '/clean-old',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(cleanOldMessagesSchema),
  cleanOldMessages
);

router.get(
  '/stats',
  authenticate,
  authorizeRoles('PAYPAC'),
  getQueueStats
);

router.get(
  '/my-messages',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getMyMessages
);

router.get(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getMessageByIdSchema),
  getMessageById
);

router.post(
  '/:id/retry',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(retryMessageSchema),
  retryMessage
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('PAYPAC'),
  validateRequest(getMessageByIdSchema),
  deleteMessage
);

export default router;