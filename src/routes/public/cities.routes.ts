import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCitiesLimiter } from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validate.middleware';
import { getPublicCitiesQuerySchema } from '../../validators/public/cities.validation';
import { getPublicCities } from '../../controllers/public/cities.controller';

const router = Router();

router.get(
  '/',
  authenticatePublicWeb,
  publicCitiesLimiter,
  validateRequest(getPublicCitiesQuerySchema),
  getPublicCities
);

export default router;
