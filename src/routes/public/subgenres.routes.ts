import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCatalogLimiter } from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validate.middleware';
import { getPublicSubgenresQuerySchema } from '../../validators/public/subgenres.validation';
import { getPublicSubgenres } from '../../controllers/public/subgenres.controller';

const router = Router();

router.get(
  '/',
  authenticatePublicWeb,
  publicCatalogLimiter,
  validateRequest(getPublicSubgenresQuerySchema),
  getPublicSubgenres
);

export default router;
