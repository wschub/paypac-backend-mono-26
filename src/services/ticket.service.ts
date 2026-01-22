import { TicketRepository } from '../repositories/ticket.repository';
import { EventStaffAssignmentRepository } from '../repositories/event_staff_assignment.repository';
import { EventRepository } from '../repositories/event.repository';
import { Prisma } from '@prisma/client';
import {
  generateTicketData,
  regenerateTokenOnTransfer,
  validateTicketToken,
} from '../utils/ticket.utils';

const ticketRepo = new TicketRepository();
const staffAssignmentRepo = new EventStaffAssignmentRepository();
const eventRepo = new EventRepository();

export class TicketService {
  /**
   * Crear tickets después de una compra exitosa
   * Se llama desde el webhook de pago o después de confirmar la transacción
   */
  async createTicketsFromInvoice(
    transactionId: number,
    invoiceData: {
      user_id: number;
      user_uid: string;
      event_id: number;
      items: Array<{
        stage_id: number;
        stage_name: string;
        locality_id: number;
        locality_name: string;
        qty_tickets: number;
        price_ticket: number;
      }>;
    },
    eventSnapshot: {
      name: string;
      short_description: string;
      cover: string;
      date_event: Date;
      place_address: string;
      event_type: string;
      type_venue: string;
      organizer_id: number;
      status: string;
    },
    customerIdPhone: string
  ) {
    const tickets: Prisma.TicketUncheckedCreateInput[] = [];

    // Generar tickets por cada item de la factura
    for (const item of invoiceData.items) {
      for (let i = 0; i < item.qty_tickets; i++) {
        const ticketData = generateTicketData(customerIdPhone);

        tickets.push({
          transaction_id: transactionId,
          event_id: invoiceData.event_id,
          customer_id: invoiceData.user_id,
          customer_uid: invoiceData.user_uid,
          customer_ID_phone: customerIdPhone,
          reference_ticket: ticketData.reference_ticket,
          booking_ticket: ticketData.booking_ticket,
          token_ticket: ticketData.token_ticket,
          ticket_first_time: 1,
          status_ticket: 'PAID',
          
          // Snapshot del evento
          ev_name: eventSnapshot.name,
          ev_short_description: eventSnapshot.short_description,
          ev_cover: eventSnapshot.cover,
          ev_date_event: eventSnapshot.date_event,
          ev_place_address: eventSnapshot.place_address,
          ev_event_type: eventSnapshot.event_type as any,
          ev_type_venue: eventSnapshot.type_venue as any,
          ev_place_seat: '', // Para eventos numerados, se asigna después
          ev_organizer_id: eventSnapshot.organizer_id,
          ev_status: eventSnapshot.status as any,
          
          // Snapshot de localidad
          loc_id_locality: item.locality_id,
          loc_name_locality: item.locality_name,
          loc_bkg_color: '#000000', // TODO: Obtener del snapshot de localidad
          loc_title_color: '#FFFFFF',
          loc_text_color: '#FFFFFF',
          loc_title_color_location: '#FFFFFF',
        });
      }
    }

    // Crear todos los tickets en batch
    const count = await ticketRepo.createMany(tickets);

    return {
      count,
      message: `${count} tickets creados exitosamente`,
    };
  }

  /**
   * Obtener mis tickets (Wallet)
   */
  async getMyTickets(userId: number) {
    return ticketRepo.findByCustomer(userId);
  }

  /**
   * Obtener ticket por ID
   * Solo el dueño puede verlo
   */
  async getTicketById(id: number, userId: number) {
    const ticket = await ticketRepo.findById(id);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    // Verificar ownership
    if (ticket.customer_id !== userId) {
      throw new Error('No tienes permisos para ver este ticket');
    }

    return ticket;
  }

  /**
   * Transferir ticket (regalo o venta)
   * @param ticketId - ID del ticket a transferir
   * @param fromUserId - Usuario que transfiere (debe ser el dueño)
   * @param toUserId - Usuario que recibe
   * @param toUserUid - UID Firebase del receptor
   * @param toUserIdPhone - ID del teléfono del receptor
   * @param transactionType - "transfer" | "sale" | "gift"
   * @param description - Mensaje de la transferencia
   */
  async transferTicket(
    ticketId: number,
    fromUserId: number,
    fromUserUid: string,
    fromUserIdPhone: string,
    toUserId: number,
    toUserUid: string,
    toUserIdPhone: string,
    transactionType: 'transfer' | 'sale' | 'gift',
    description?: string
  ) {
    const ticket = await ticketRepo.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    // Verificar ownership
    if (ticket.customer_id !== fromUserId) {
      throw new Error('Solo el dueño puede transferir este ticket');
    }

    // Verificar que el ticket esté disponible para transferencia
    if (!['PAID', 'ACTIVE'].includes(ticket.status_ticket)) {
      throw new Error(`No se puede transferir un ticket con status: ${ticket.status_ticket}`);
    }

    // Verificar que no esté usado
    if (ticket.ticket_first_time === 0) {
      throw new Error('Este ticket ya fue usado y no puede transferirse');
    }

    // Regenerar token con el nuevo dueño
    const newToken = regenerateTokenOnTransfer(
      ticket.reference_ticket,
      ticket.booking_ticket,
      toUserIdPhone
    );

    // FASE 2: Aquí iría la validación de permisos de reventa
    // if (transactionType === 'sale') {
    //   // Verificar que el evento permita reventa
    //   // Verificar límites de tiempo
    //   // Verificar límites de transferencias
    // }

    // Actualizar el ticket con el nuevo dueño
    const updatedTicket = await ticketRepo.transferOwnership(
      ticketId,
      toUserId,
      toUserUid,
      toUserIdPhone,
      newToken
    );

    // Crear registro de auditoría en TicketTransaction
    // (se maneja desde el controlador usando TicketTransactionService)

    return {
      ticket: updatedTicket,
      message: 'Ticket transferido exitosamente',
    };
  }

  /**
   * 🆕 Validar ticket en la entrada del evento
   * Se escanea el QR y se valida el token
   * ACTUALIZADO: Ahora valida permisos del STAFF
   */
  async validateTicket(
    qrToken: string,
    scannerUserId: number,
    scannerRole: string,
    eventId: number // 🆕 Nuevo parámetro requerido
  ) {
    // Buscar ticket por token
    const ticket = await ticketRepo.findByToken(qrToken);

    if (!ticket) {
      throw new Error('Ticket no encontrado o token inválido');
    }

    // 🆕 Validar que el ticket pertenece al evento correcto
    if (ticket.event_id !== eventId) {
      throw new Error('Este ticket no pertenece a este evento');
    }

    // Validar que el token coincida (doble verificación)
    const isValid = validateTicketToken(qrToken, {
      reference_ticket: ticket.reference_ticket,
      booking_ticket: ticket.booking_ticket,
      customer_ID_phone: ticket.customer_ID_phone,
    });

    if (!isValid) {
      throw new Error('Token de ticket inválido');
    }

    // 🆕 VERIFICAR PERMISOS DEL SCANNER
    if (['STAFF', 'STAFF_PROMOTER'].includes(scannerRole)) {
      // Si es STAFF, verificar asignación y check-in
      const assignment = await staffAssignmentRepo.findByUserAndEvent(scannerUserId, eventId);
      
      if (!assignment) {
        throw new Error('No estás asignado a este evento');
      }

      if (!assignment.checked_in) {
        throw new Error('Debes hacer check-in en el evento antes de validar tickets');
      }
    } else if (scannerRole === 'ORGANIZER') {
      // Si es ORGANIZER, verificar que sea el dueño del evento
      const event = await eventRepo.findById(eventId);
      
      if (!event || event.organizer_id !== scannerUserId) {
        throw new Error('Solo el organizador de este evento puede validar tickets');
      }
    } else if (scannerRole !== 'PAYPAC') {
      // Si no es PAYPAC (admin supremo), denegar
      throw new Error('No tienes permisos para validar tickets');
    }

    // Verificar que el evento ya haya iniciado o esté próximo
    const now = new Date();
    const eventDate = new Date(ticket.ev_date_event);
    const hoursBeforeEvent = 2; // Permitir validar 2 horas antes
    const minValidTime = new Date(eventDate.getTime() - hoursBeforeEvent * 60 * 60 * 1000);

    if (now < minValidTime) {
      throw new Error('El evento aún no ha iniciado. No se puede validar el ticket.');
    }

    // Verificar que no esté ya usado
    if (ticket.ticket_first_time === 0) {
      throw new Error('Este ticket ya fue usado');
    }

    // Verificar status del ticket
    if (!['PAID', 'ACTIVE', 'TRANSFERRED'].includes(ticket.status_ticket)) {
      throw new Error(`Este ticket no es válido. Status: ${ticket.status_ticket}`);
    }

    // Marcar ticket como usado
    const validatedTicket = await ticketRepo.markAsUsed(ticket.id);

    return {
      valid: true,
      ticket: validatedTicket,
      scanner_id: scannerUserId,
      scanner_role: scannerRole,
      message: '¡Ticket validado exitosamente! Bienvenido al evento.',
    };
  }

  /**
   * Obtener tickets próximos (para notificaciones)
   */
  async getUpcomingTickets(userId: number, daysAhead: number = 7) {
    return ticketRepo.findUpcoming(userId, daysAhead);
  }

  /**
   * Cancelar ticket (solo antes del evento y bajo ciertas condiciones)
   */
  async cancelTicket(ticketId: number, userId: number, userRole: string) {
    const ticket = await ticketRepo.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    // Verificar ownership o permisos de admin
    const isOwner = ticket.customer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para cancelar este ticket');
    }

    // Verificar que el ticket no esté usado
    if (ticket.ticket_first_time === 0) {
      throw new Error('No se puede cancelar un ticket ya usado');
    }

    // TODO: Verificar políticas de cancelación
    // - Tiempo límite antes del evento
    // - Políticas de reembolso

    return ticketRepo.softDelete(ticketId);
  }

  /**
   * Obtener estadísticas de tickets por evento (para ORGANIZER/PAYPAC)
   */
  async getEventTicketStats(eventId: number, userId: number, userRole: string) {
    // TODO: Verificar que el usuario sea el organizador o PAYPAC

    const tickets = await ticketRepo.findByEvent(eventId);

    const stats = {
      total: tickets.length,
      byStatus: {
        PAID: tickets.filter(t => t.status_ticket === 'PAID').length,
        ACTIVE: tickets.filter(t => t.status_ticket === 'ACTIVE').length,
        USED: tickets.filter(t => t.status_ticket === 'USED').length,
        TRANSFERRED: tickets.filter(t => t.status_ticket === 'TRANSFERRED').length,
        CANCELED: tickets.filter(t => t.status_ticket === 'CANCELED').length,
      },
      used: tickets.filter(t => t.ticket_first_time === 0).length,
      unused: tickets.filter(t => t.ticket_first_time === 1).length,
    };

    return stats;
  }
}