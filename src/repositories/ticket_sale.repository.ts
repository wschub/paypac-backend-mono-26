import { prisma } from '../prisma/client';
import { TicketSaleStatus, TicketSaleType, TicketOfferStatus } from '@prisma/client';

const listingInclude = {
  ticket: true,
  seller: { select: { id: true, name: true, last_name: true } },
  buyer:  { select: { id: true, name: true, last_name: true } },
  offers: {
    where: { status: 'PENDING' as TicketOfferStatus },
    select: { id: true, amount: true, createdAt: true }, // no expone buyer_id
    orderBy: { amount: 'desc' as const },
  },
} as const;

export class TicketSaleRepository {

  // ── Listings ───────────────────────────────────────────────────────────────

  async createListing(data: {
    ticket_id: number;
    seller_id: number;
    sale_type: TicketSaleType;
    asking_price?: number | null;
    min_price?: number | null;
    expires_at: Date;
  }) {
    return prisma.ticketSaleListing.create({ data, include: listingInclude });
  }

  async findListingById(id: number) {
    return prisma.ticketSaleListing.findUnique({ where: { id }, include: listingInclude });
  }

  async findActiveListingByTicket(ticketId: number) {
    return prisma.ticketSaleListing.findFirst({
      where: { ticket_id: ticketId, status: 'ACTIVE' },
    });
  }

  async findListingsBySeller(sellerId: number) {
    return prisma.ticketSaleListing.findMany({
      where: { seller_id: sellerId },
      include: listingInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateListing(id: number, data: Partial<{
    status: TicketSaleStatus;
    buyer_id: number;
    sold_price: number;
    sold_at: Date;
  }>) {
    return prisma.ticketSaleListing.update({ where: { id }, data });
  }

  async findExpiredActive() {
    return prisma.ticketSaleListing.findMany({
      where: { status: 'ACTIVE', expires_at: { lt: new Date() } },
    });
  }

  /**
   * Subastas que el comprador ganó (oferta ACCEPTED) y aún no ha pagado.
   * No filtra por expires_at del listing — esa fecha es de la fase de pujas,
   * no de la ventana de pago (que se calcula sobre notified_to_pay_at).
   */
  async findAcceptedOffersByBuyer(buyerId: number) {
    return prisma.ticketSaleOffer.findMany({
      where: { buyer_id: buyerId, status: 'ACCEPTED' },
      include: { listing: { include: { ticket: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ── Offers ─────────────────────────────────────────────────────────────────

  async createOffer(data: { listing_id: number; buyer_id: number; amount: number }) {
    return prisma.ticketSaleOffer.create({ data });
  }

  async findOfferById(id: number) {
    return prisma.ticketSaleOffer.findUnique({ where: { id } });
  }

  async findOffersByListing(listingId: number) {
    return prisma.ticketSaleOffer.findMany({
      where: { listing_id: listingId, status: 'PENDING' },
      select: { id: true, amount: true, createdAt: true }, // no expone buyer_id
      orderBy: { amount: 'desc' },
    });
  }

  async findOfferByBuyerAndListing(buyerId: number, listingId: number) {
    return prisma.ticketSaleOffer.findFirst({
      where: { buyer_id: buyerId, listing_id: listingId, status: 'PENDING' },
    });
  }

  async updateOfferStatus(id: number, status: TicketOfferStatus, notifiedAt?: Date) {
    return prisma.ticketSaleOffer.update({
      where: { id },
      data: { status, ...(notifiedAt ? { notified_to_pay_at: notifiedAt } : {}) },
    });
  }

  async rejectOtherOffers(listingId: number, acceptedOfferId: number) {
    await prisma.ticketSaleOffer.updateMany({
      where: { listing_id: listingId, status: 'PENDING', id: { not: acceptedOfferId } },
      data: { status: 'REJECTED' },
    });
  }
}
