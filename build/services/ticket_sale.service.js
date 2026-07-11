"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketSaleService = void 0;
const ticket_sale_repository_1 = require("../repositories/ticket_sale.repository");
const ticket_repository_1 = require("../repositories/ticket.repository");
const event_waiting_list_repository_1 = require("../repositories/event_waiting_list.repository");
const client_1 = require("../prisma/client");
const ticket_utils_1 = require("../utils/ticket.utils");
const saleRepo = new ticket_sale_repository_1.TicketSaleRepository();
const ticketRepo = new ticket_repository_1.TicketRepository();
const waitingRepo = new event_waiting_list_repository_1.EventWaitingListRepository();
function getSaleExpiresAt() {
    var _a;
    const minutes = parseInt((_a = process.env.MAX_TIME_FAILED_SALE) !== null && _a !== void 0 ? _a : '60', 10);
    return new Date(Date.now() + minutes * 60 * 1000);
}
class TicketSaleService {
    // 3.2 — Publicar ticket en venta
    createListing(ticketId, sellerId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const ticket = yield ticketRepo.findById(ticketId);
            if (!ticket)
                throw new Error('Ticket no encontrado');
            if (ticket.customer_id !== sellerId)
                throw new Error('Solo el dueño puede vender este ticket');
            if (!['PAID', 'ACTIVE'].includes(ticket.status_ticket)) {
                throw new Error(`El ticket no está disponible para venta (estado: ${ticket.status_ticket})`);
            }
            if (ticket.ticket_first_time === 0)
                throw new Error('Este ticket ya fue usado');
            const existing = yield saleRepo.findActiveListingByTicket(ticketId);
            if (existing)
                throw new Error('Este ticket ya tiene una publicación activa');
            if (data.sale_type === 'FIXED' && !data.asking_price) {
                throw new Error('Para venta a precio fijo debes indicar el precio');
            }
            if (data.sale_type === 'AUCTION' && !data.min_price) {
                throw new Error('Para subasta debes indicar el precio mínimo');
            }
            yield ticketRepo.updateStatus(ticketId, 'ON_SALE');
            const listing = yield saleRepo.createListing({
                ticket_id: ticketId,
                seller_id: sellerId,
                sale_type: data.sale_type,
                asking_price: (_a = data.asking_price) !== null && _a !== void 0 ? _a : null,
                min_price: (_b = data.min_price) !== null && _b !== void 0 ? _b : null,
                expires_at: getSaleExpiresAt(),
            });
            // Notificar a lista de espera del evento (fire-and-forget)
            if (data.sale_type === 'AUCTION') {
                this._notifyWaitingList(ticket.event_id, listing.id).catch((err) => console.error('Error notificando lista de espera:', err));
            }
            return listing;
        });
    }
    // 3.2 — Cancelar publicación y devolver ticket a ACTIVE
    cancelListing(listingId, sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const listing = yield saleRepo.findListingById(listingId);
            if (!listing)
                throw new Error('Publicación no encontrada');
            if (listing.seller_id !== sellerId)
                throw new Error('No tienes permiso');
            if (listing.status !== 'ACTIVE')
                throw new Error('Esta publicación ya no está activa');
            yield ticketRepo.updateStatus(listing.ticket_id, 'ACTIVE');
            yield saleRepo.updateListing(listingId, { status: 'CANCELLED' });
            return { message: 'Publicación cancelada. El ticket está disponible de nuevo.' };
        });
    }
    // 3.2 AUCTION — Ofertar en una subasta
    placeOffer(listingId, buyerId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const listing = yield saleRepo.findListingById(listingId);
            if (!listing)
                throw new Error('Publicación no encontrada');
            if (listing.status !== 'ACTIVE')
                throw new Error('Esta publicación ya no está activa');
            if (listing.sale_type !== 'AUCTION')
                throw new Error('Esta publicación no es una subasta');
            if (listing.seller_id === buyerId)
                throw new Error('No puedes ofertar en tu propia subasta');
            if (new Date() > listing.expires_at)
                throw new Error('Esta subasta ha expirado');
            if (listing.min_price && amount < listing.min_price) {
                throw new Error(`La oferta debe ser al menos $${listing.min_price}`);
            }
            const existingOffer = yield saleRepo.findOfferByBuyerAndListing(buyerId, listingId);
            if (existingOffer)
                throw new Error('Ya tienes una oferta activa en esta subasta');
            return saleRepo.createOffer({ listing_id: listingId, buyer_id: buyerId, amount });
        });
    }
    // 3.2 AUCTION — Ver ofertas (solo montos, sin identidad del comprador)
    getOffers(listingId, sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const listing = yield saleRepo.findListingById(listingId);
            if (!listing)
                throw new Error('Publicación no encontrada');
            if (listing.seller_id !== sellerId)
                throw new Error('Solo el vendedor puede ver las ofertas');
            return saleRepo.findOffersByListing(listingId);
        });
    }
    // 3.2 AUCTION — Vendedor acepta una oferta → notifica al comprador para pagar
    acceptOffer(listingId, offerId, sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const listing = yield saleRepo.findListingById(listingId);
            if (!listing)
                throw new Error('Publicación no encontrada');
            if (listing.seller_id !== sellerId)
                throw new Error('No tienes permiso');
            if (listing.status !== 'ACTIVE')
                throw new Error('Esta publicación ya no está activa');
            const offer = yield saleRepo.findOfferById(offerId);
            if (!offer || offer.listing_id !== listingId)
                throw new Error('Oferta no encontrada');
            if (offer.status !== 'PENDING')
                throw new Error('Esta oferta ya fue procesada');
            yield saleRepo.updateOfferStatus(offerId, 'ACCEPTED', new Date());
            yield saleRepo.rejectOtherOffers(listingId, offerId);
            // TODO: enviar notificación push/email al comprador para que pague
            return {
                message: 'Oferta aceptada. El comprador fue notificado para completar el pago.',
                offer_id: offerId,
                amount: offer.amount,
            };
        });
    }
    // 3.2 — Confirmar pago y transferir ticket (llama desde webhook de pago)
    confirmSalePayment(listingId, buyerId, paidAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const listing = yield saleRepo.findListingById(listingId);
            if (!listing)
                throw new Error('Publicación no encontrada');
            if (listing.status !== 'ACTIVE')
                throw new Error('Esta publicación ya no está activa');
            const ticket = listing.ticket;
            const buyer = yield client_1.prisma.user.findUnique({ where: { id: buyerId } });
            if (!buyer)
                throw new Error('Comprador no encontrado');
            const buyerIdPhone = (_a = buyer.firebase_uid) !== null && _a !== void 0 ? _a : '';
            const newToken = (0, ticket_utils_1.regenerateTokenOnTransfer)(ticket.reference_ticket, ticket.booking_ticket, buyerIdPhone);
            yield ticketRepo.updateStatus(ticket.id, 'TRANSFERRED');
            const { reference_ticket, booking_ticket } = (0, ticket_utils_1.generateTicketData)(buyerIdPhone);
            const newTicket = yield ticketRepo.create({
                transaction_id: ticket.transaction_id,
                event_id: ticket.event_id,
                customer_id: buyerId,
                customer_uid: (_b = buyer.firebase_uid) !== null && _b !== void 0 ? _b : '',
                customer_ID_phone: buyerIdPhone,
                reference_ticket: reference_ticket,
                booking_ticket: booking_ticket,
                token_ticket: newToken,
                ticket_first_time: 1,
                ev_name: ticket.ev_name,
                ev_short_description: ticket.ev_short_description,
                ev_cover: ticket.ev_cover,
                ev_date_event: ticket.ev_date_event,
                ev_place_address: ticket.ev_place_address,
                ev_event_type: ticket.ev_event_type,
                ev_type_venue: ticket.ev_type_venue,
                ev_organizer_id: ticket.ev_organizer_id,
                loc_id_locality: ticket.loc_id_locality,
                loc_name_locality: ticket.loc_name_locality,
                loc_bkg_color: ticket.loc_bkg_color,
                loc_title_color: ticket.loc_title_color,
                loc_text_color: ticket.loc_text_color,
                loc_title_color_location: ticket.loc_title_color_location,
                status_ticket: 'ACTIVE',
                ev_status: ticket.ev_status,
                first_name_user: buyer.name,
                last_name_user: buyer.last_name,
                totp_secret: (0, ticket_utils_1.generateTotpSecret)(),
            });
            yield saleRepo.updateListing(listingId, {
                status: 'SOLD',
                buyer_id: buyerId,
                sold_price: paidAmount,
                sold_at: new Date(),
            });
            return { message: 'Pago confirmado. Ticket transferido al comprador.', new_ticket: newTicket };
        });
    }
    getMyListings(sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return saleRepo.findListingsBySeller(sellerId);
        });
    }
    // Revisar y expirar listings vencidos (puede llamarse desde un job o endpoint admin)
    expireOldListings() {
        return __awaiter(this, void 0, void 0, function* () {
            const expired = yield saleRepo.findExpiredActive();
            for (const listing of expired) {
                yield ticketRepo.updateStatus(listing.ticket_id, 'ACTIVE');
                yield saleRepo.updateListing(listing.id, { status: 'EXPIRED' });
            }
            return expired.length;
        });
    }
    _notifyWaitingList(eventId, listingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const waitingList = yield waitingRepo.findByEventId(eventId);
            // TODO: integrar con servicio de notificaciones/email cuando esté disponible
            console.log(`📣 Notificando ${waitingList.length} usuarios en lista de espera del evento ${eventId} sobre listing ${listingId}`);
        });
    }
}
exports.TicketSaleService = TicketSaleService;
