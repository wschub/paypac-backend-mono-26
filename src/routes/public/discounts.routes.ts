import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCatalogLimiter } from '../../middlewares/rateLimiters';
import { validatePublicCode } from '../../controllers/public/discounts.controller';

const router = Router();

/**
 * GET /api/public/discounts/validate/:code?event_id=123
 * Valida un código (descuento del organizador o código de promotor).
 * Mismo servicio unificado que usa la app en el checkout, pero para
 * visitantes web sin sesión Firebase (deep links de promotores).
 */
router.get(
  '/validate/:code',
  authenticatePublicWeb,
  publicCatalogLimiter,
  validatePublicCode
);

export default router;
