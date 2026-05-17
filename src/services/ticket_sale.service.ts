import { TicketSaleRepository } from '../repositories/ticket_sale.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { EventWaitingListRepository } from '../repositories/event_waiting_list.repository';
import { prisma } from '../prisma/client';
import {
  generateTicketData,
  regenerateTokenOnTransfer,
  generateTotpSecret,
} from '../utils/ticket.utils';
import { TicketSaleType } from '@prisma/client';

const saleRepo     = new TicketSaleRepository();
const ticketRepo   = new TicketRepository();
const waitingRepo  = new EventWaitingListRepository();

function getSaleExpiresAt(): Date {
  const minutes = parseInt(process.env.MAX_TIME_FAILED_SALE ?? '60', 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

export class TicketSaleService {

  // 3.2 — Publicar ticket en venta
  async createListing(ticketId: number, sellerId: number, data: {
    sale_type: TicketSaleType;
    asking_price?: number;
    min_price?: number;
  }) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new Error('Ticket no encontrado');
    if (ticket.customer_id !== sellerId) throw new Error('Solo el dueño puede vender este ticket');
    if (!['PAID', 'ACTIVE'].includes(ticket.status_ticket)) {
      throw new Error(`El ticket no está disponible para venta (estado: ${ticket.status_ticket})`);
    }
    if (ticket.ticket_first_time === 0) throw new Error('Este ticket ya fue usado');

    const existing = await saleRepo.findActiveListingByTicket(ticketId);
    if (existing) throw new Error('Este ticket ya tiene una publicación activa');

    if (data.sale_type === 'FIXED' && !data.asking_price) {
      throw new Error('Para venta a precio fijo debes indicar el precio');
    }
    if (data.sale_type === 'AUCTION' && !data.min_price) {
      throw new Error('Para subasta debes indicar el precio mínimo');
    }

    await ticketRepo.updateStatus(ticketId, 'ON_SALE');

    const listing = await saleRepo.createListing({
      ticket_id:    ticketId,
      seller_id:    sellerId,
      sale_type:    data.sale_type,
      asking_price: data.asking_price ?? null,
      min_price:    data.min_price ?? null,
      expires_at:   getSaleExpiresAt(),
    });

    // Notificar a lista de espera del evento (fire-and-forget)
    if (data.sale_type === 'AUCTION') {
      this._notifyWaitingList(ticket.event_id, listing.id).catch(
        (err) => console.error('Error notificando lista de espera:', err)
      );
    }

    return listing;
  }

  // 3.2 — Cancelar publicación y devolver ticket a ACTIVE
  async cancelListing(listingId: number, sellerId: number) {
    const listing = await saleRepo.findListingById(listingId);
    if (!listing) throw new Error('Publicación no encontrada');
    if (listing.seller_id !== sellerId) throw new Error('No tienes permiso');
    if (listing.status !== 'ACTIVE') throw new Error('Esta publicación ya no está activa');

    await ticketRepo.updateStatus(listing.ticket_id, 'ACTIVE');
    await saleRepo.updateListing(listingId, { status: 'CANCELLED' });
    return { message: 'Publicación cancelada. El ticket está disponible de nuevo.' };
  }

  // 3.2 AUCTION — Ofertar en una subasta
  async placeOffer(listingId: number, buyerId: number, amount: number) {
    const listing = await saleRepo.findListingById(listingId);
    if (!listing) throw new Error('Publicación no encontrada');
    if (listing.status !== 'ACTIVE') throw new Error('Esta publicación ya no está activa');
    if (listing.sale_type !== 'AUCTION') throw new Error('Esta publicación no es una subasta');
    if (listing.seller_id === buyerId) throw new Error('No puedes ofertar en tu propia subasta');
    if (new Date() > listing.expires_at) throw new Error('Esta subasta ha expirado');
    if (listing.min_price && amount < listing.min_price) {
      throw new Error(`La oferta debe ser al menos $${listing.min_price}`);
    }

    const existingOffer = await saleRepo.findOfferByBuyerAndListing(buyerId, listingId);
    if (existingOffer) throw new Error('Ya tienes una oferta activa en esta subasta');

    return saleRepo.createOffer({ listing_id: listingId, buyer_id: buyerId, amount });
  }

  // 3.2 AUCTION — Ver ofertas (solo montos, sin identidad del comprador)
  async getOffers(listingId: number, sellerId: number) {
    const listing = await saleRepo.findListingById(listingId);
    if (!listing) throw new Error('Publicación no encontrada');
    if (listing.seller_id !== sellerId) throw new Error('Solo el vendedor puede ver las ofertas');
    return saleRepo.findOffersByListing(listingId);
  }

  // 3.2 AUCTION — Vendedor acepta una oferta → notifica al comprador para pagar
  async acceptOffer(listingId: number, offerId: number, sellerId: number) {
    const listing = await saleRepo.findListingById(listingId);
    if (!listing) throw new Error('Publicación no encontrada');
    if (listing.seller_id !== sellerId) throw new Error('No tienes permiso');
    if (listing.status !== 'ACTIVE') throw new Error('Esta publicación ya no está activa');

    const offer = await saleRepo.findOfferById(offerId);
    if (!offer || offer.listing_id !== listingId) throw new Error('Oferta no encontrada');
    if (offer.status !== 'PENDING') throw new Error('Esta oferta ya fue procesada');

    await saleRepo.updateOfferStatus(offerId, 'ACCEPTED', new Date());
    await saleRepo.rejectOtherOffers(listingId, offerId);

    // TODO: enviar notificación push/email al comprador para que pague
    return {
      message: 'Oferta aceptada. El comprador fue notificado para completar el pago.',
      offer_id: offerId,
      amount: offer.amount,
    };
  }

  // 3.2 — Confirmar pago y transferir ticket (llama desde webhook de pago)
  async confirmSalePayment(listingId: number, buyerId: number, paidAmount: number) {
    const listing = await saleRepo.findListingById(listingId);
    if (!listing) throw new Error('Publicación no encontrada');
    if (listing.status !== 'ACTIVE') throw new Error('Esta publicación ya no está activa');

    const ticket = listing.ticket;
    const buyer  = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) throw new Error('Comprador no encontrado');

    const buyerIdPhone = buyer.customer_UUID_phone ?? '';
    const newToken = regenerateTokenOnTransfer(
      ticket.reference_ticket,
      ticket.booking_ticket,
      buyerIdPhone
    );

    await ticketRepo.updateStatus(ticket.id, 'TRANSFERRED');

    const { reference, booking } = generateTicketData(ticket.event_id, buyerId, buyerIdPhone);

    const newTicket = await ticketRepo.create({
      transaction_id:           ticket.transaction_id,
      event_id:                 ticket.event_id,
      customer_id:              buyerId,
      customer_uid:             buyer.firebase_uid ?? '',
      customer_ID_phone:        buyerIdPhone,
      reference_ticket:         reference,
      booking_ticket:           booking,
      token_ticket:             newToken,
      ticket_first_time:        1,
      ev_name:                  ticket.ev_name,
      ev_short_description:     ticket.ev_short_description,
      ev_cover:                 ticket.ev_cover,
      ev_date_event:            ticket.ev_date_event,
      ev_place_address:         ticket.ev_place_address,
      ev_event_type:            ticket.ev_event_type,
      ev_type_venue:            ticket.ev_type_venue,
      ev_organizer_id:          ticket.ev_organizer_id,
      loc_id_locality:          ticket.loc_id_locality,
      loc_name_locality:        ticket.loc_name_locality,
      loc_bkg_color:            ticket.loc_bkg_color,
      loc_title_color:          ticket.loc_title_color,
      loc_text_color:           ticket.loc_text_color,
      loc_title_color_location: ticket.loc_title_color_location,
      status_ticket:            'ACTIVE',
      ev_status:                ticket.ev_status,
      first_name_user:          buyer.name,
      last_name_user:           buyer.lastname,
      totp_secret:              generateTotpSecret(),
    });

    await saleRepo.updateListing(listingId, {
      status:     'SOLD',
      buyer_id:   buyerId,
      sold_price: paidAmount,
      sold_at:    new Date(),
    });

    return { message: 'Pago confirmado. Ticket transferido al comprador.', new_ticket: newTicket };
  }

  async getMyListings(sellerId: number) {
    return saleRepo.findListingsBySeller(sellerId);
  }

  // Revisar y expirar listings vencidos (puede llamarse desde un job o endpoint admin)
  async expireOldListings() {
    const expired = await saleRepo.findExpiredActive();
    for (const listing of expired) {
      await ticketRepo.updateStatus(listing.ticket_id, 'ACTIVE');
      await saleRepo.updateListing(listing.id, { status: 'EXPIRED' });
    }
    return expired.length;
  }

  private async _notifyWaitingList(eventId: number, listingId: number) {
    const waitingList = await waitingRepo.findByEventId(eventId);
    // TODO: integrar con servicio de notificaciones/email cuando esté disponible
    console.log(`📣 Notificando ${waitingList.length} usuarios en lista de espera del evento ${eventId} sobre listing ${listingId}`);
  }
}
