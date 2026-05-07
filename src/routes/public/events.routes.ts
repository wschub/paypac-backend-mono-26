import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import {
  publicEventsLimiter,
  publicEventDetailLimiter,
  publicLocalitiesLimiter,
  publicViewLimiter,
  publicViewUpdateLimiter,
} from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  getPublicEventsQuerySchema,
  getPublicEventByIdParamsSchema,
  getPublicLocalitiesParamsSchema,
} from '../../validators/public/events.validation';
import {
  createEventViewSchema,
  updateEventViewSchema,
} from '../../validators/public/eventViews.validation';
import { getPublicEvents, getPublicEventById } from '../../controllers/public/events.controller';
import { getPublicLocalities } from '../../controllers/public/localities.controller';
import { createEventView, updateEventViewDuration } from '../../controllers/public/eventViews.controller';

const router = Router();

router.get(
  '/',
  authenticatePublicWeb,
  publicEventsLimiter,
  validateRequest(getPublicEventsQuerySchema),
  getPublicEvents
);

router.get(
  '/:id',
  authenticatePublicWeb,
  publicEventDetailLimiter,
  validateRequest(getPublicEventByIdParamsSchema),
  getPublicEventById
);

router.get(
  '/:eventId/localities',
  authenticatePublicWeb,
  publicLocalitiesLimiter,
  validateRequest(getPublicLocalitiesParamsSchema),
  getPublicLocalities
);

router.post(
  '/:id/view',
  authenticatePublicWeb,
  publicViewLimiter,
  validateRequest(createEventViewSchema),
  createEventView
);

router.patch(
  '/:id/view/:sessionToken',
  authenticatePublicWeb,
  publicViewUpdateLimiter,
  validateRequest(updateEventViewSchema),
  updateEventViewDuration
);

export default router;
