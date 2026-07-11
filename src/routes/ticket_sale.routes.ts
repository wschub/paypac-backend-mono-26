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
  purchaseListing,
  getListingsByEvent,
  getListingDetail,
} from '../controllers/ticket_sale.controller';

const router = Router();

const customer = authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER');

// POST   /api/tickets/:id/sell                                    → publicar en venta (FIXED o AUCTION)
// GET    /api/ticket-sales/my-listings                            → mis publicaciones
// GET    /api/ticket-sales/event/:eventId                         → listings activos de un evento
// PATCH  /api/ticket-sales/:listingId/cancel                      → cancelar publicación
// POST   /api/ticket-sales/:listingId/offer                       → hacer oferta (solo AUCTION)
// GET    /api/ticket-sales/:listingId/offers                      → ver ofertas (solo vendedor)
// PATCH  /api/ticket-sales/:listingId/offers/:offerId/accept      → aceptar oferta
// POST   /api/ticket-sales/:listingId/purchase                    → comprar (crea invoice RSL)
// GET    /api/ticket-sales/:listingId                             → detalle de un listing

router.post('/tickets/:id/sell',                                authenticate, customer, createListing);
router.get('/ticket-sales/my-listings',                         authenticate, customer, getMyListings);
router.get('/ticket-sales/event/:eventId',                      authenticate, customer, getListingsByEvent);
router.patch('/ticket-sales/:listingId/cancel',                 authenticate, customer, cancelListing);
router.post('/ticket-sales/:listingId/offer',                   authenticate, customer, placeOffer);
router.get('/ticket-sales/:listingId/offers',                   authenticate, customer, getOffers);
router.patch('/ticket-sales/:listingId/offers/:offerId/accept', authenticate, customer, acceptOffer);
router.post('/ticket-sales/:listingId/purchase',                authenticate, customer, purchaseListing);
router.get('/ticket-sales/:listingId',                          authenticate, customer, getListingDetail);

export default router;
