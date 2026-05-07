import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCatalogLimiter } from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validate.middleware';
import { getPublicCategoriesQuerySchema } from '../../validators/public/categories.validation';
import { getPublicCategories } from '../../controllers/public/categories.controller';

const router = Router();

router.get(
  '/',
  authenticatePublicWeb,
  publicCatalogLimiter,
  validateRequest(getPublicCategoriesQuerySchema),
  getPublicCategories
);

export default router;
