import { Router } from 'express';
import { authenticatePublicWeb } from '../../middlewares/authenticatePublicWeb';
import { publicCatalogLimiter } from '../../middlewares/rateLimiters';
import {
  getPublicListingsByEvent,
  getPublicListingDetail,
} from '../../controllers/public/ticket_sales.controller';

const router = Router();

// GET /api/public/ticket-sales/event/:eventId → reventas activas del evento
router.get('/event/:eventId', authenticatePublicWeb, publicCatalogLimiter, getPublicListingsByEvent);

// GET /api/public/ticket-sales/:listingId → detalle de un listing
router.get('/:listingId', authenticatePublicWeb, publicCatalogLimiter, getPublicListingDetail);

export default router;
