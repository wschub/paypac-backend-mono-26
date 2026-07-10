import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  getWaitingListByEvent,
  getWaitingListByLocality,
  removeFromWaitingList,
  registerWaitingListAuthenticated,
} from '../controllers/event_waiting_list.controller';
import {
  eventIdParamSchema,
  localityIdParamSchema,
  waitingListIdParamSchema,
  registerWaitingListAuthSchema,
} from '../validators/event_waiting_list.validation';

const router = Router();

// POST /api/waiting-list — registro desde la app (usuario autenticado)
router.post(
  '/',
  authenticate,
  validateRequest(registerWaitingListAuthSchema),
  registerWaitingListAuthenticated
);

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
