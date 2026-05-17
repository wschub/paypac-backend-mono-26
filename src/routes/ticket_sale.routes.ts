import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import {
  createListing,
  cancelListing,
  getMyListings,
  placeOffer,
  getOffers,
  acceptOffer,
} from '../controllers/ticket_sale.controller';

const router = Router();

const customer = authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER');

// POST   /api/tickets/:id/sell                                    → publicar en venta (FIXED o AUCTION)
// GET    /api/ticket-sales/my-listings                            → mis publicaciones
// PATCH  /api/ticket-sales/:listingId/cancel                      → cancelar publicación
// POST   /api/ticket-sales/:listingId/offer                       → hacer oferta (solo AUCTION)
// GET    /api/ticket-sales/:listingId/offers                      → ver ofertas (solo vendedor)
// PATCH  /api/ticket-sales/:listingId/offers/:offerId/accept      → aceptar oferta

router.post('/tickets/:id/sell',                                authenticate, customer, createListing);
router.get('/ticket-sales/my-listings',                         authenticate, customer, getMyListings);
router.patch('/ticket-sales/:listingId/cancel',                 authenticate, customer, cancelListing);
router.post('/ticket-sales/:listingId/offer',                   authenticate, customer, placeOffer);
router.get('/ticket-sales/:listingId/offers',                   authenticate, customer, getOffers);
router.patch('/ticket-sales/:listingId/offers/:offerId/accept', authenticate, customer, acceptOffer);

export default router;
