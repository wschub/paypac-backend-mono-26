import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  getWaitingListByEvent,
  getWaitingListByLocality,
  removeFromWaitingList,
} from '../controllers/event_waiting_list.controller';
import {
  eventIdParamSchema,
  localityIdParamSchema,
  waitingListIdParamSchema,
} from '../validators/event_waiting_list.validation';

const router = Router();

// GET /api/waiting-list/event/:eventId
router.get(
  '/event/:eventId',
  authenticate,
  validateRequest(eventIdParamSchema),
  getWaitingListByEvent
);

// GET /api/waiting-list/locality/:localityId
router.get(
  '/locality/:localityId',
  authenticate,
  validateRequest(localityIdParamSchema),
  getWaitingListByLocality
);

// DELETE /api/waiting-list/:id
router.delete(
  '/:id',
  authenticate,
  validateRequest(waitingListIdParamSchema),
  removeFromWaitingList
);

export default router;
