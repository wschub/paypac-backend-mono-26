import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCatalogLimiter } from '../../middlewares/rateLimiters';
import { validateRequest } from '../../middlewares/validate.middleware';
import { getPublicSubcategoriesParamsSchema } from '../../validators/public/subcategories.validation';
import { getPublicSubcategories } from '../../controllers/public/subcategories.controller';

const router = Router();

router.get(
  '/by-category/:categoryId',
  authenticatePublicWeb,
  publicCatalogLimiter,
  validateRequest(getPublicSubcategoriesParamsSchema),
  getPublicSubcategories
);

export default router;
