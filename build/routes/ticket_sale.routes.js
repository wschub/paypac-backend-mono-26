"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const ticket_sale_controller_1 = require("../controllers/ticket_sale.controller");
const router = (0, express_1.Router)();
const customer = (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER');
// POST   /api/tickets/:id/sell                                    → publicar en venta (FIXED o AUCTION)
// GET    /api/ticket-sales/my-listings                            → mis publicaciones
// PATCH  /api/ticket-sales/:listingId/cancel                      → cancelar publicación
// POST   /api/ticket-sales/:listingId/offer                       → hacer oferta (solo AUCTION)
// GET    /api/ticket-sales/:listingId/offers                      → ver ofertas (solo vendedor)
// PATCH  /api/ticket-sales/:listingId/offers/:offerId/accept      → aceptar oferta
router.post('/tickets/:id/sell', auth_middleware_1.authenticate, customer, ticket_sale_controller_1.createListing);
router.get('/ticket-sales/my-listings', auth_middleware_1.authenticate, customer, ticket_sale_controller_1.getMyListings);
router.patch('/ticket-sales/:listingId/cancel', auth_middleware_1.authenticate, customer, ticket_sale_controller_1.cancelListing);
router.post('/ticket-sales/:listingId/offer', auth_middleware_1.authenticate, customer, ticket_sale_controller_1.placeOffer);
router.get('/ticket-sales/:listingId/offers', auth_middleware_1.authenticate, customer, ticket_sale_controller_1.getOffers);
router.patch('/ticket-sales/:listingId/offers/:offerId/accept', auth_middleware_1.authenticate, customer, ticket_sale_controller_1.acceptOffer);
exports.default = router;
