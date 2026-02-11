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
      locality_colors?: {
        bkg_color: string;
        title_color: string;
        text_color: string;
        title_color_location: string;
      };
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

  // ✅ LOGS DE DEBUGGING
  console.log('\n🎫 CREANDO TICKETS DESDE INVOICE');
  console.log('='.repeat(80));
  console.log('📋 Transaction ID:', transactionId);
  console.log('📋 Customer ID Phone:', customerIdPhone);
  console.log('📋 Event ID:', invoiceData.event_id);
  console.log('📋 User ID:', invoiceData.user_id);
  console.log('📋 Items recibidos:', invoiceData.items.length);
  console.log('📋 Items detallados:');
  invoiceData.items.forEach((item, index) => {
    console.log(`   [${index}] ${item.locality_name} - ${item.stage_name}`);
    console.log(`       Qty: ${item.qty_tickets}`);
    console.log(`       Locality ID: ${item.locality_id}`);
    console.log(`       Stage ID: ${item.stage_id}`);
  });
  console.log('='.repeat(80) + '\n');

  // Generar tickets por cada item de la factura
  for (const item of invoiceData.items) {
    console.log(`\n🔄 Procesando item: ${item.locality_name} - ${item.stage_name}`);
    console.log(`   Locality ID: ${item.locality_id}`);
    console.log(`   Stage ID: ${item.stage_id}`);
    console.log(`   Qty tickets para este item: ${item.qty_tickets}`);
    console.log(`   Tipo de qty_tickets: ${typeof item.qty_tickets}`);
    
    for (let i = 0; i < item.qty_tickets; i++) {
      console.log(`   ✅ Generando ticket ${i + 1}/${item.qty_tickets}`);
      
      const ticketData = generateTicketData(customerIdPhone);
      
      console.log(`      Reference: ${ticketData.reference_ticket}`);
      console.log(`      Booking: ${ticketData.booking_ticket}`);
      console.log(`      Token: ${ticketData.token_ticket.substring(0, 16)}...`);

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
        ev_place_seat: '', 
        ev_organizer_id: eventSnapshot.organizer_id,
        ev_status: eventSnapshot.status as any,
        
        // Snapshot de localidad CON COLORES
        loc_id_locality: item.locality_id,
        loc_name_locality: item.locality_name,
        loc_bkg_color: item.locality_colors?.bkg_color || '#000000',
        loc_title_color: item.locality_colors?.title_color || '#FFFFFF',
        loc_text_color: item.locality_colors?.text_color || '#FFFFFF',
        loc_title_color_location: item.locality_colors?.title_color_location || '#FFFFFF',
      });
      
      console.log(`      ✅ Ticket ${i + 1} agregado al array`);
    }
    
    console.log(`   ✅ Terminado procesamiento del item (total en array: ${tickets.length})`);
  }

  // ✅ LOGS ANTES DE CREAR EN BD
  console.log('\n📊 RESUMEN ANTES DE CREAR EN BD:');
  console.log('='.repeat(80));
  console.log('📋 Total tickets generados en array:', tickets.length);
  console.log('📋 References de los tickets:');
  tickets.forEach((t, i) => {
    console.log(`   [${i}] ${t.reference_ticket} - ${t.loc_name_locality}`);
  });
  console.log('='.repeat(80) + '\n');

  // Crear todos los tickets en batch
  console.log('🔄 Llamando a ticketRepo.createMany()...\n');
  const count = await ticketRepo.createMany(tickets);

  // ✅ LOGS DESPUÉS DE CREAR
  console.log('\n✅ RESULTADO DE createMany():');
  console.log('='.repeat(80));
  console.log('📋 Count retornado por Prisma:', count);
  console.log('📋 Tickets que se intentaron crear:', tickets.length);
  console.log('📋 ¿Coinciden?:', count === tickets.length ? '✅ SÍ' : '❌ NO');
  console.log('='.repeat(80) + '\n');

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

    // Actualizar el ticket con el nuevo dueño
    const updatedTicket = await ticketRepo.transferOwnership(
      ticketId,
      toUserId,
      toUserUid,
      toUserIdPhone,
      newToken
    );

    return {
      ticket: updatedTicket,
      message: 'Ticket transferido exitosamente',
    };
  }

  /**
   * Validar ticket en la entrada del evento
   * 
   * async validateTicket(
    qrToken: string,
    scannerUserId: number,
    scannerRole: string,
    eventId: number
  ) {
    // Buscar ticket por token
    const ticket = await ticketRepo.findByToken(qrToken);

    if (!ticket) {
      throw new Error('Ticket no encontrado o token inválido');
    }

    // Validar que el ticket pertenece al evento correcto
    if (ticket.event_id !== eventId) {
      throw new Error('Este ticket no pertenece a este evento');
    }

    // Validar que el token coincida
    const isValid = validateTicketToken(qrToken, {
      reference_ticket: ticket.reference_ticket,
      booking_ticket: ticket.booking_ticket,
      customer_ID_phone: ticket.customer_ID_phone,
    });

    if (!isValid) {
      throw new Error('Token de ticket inválido');
    }

    // Verificar permisos del scanner
    if (['STAFF', 'STAFF_PROMOTER'].includes(scannerRole)) {
      const assignment = await staffAssignmentRepo.findByUserAndEvent(scannerUserId, eventId);
      
      if (!assignment) {
        throw new Error('No estás asignado a este evento');
      }

      if (!assignment.checked_in) {
        throw new Error('Debes hacer check-in en el evento antes de validar tickets');
      }
    } else if (scannerRole === 'ORGANIZER') {
      const event = await eventRepo.findById(eventId);
      
      if (!event || event.organizer_id !== scannerUserId) {
        throw new Error('Solo el organizador de este evento puede validar tickets');
      }
    } else if (scannerRole !== 'PAYPAC') {
      throw new Error('No tienes permisos para validar tickets');
    }

    // Verificar que el evento ya haya iniciado
    const now = new Date();
    const eventDate = new Date(ticket.ev_date_event);
    const hoursBeforeEvent = 2;
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
   */
  

  // En ticket.service.ts - Método validateTicket()

/**
 * Validar ticket (escanear QR en entrada del evento)
 * 
 * REGLAS DE VALIDACIÓN:
 * ✅ El ticket debe existir y pertenecer al evento
 * ✅ El ticket debe estar en estado ACTIVE o PAID
 * ✅ El ticket NO debe estar ya usado (USED)
 * ✅ El evento debe haber iniciado O estar dentro de la ventana de entrada anticipada
 * ✅ El evento NO debe haber terminado
 * ✅ El scanner (STAFF) debe tener permisos para validar en este evento
 */
async validateTicket(
  qr_token: string,
  scanner_id: number,
  scanner_role: string,
  event_id: number
): Promise<{
  success: boolean;
  ticket: any;
  message: string;
  scanner_id: number;
}> {
  console.log('🎫 Validando ticket...');
  console.log(`   QR Token: ${qr_token}`);
  console.log(`   Event ID: ${event_id}`);
  console.log(`   Scanner ID: ${scanner_id} (${scanner_role})`);

  // ============================================
  // 1️⃣ BUSCAR TICKET POR TOKEN
  // ============================================
  const ticket = await this.ticketRepository.findByToken(qr_token);

  if (!ticket) {
    console.log('❌ Ticket no encontrado');
    throw new Error('Ticket no encontrado. El código QR es inválido.');
  }

  console.log('✅ Ticket encontrado:', ticket.reference_ticket);
  console.log(`   Estado: ${ticket.status_ticket}`);
  console.log(`   Evento: ${ticket.event_id}`);

  // ============================================
  // 2️⃣ VERIFICAR QUE PERTENECE AL EVENTO
  // ============================================
  if (ticket.event_id !== event_id) {
    console.log('❌ Ticket no pertenece a este evento');
    console.log(`   Esperado: ${event_id}, Recibido: ${ticket.event_id}`);
    throw new Error('Este ticket no pertenece a este evento.');
  }

  // ============================================
  // 3️⃣ VERIFICAR PERMISOS DEL SCANNER
  // ============================================
  if (scanner_role !== 'PAYPAC') {
    // Solo STAFF necesita verificación de permisos
    const { EventStaffAssignmentService } = await import('./event_staff_assignment.service');
    const staffService = new EventStaffAssignmentService();

    const canValidate = await staffService.canStaffValidateTickets(scanner_id, event_id);

    if (!canValidate) {
      console.log('❌ STAFF no tiene permisos para validar en este evento');
      throw new Error('No tienes permisos para validar tickets en este evento.');
    }

    console.log('✅ STAFF tiene permisos para validar');
  } else {
    console.log('✅ Scanner es PAYPAC (permisos totales)');
  }

  // ============================================
  // 4️⃣ VERIFICAR ESTADO DEL TICKET
  // ============================================
  if (ticket.status_ticket === 'USED') {
    console.log('❌ Ticket ya fue usado');
    throw new Error('Este ticket ya fue utilizado anteriormente.');
  }

  if (ticket.status_ticket !== 'ACTIVE' && ticket.status_ticket !== 'PAID') {
    console.log(`❌ Ticket en estado inválido: ${ticket.status_ticket}`);
    throw new Error(`El ticket está en estado: ${ticket.status_ticket}. No es válido para entrada.`);
  }

  console.log('✅ Estado del ticket es válido');

  // ============================================
  // 5️⃣ VERIFICAR FECHAS DEL EVENTO
  // ============================================
  const event = await prisma.event.findUnique({
    where: { id: event_id },
  });

  if (!event) {
    throw new Error('Evento no encontrado.');
  }

  const now = new Date();
  const eventDate = new Date(event.date_event);
  const eventEndDate = event.end_date_event ? new Date(event.end_date_event) : null;

  // ✅ VENTANA DE ENTRADA ANTICIPADA
  // Permitir entrada hasta 2 horas antes del evento
  const EARLY_ENTRY_MINUTES = parseInt(process.env.EARLY_ENTRY_MINUTES || '120'); // Default: 2 horas
  const earlyEntryTime = new Date(eventDate.getTime() - EARLY_ENTRY_MINUTES * 60 * 1000);

  console.log('📅 Verificando fechas del evento:');
  console.log(`   Hora actual: ${now.toISOString()}`);
  console.log(`   Inicio del evento: ${eventDate.toISOString()}`);
  console.log(`   Entrada anticipada desde: ${earlyEntryTime.toISOString()}`);
  if (eventEndDate) {
    console.log(`   Fin del evento: ${eventEndDate.toISOString()}`);
  }

  // Verificar si es muy temprano (antes de la ventana de entrada anticipada)
  if (now < earlyEntryTime) {
    const minutesUntilEarlyEntry = Math.ceil((earlyEntryTime.getTime() - now.getTime()) / (1000 * 60));
    console.log(`❌ Muy temprano. Faltan ${minutesUntilEarlyEntry} minutos para entrada anticipada`);
    throw new Error(
      `El evento aún no ha iniciado. La entrada anticipada comienza ${EARLY_ENTRY_MINUTES} minutos antes (${earlyEntryTime.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      })}).`
    );
  }

  // Verificar si el evento ya terminó
  if (eventEndDate && now > eventEndDate) {
    console.log('❌ El evento ya finalizó');
    throw new Error('El evento ya finalizó. No se puede validar el ticket.');
  }

  console.log('✅ El evento está dentro del horario permitido');

  // ============================================
  // 6️⃣ MARCAR TICKET COMO USADO
  // ============================================
  console.log('📝 Marcando ticket como USED...');

  const updatedTicket = await this.ticketRepository.updateStatus(
    ticket.id,
    'USED'
  );

  console.log('✅ Ticket marcado como USED');

  // ============================================
  // 7️⃣ REGISTRAR TRANSACCIÓN DE VALIDACIÓN
  // ============================================
  console.log('📝 Registrando transacción de validación...');

  await prisma.ticketTransaction.create({
    data: {
      ticket_id: ticket.id,
      from_user_id: ticket.user_id,
      to_user_id: ticket.user_id, // Mismo usuario (validación)
      transaction_type: 'VALIDATION',
      transaction_date: new Date(),
      status_transaction: 'COMPLETED',
      scanner_id: scanner_id,
    },
  });

  console.log('✅ Transacción registrada');

  // ============================================
  // 8️⃣ RETORNAR TICKET VALIDADO
  // ============================================
  return {
    success: true,
    ticket: updatedTicket,
    message: 'Ticket validado exitosamente',
    scanner_id: scanner_id,
  };
}

  /**
   * Obtener tickets próximos
   */
  async getUpcomingTickets(userId: number, daysAhead: number = 7) {
    return ticketRepo.findUpcoming(userId, daysAhead);
  }

  /**
   * Cancelar ticket
   */
  async cancelTicket(ticketId: number, userId: number, userRole: string) {
    const ticket = await ticketRepo.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    const isOwner = ticket.customer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para cancelar este ticket');
    }

    if (ticket.ticket_first_time === 0) {
      throw new Error('No se puede cancelar un ticket ya usado');
    }

    return ticketRepo.softDelete(ticketId);
  }

  /**
   * Obtener estadísticas de tickets por evento
   */
  async getEventTicketStats(eventId: number, userId: number, userRole: string) {
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