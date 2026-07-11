import { TicketSaleRepository } from '../repositories/ticket_sale.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { EventWaitingListRepository } from '../repositories/event_waiting_list.repository';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { NotificationMessageQueueService } from './notificationmessagequeue.service';
import { PushNotificationService } from './push-notification.service';
import { BrevoService } from './brevo.service';
import { EMAIL_TEMPLATES } from '../templates/email-templates';
import { RESALE_COMMISSION_PCT, RESALE_PAYMENT_WINDOW_MIN } from '../config/constants';
import { prisma } from '../prisma/client';
import { generateTicketData } from '../utils/ticket.utils';
import { TicketSaleType, InvoiceStatus, TicketStatus } from '@prisma/client';

const saleRepo     = new TicketSaleRepository();
const ticketRepo   = new TicketRepository();
const waitingRepo  = new EventWaitingListRepository();
const invoiceRepo  = new InvoiceRepository();
const emailService = new NotificationMessageQueueService();
const pushService  = new PushNotificationService();
const brevoService = new BrevoService();

function getSaleExpiresAt(): Date {
  const minutes = parseInt(process.env.MAX_TIME_FAILED_SALE ?? '60', 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

/** Fin de la ventana de pago del ganador de una subasta */
function getPaymentDeadline(notifiedAt: Date): Date {
  return new Date(notifiedAt.getTime() + RESALE_PAYMENT_WINDOW_MIN * 60 * 1000);
}

export class TicketSaleService {

  // 3.2 — Publicar ticket en venta
  async createListing(ticketId: number, sellerId: number, data: {
    sale_type: TicketSaleType;
    asking_price?: number;
    min_price?: number;
    // Datos de dispersión (obligatorios si el usuario no los tiene registrados)
    bank_name?: string;
    bank_account?: string;
    breb_key?: string;
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

    // ── Datos bancarios para la dispersión ─────────────────────────
    // Si vienen en el body, se guardan/actualizan en el usuario.
    // Requisito: tener llave Bre-B, o banco + cuenta.
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { bank_name: true, bank_account: true, breb_key: true },
    });
    if (!seller) throw new Error('Usuario no encontrado');

    const bankUpdate: Record<string, string> = {};
    if (data.bank_name?.trim())    bankUpdate.bank_name = data.bank_name.trim();
    if (data.bank_account?.trim()) bankUpdate.bank_account = data.bank_account.trim();
    if (data.breb_key?.trim())     bankUpdate.breb_key = data.breb_key.trim();
    if (Object.keys(bankUpdate).length > 0) {
      await prisma.user.update({ where: { id: sellerId }, data: bankUpdate });
    }

    const finalBrebKey  = bankUpdate.breb_key ?? seller.breb_key;
    const finalBank     = bankUpdate.bank_name ?? seller.bank_name;
    const finalAccount  = bankUpdate.bank_account ?? seller.bank_account;
    if (!finalBrebKey && !(finalBank && finalAccount)) {
      throw new Error('Para vender necesitas registrar tus datos de dispersión: llave Bre-B, o banco/billetera y número de cuenta');
    }

    // Atómico: si el create del listing falla, el ticket NO queda en ON_SALE
    const [, listing] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id: ticketId },
        data: { status_ticket: TicketStatus.ON_SALE },
      }),
      prisma.ticketSaleListing.create({
        data: {
          ticket_id:    ticketId,
          seller_id:    sellerId,
          sale_type:    data.sale_type,
          asking_price: data.asking_price ?? null,
          min_price:    data.min_price ?? null,
          expires_at:   getSaleExpiresAt(),
        },
        include: { ticket: true },
      }),
    ]);

    // Notificar a la lista de espera del evento — siempre (FIXED y AUCTION)
    this._notifyWaitingList(ticket.event_id, listing.id, ticket.ev_name, ticket.loc_name_locality, data.sale_type).catch(
      (err) => console.error('Error notificando lista de espera:', err)
    );

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

    const offer = await saleRepo.createOffer({ listing_id: listingId, buyer_id: buyerId, amount });

    // 🔔 Sockets en vivo: al vendedor y a quienes miran la subasta (solo monto, sin identidad)
    try {
      const { io } = await import('../index');
      const payload = {
        listing_id: listingId,
        offer_id:   offer.id,
        amount,
        timestamp:  new Date().toISOString(),
      };
      io.to(`user:${listing.seller_id}`).emit('listing:offer:new', payload);
      io.to(`listing:${listingId}`).emit('listing:offer:new', payload);
    } catch (e: any) {
      console.error('⚠️ Socket oferta nueva:', e.message);
    }

    return offer;
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

    // Si había otra oferta ACCEPTED con ventana vencida, expirarla (lazy)
    const prevAccepted = await prisma.ticketSaleOffer.findFirst({
      where: { listing_id: listingId, status: 'ACCEPTED', id: { not: offerId } },
    });
    if (prevAccepted) {
      const deadline = getPaymentDeadline(prevAccepted.notified_to_pay_at ?? prevAccepted.updatedAt);
      if (new Date() > deadline) {
        await saleRepo.updateOfferStatus(prevAccepted.id, 'EXPIRED');
      } else {
        throw new Error('Ya hay una oferta aceptada con ventana de pago vigente');
      }
    }

    const notifiedAt = new Date();
    await saleRepo.updateOfferStatus(offerId, 'ACCEPTED', notifiedAt);
    await saleRepo.rejectOtherOffers(listingId, offerId);

    const paymentDeadline = getPaymentDeadline(notifiedAt);

    // 🔔 Notificar al ganador: socket + push — tiene RESALE_PAYMENT_WINDOW_MIN para pagar
    const notifyWinner = async () => {
      const winner = await prisma.user.findUnique({
        where: { id: offer.buyer_id },
        select: { fcm_token: true },
      });

      try {
        const { io } = await import('../index');
        io.to(`user:${offer.buyer_id}`).emit('listing:offer:accepted', {
          listing_id:       listingId,
          offer_id:         offerId,
          amount:           offer.amount,
          event_name:       listing.ticket.ev_name,
          payment_deadline: paymentDeadline.toISOString(),
          window_minutes:   RESALE_PAYMENT_WINDOW_MIN,
          timestamp:        new Date().toISOString(),
        });
        // A los espectadores: la subasta cerró ofertas
        io.to(`listing:${listingId}`).emit('listing:offer:accepted', {
          listing_id: listingId,
          timestamp:  new Date().toISOString(),
        });
      } catch (e: any) {
        console.error('⚠️ Socket oferta aceptada:', e.message);
      }

      if (winner?.fcm_token) {
        await pushService.sendResaleOfferAcceptedNotification(winner.fcm_token, {
          eventName:     listing.ticket.ev_name,
          amount:        offer.amount,
          listingId,
          windowMinutes: RESALE_PAYMENT_WINDOW_MIN,
        }).catch(() => null);
      }
    };
    notifyWinner().catch((e) => console.error('⚠️ Error notificando ganador:', e.message));

    return {
      message: `Oferta aceptada. El comprador tiene ${RESALE_PAYMENT_WINDOW_MIN} minutos para pagar.`,
      offer_id: offerId,
      amount: offer.amount,
      payment_deadline: paymentDeadline.toISOString(),
    };
  }

  /**
   * Comprar un listing — crea la Invoice de reventa (num_invoice RSL-...).
   * El comprador paga con los rieles existentes: POST /api/transactions/process
   * con el invoice_id retornado; el webhook Wompi detecta el prefijo RSL y
   * llama confirmSalePayment.
   *
   * - FIXED:   cualquier usuario (≠ vendedor) mientras el listing esté ACTIVE
   * - AUCTION: solo el ganador (oferta ACCEPTED) dentro de la ventana de pago
   */
  async purchaseListing(listingId: number, buyerId: number, data: {
    payment_method: string;
    sale_channel?: 'WEB' | 'APP';
    user_num_doc?: string;
    user_type_doc?: string;
  }) {
    const listing = await saleRepo.findListingById(listingId);
    if (!listing) throw new Error('Publicación no encontrada');
    if (listing.status !== 'ACTIVE') throw new Error('Esta publicación ya no está activa');
    if (listing.seller_id === buyerId) throw new Error('No puedes comprar tu propio ticket');

    let price: number;

    if (listing.sale_type === 'FIXED') {
      if (new Date() > listing.expires_at) throw new Error('Esta publicación ha expirado');
      if (!listing.asking_price) throw new Error('La publicación no tiene precio definido');
      price = listing.asking_price;
    } else {
      // AUCTION — solo el ganador, dentro de la ventana de pago
      const offer = await prisma.ticketSaleOffer.findFirst({
        where: { listing_id: listingId, buyer_id: buyerId, status: 'ACCEPTED' },
      });
      if (!offer) throw new Error('No tienes una oferta aceptada en esta subasta');

      const deadline = getPaymentDeadline(offer.notified_to_pay_at ?? offer.updatedAt);
      if (new Date() > deadline) {
        await saleRepo.updateOfferStatus(offer.id, 'EXPIRED');
        throw new Error('Tu ventana de pago expiró. El vendedor puede aceptar otra oferta.');
      }
      price = offer.amount;
    }

    // Evitar doble invoice activa para el mismo listing/comprador
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        resale_listing_id: listingId,
        user_id: buyerId,
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PROCESSING, InvoiceStatus.PENDING] },
      },
    });
    if (existingInvoice) return { invoice: existingInvoice, price };

    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) throw new Error('Comprador no encontrado');

    // Documento (mismo criterio del checkout normal)
    let finalNumDoc  = buyer.num_doc || data.user_num_doc || '';
    let finalTypeDoc = (buyer.type_doc as any) || data.user_type_doc || 'CC';
    if (!buyer.num_doc && data.user_num_doc) {
      await prisma.user.update({
        where: { id: buyerId },
        data: { num_doc: data.user_num_doc, type_doc: (data.user_type_doc as any) ?? 'CC' },
      });
    }
    if (!finalNumDoc) throw new Error('Se requiere número de documento para completar la compra');

    const numInvoice = `RSL-${await invoiceRepo.generateInvoiceNumber()}`;

    const invoice = await invoiceRepo.create({
      user_id:           buyerId,
      user_uid:          buyer.firebase_uid || '',
      num_invoice:       numInvoice,
      user_name:         buyer.name,
      user_lastname:     buyer.last_name,
      user_num_doc:      finalNumDoc,
      user_type_doc:     finalTypeDoc,
      payment_method:    data.payment_method,
      sale_channel:      data.sale_channel ?? 'APP',
      num_items:         1,
      event_id:          listing.ticket.event_id,
      total_ticket_regular: price,
      total:             price,
      status:            InvoiceStatus.ISSUED,
      resale_listing_id: listingId,
      resale_type:       listing.sale_type,
    });

    console.log(`🎟️ Invoice de reventa creada: ${numInvoice} (listing ${listingId}, ${listing.sale_type}, $${price})`);

    return { invoice, price };
  }

  /**
   * 3.2 — Confirmar pago y transferir ticket (lo llama el webhook de pago).
   * Traspaso atómico (mismo patrón de transferencias): ticket original →
   * TRANSFERRED + ticket nuevo con credenciales frescas para el comprador.
   * Calcula la comisión de reventa y notifica a ambos (socket + push + email).
   */
  async confirmSalePayment(listingId: number, buyerId: number, paidAmount: number) {
    const listing = await saleRepo.findListingById(listingId);
    if (!listing) throw new Error('Publicación no encontrada');
    if (listing.status === 'SOLD') {
      console.log(`ℹ️ Listing ${listingId} ya estaba SOLD — webhook duplicado, ignorado`);
      return { message: 'Venta ya confirmada', new_ticket: null };
    }
    if (listing.status !== 'ACTIVE') throw new Error('Esta publicación ya no está activa');

    const ticket = listing.ticket;
    const buyer  = await prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) throw new Error('Comprador no encontrado');

    // Comisión PayPac (opción B: se descuenta al vendedor)
    const resaleCommission = Math.round(paidAmount * RESALE_COMMISSION_PCT / 100);

    const newTicketData = generateTicketData(buyer.phone_number ?? '');

    const [, newTicket] = await prisma.$transaction([
      // 1. Ticket original → TRANSFERRED
      prisma.ticket.update({
        where: { id: ticket.id },
        data: { status_ticket: TicketStatus.TRANSFERRED },
      }),
      // 2. Ticket nuevo para el comprador (credenciales frescas)
      prisma.ticket.create({
        data: {
          transaction_id:           ticket.transaction_id,
          event_id:                 ticket.event_id,
          customer_id:              buyerId,
          customer_uid:             buyer.firebase_uid ?? '',
          customer_ID_phone:        buyer.phone_number ?? '',
          reference_ticket:         newTicketData.reference_ticket,
          booking_ticket:           newTicketData.booking_ticket,
          token_ticket:             newTicketData.token_ticket,
          totp_secret:              newTicketData.totp_secret,
          ticket_first_time:        1,
          status_ticket:            TicketStatus.ACTIVE,
          first_name_user:          buyer.name,
          last_name_user:           buyer.last_name,
          user_num_doc:             buyer.num_doc,
          user_type_doc:            buyer.type_doc,
          ev_name:                  ticket.ev_name,
          ev_short_description:     ticket.ev_short_description,
          ev_cover:                 ticket.ev_cover,
          ev_date_event:            ticket.ev_date_event,
          ev_place_address:         ticket.ev_place_address,
          ev_event_type:            ticket.ev_event_type,
          ev_type_venue:            ticket.ev_type_venue,
          ev_place_seat:            ticket.ev_place_seat,
          ev_organizer_id:          ticket.ev_organizer_id,
          ev_status:                ticket.ev_status,
          loc_id_locality:          ticket.loc_id_locality,
          loc_name_locality:        ticket.loc_name_locality,
          loc_bkg_color:            ticket.loc_bkg_color,
          loc_title_color:          ticket.loc_title_color,
          loc_text_color:           ticket.loc_text_color,
          loc_title_color_location: ticket.loc_title_color_location,
          is_consumable:            ticket.is_consumable,
          consumable_total:         ticket.consumable_total,
          consumable_used:          ticket.consumable_used,
          vip_access:               ticket.vip_access,
        },
      }),
      // 3. Listing → SOLD con comisión
      prisma.ticketSaleListing.update({
        where: { id: listingId },
        data: {
          status:            'SOLD',
          buyer_id:          buyerId,
          sold_price:        paidAmount,
          resale_commission: resaleCommission,
          sold_at:           new Date(),
        },
      }),
    ]);

    const payout = paidAmount - resaleCommission;
    console.log(`💰 Reventa ${listingId} confirmada: $${paidAmount} (comisión $${resaleCommission}, dispersión $${payout}) — ticket ${ticket.id} → TRANSFERRED, nuevo ${newTicket.id} para user ${buyerId}`);

    // Notificaciones a ambos — fire-and-forget
    this._notifySaleCompleted(listing.seller_id, buyerId, {
      listingId,
      eventName: ticket.ev_name,
      soldPrice: paidAmount,
      payout,
      newTicketId: newTicket.id,
    });

    return { message: 'Pago confirmado. Ticket transferido al comprador.', new_ticket: newTicket };
  }

  /** Socket + push + email a vendedor y comprador tras confirmarse el pago */
  private _notifySaleCompleted(
    sellerId: number,
    buyerId: number,
    info: { listingId: number; eventName: string; soldPrice: number; payout: number; newTicketId: number }
  ): void {
    const task = async () => {
      const [seller, buyer] = await Promise.all([
        prisma.user.findUnique({ where: { id: sellerId }, select: { id: true, name: true, email: true, fcm_token: true } }),
        prisma.user.findUnique({ where: { id: buyerId }, select: { id: true, name: true, email: true, fcm_token: true } }),
      ]);

      // 🔔 Sockets
      try {
        const { io } = await import('../index');
        io.to(`user:${sellerId}`).emit('listing:sold', {
          listing_id: info.listingId,
          role: 'seller',
          sold_price: info.soldPrice,
          payout: info.payout,
          event_name: info.eventName,
          timestamp: new Date().toISOString(),
        });
        io.to(`user:${buyerId}`).emit('listing:sold', {
          listing_id: info.listingId,
          role: 'buyer',
          new_ticket_id: info.newTicketId,
          event_name: info.eventName,
          timestamp: new Date().toISOString(),
        });
        // Reusar el evento que ya refresca el wallet del comprador en la app
        io.to(`user:${buyerId}`).emit('ticket:transfer:completed', {
          new_ticket_id: info.newTicketId,
          event_name: info.eventName,
          timestamp: new Date().toISOString(),
        });
        // Y el del vendedor (su ticket salió del wallet)
        io.to(`user:${sellerId}`).emit('ticket:transfer:accepted', {
          ticket_id: null,
          listing_id: info.listingId,
          timestamp: new Date().toISOString(),
        });
      } catch (e: any) {
        console.error('⚠️ Socket reventa:', e.message);
      }

      // 📲 Push
      if (seller?.fcm_token) {
        await pushService.sendResaleSoldToSeller(seller.fcm_token, {
          eventName: info.eventName, soldPrice: info.soldPrice, listingId: info.listingId,
        }).catch(() => null);
      }
      if (buyer?.fcm_token) {
        await pushService.sendResaleTicketToBuyer(buyer.fcm_token, {
          eventName: info.eventName, ticketId: info.newTicketId,
        }).catch(() => null);
      }

      // 📧 Emails
      if (seller?.email) {
        await emailService.queueEmail({
          userId: seller.id,
          email: seller.email,
          templateCode: 'RESALE_SOLD_SELLER',
          variables: {
            user_name:  seller.name,
            event_name: info.eventName,
            sold_price: `$${info.soldPrice.toLocaleString('es-CO')}`,
            payout:     `$${info.payout.toLocaleString('es-CO')}`,
          },
        }).catch((e) => console.error('⚠️ Email vendedor:', e.message));
      }
      if (buyer?.email) {
        await emailService.queueEmail({
          userId: buyer.id,
          email: buyer.email,
          templateCode: 'RESALE_TICKET_BUYER',
          variables: {
            user_name:  buyer.name,
            event_name: info.eventName,
          },
        }).catch((e) => console.error('⚠️ Email comprador:', e.message));
      }

      console.log('📣 Notificaciones de reventa enviadas (vendedor + comprador)');
    };

    task().catch((err) => console.error('⚠️ Error notificando reventa:', err.message));
  }

  async getMyListings(sellerId: number) {
    return saleRepo.findListingsBySeller(sellerId);
  }

  /**
   * Listings activos de un evento — para la sección "Reventa verificada"
   * (la web/app la muestran solo cuando el evento/localidad está agotado).
   * No expone identidad del vendedor.
   */
  async getActiveListingsByEvent(eventId: number) {
    const listings = await prisma.ticketSaleListing.findMany({
      where: {
        status: 'ACTIVE',
        expires_at: { gt: new Date() },
        ticket: { event_id: eventId },
      },
      select: {
        id: true,
        sale_type: true,
        asking_price: true,
        min_price: true,
        expires_at: true,
        createdAt: true,
        ticket: {
          select: {
            loc_id_locality: true,
            loc_name_locality: true,
            loc_bkg_color: true,
            ev_name: true,
            ev_date_event: true,
            vip_access: true,
            is_consumable: true,
          },
        },
        _count: { select: { offers: { where: { status: 'PENDING' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: listings, total: listings.length };
  }

  /**
   * Detalle público de un listing (link directo) — sin identidad del vendedor.
   * Incluye la mejor oferta actual si es subasta.
   */
  async getListingPublicDetail(listingId: number) {
    const listing = await prisma.ticketSaleListing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        status: true,
        sale_type: true,
        asking_price: true,
        min_price: true,
        expires_at: true,
        ticket: {
          select: {
            event_id: true,
            loc_id_locality: true,
            loc_name_locality: true,
            loc_bkg_color: true,
            ev_name: true,
            ev_cover: true,
            ev_date_event: true,
            ev_place_address: true,
            vip_access: true,
            is_consumable: true,
          },
        },
      },
    });
    if (!listing) throw new Error('Publicación no encontrada');

    let topOffer: number | null = null;
    if (listing.sale_type === 'AUCTION') {
      const best = await prisma.ticketSaleOffer.findFirst({
        where: { listing_id: listingId, status: 'PENDING' },
        orderBy: { amount: 'desc' },
        select: { amount: true },
      });
      topOffer = best?.amount ?? null;
    }

    return { ...listing, top_offer: topOffer };
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

  /**
   * Avisar a la lista de espera del evento que hay un ticket en reventa.
   * Usuarios registrados → cola de emails; visitantes → Brevo directo.
   */
  private async _notifyWaitingList(
    eventId: number,
    listingId: number,
    eventName: string,
    localityName: string,
    saleType: TicketSaleType
  ) {
    const waitingList = await waitingRepo.findByEventId(eventId);
    if (waitingList.length === 0) return;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { public_id: true, public_url: true },
    });
    const eventLink = event?.public_id
      ? `https://paypac.co/events/${event.public_id}${event.public_url ? '/' + event.public_url : ''}`
      : 'https://paypac.co/events';

    console.log(`📣 Notificando ${waitingList.length} usuario(s) en lista de espera — listing ${listingId} (${saleType})`);

    const template = EMAIL_TEMPLATES['RESALE_AVAILABLE'];

    for (const entry of waitingList) {
      const variables = {
        user_name:   entry.name,
        event_name:  eventName,
        locality_name: localityName,
        sale_mode:   saleType === 'AUCTION' ? 'subasta' : 'venta directa',
        event_link:  eventLink,
      };

      try {
        const user = await prisma.user.findFirst({
          where: { email: { equals: entry.email, mode: 'insensitive' } },
          select: { id: true },
        });

        if (user) {
          await emailService.queueEmail({
            userId: user.id,
            email: entry.email,
            templateCode: 'RESALE_AVAILABLE',
            variables,
          });
        } else {
          await brevoService.sendEmail({
            to: { email: entry.email, name: entry.name },
            subject: template.subject(variables),
            htmlContent: template.html(variables),
          });
        }
      } catch (e: any) {
        console.error(`⚠️ Error notificando a ${entry.email}:`, e.message);
      }
    }
  }
}
