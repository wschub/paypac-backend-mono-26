import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { validateRequest } from '../../middlewares/validateRequest';
import { registerWaitingList } from '../../controllers/public/event_waiting_list.controller';
import { registerWaitingListSchema } from '../../validators/event_waiting_list.validation';

const router = Router();

// POST /api/public/waiting-list
router.post(
  '/',
  authenticatePublicWeb,
  validateRequest(registerWaitingListSchema),
  registerWaitingList
);

export default router;
