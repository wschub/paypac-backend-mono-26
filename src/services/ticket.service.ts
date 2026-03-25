import { TicketRepository } from '../repositories/ticket.repository';
import { EventStaffAssignmentRepository } from '../repositories/event_staff_assignment.repository';
import { EventRepository } from '../repositories/event.repository';
import { Prisma, TicketStatus } from '@prisma/client';
import {
  generateTicketData,
  regenerateTokenOnTransfer,
  validateTicketToken,
  validateTOTPCode,
   verifyRSASignature,   // ← agregar
  generateNFCChallenge, // ← agregar
  generateTotpSecret,
} from '../utils/ticket.utils';

const ticketRepo = new TicketRepository();
const staffAssignmentRepo = new EventStaffAssignmentRepository();
const eventRepo = new EventRepository();

// Mapa en memoria para challenges activos — TTL 15s
// En producción futura usar Redis
const nfcChallenges = new Map<string, { value: string; expiresAt: number }>();

export class TicketService {

  async registerPublicKey(id: number, userId: number, devicePublicKey: string) {
  const ticket = await ticketRepo.findById(id);
  if (!ticket) throw new Error('Ticket no encontrado');
  if (ticket.customer_id !== userId) throw new Error('No autorizado');
  return ticketRepo.update(id, { device_public_key: devicePublicKey });
}

async getTotpSecret(id: number, userId: number) {
  const ticket = await ticketRepo.findById(id);
  if (!ticket) throw new Error('Ticket no encontrado');
  if (ticket.customer_id !== userId) throw new Error('No autorizado');
  if (!ticket.totp_secret) throw new Error('TOTP no configurado para este ticket');
  return { totp_secret: ticket.totp_secret };
}

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
    device_uuid?: string;
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
        totp_secret:   ticketData.totp_secret, 
        device_uuid:   invoiceData.device_uuid ?? null,
        ticket_first_time: 1,
        status_ticket: 'PAID',
        
        // Snapshot del evento
        ev_name: eventSnapshot.name,
        ev_short_description: eventSnapshot.short_description,
        ev_cover: eventSnapshot.cover,
        ev_date_event: new Date(eventSnapshot.date_event),
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
  async getMyTickets(userId: number, status?: TicketStatus | TicketStatus[]) {
  return ticketRepo.findByCustomer(userId, status);
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

    // ✅ AGREGAR — limpiar credenciales del dueño anterior
await ticketRepo.update(ticketId, {
  device_public_key: null,
  device_uuid:       null,  // también limpiar uuid anterior
  totp_secret:       generateTotpSecret(), // nuevo secreto para el nuevo dueño
});

    return {
      ticket: updatedTicket,
      message: 'Ticket transferido exitosamente',
    };
  }

  /**
   * Validar ticket en la entrada del evento
   */
  async validateTicket(
    qrToken: string,
    scannerUserId: number,
    scannerRole: string,
    eventId: number,
    deviceUuid?: string,
    totpCode?: string,    // ← agregar
    totpTicketId?: number // ← agregar
  ) {
      let ticket: any;

  // ── Detectar método de validación ──────────────────────────────
  if (totpCode && totpTicketId) {
    // Método 3 — TOTP
    ticket = await ticketRepo.findById(totpTicketId);
    if (!ticket) throw new Error('Ticket no encontrado');

    if (!ticket.totp_secret) {
      throw new Error('Este ticket no tiene TOTP configurado');
    }

    if (!validateTOTPCode(totpCode, ticket.totp_secret)) {
      throw new Error('Código TOTP inválido o expirado');
    }

  } else {
    // Método 1 y 2 — token básico o con device_uuid
    ticket = await ticketRepo.findByToken(qrToken);
    if (!ticket) throw new Error('Ticket no encontrado o token inválido');

    const isValid = validateTicketToken(qrToken, {
      reference_ticket:  ticket.reference_ticket,
      booking_ticket:    ticket.booking_ticket,
      customer_ID_phone: ticket.customer_ID_phone,
    });
    if (!isValid) throw new Error('Token de ticket inválido');

    if (ticket.device_uuid && deviceUuid) {
      if (ticket.device_uuid !== deviceUuid) {
        throw new Error('El QR no proviene del dispositivo registrado. Posible fraude.');
      }
    }
  }

    // Validar que el ticket pertenece al evento correcto
    if (ticket.event_id !== eventId) {
      throw new Error('Este ticket no pertenece a este evento');
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

// Buscar fechas de check-in desde el evento real en BD
const event = await eventRepo.findById(ticket.event_id);
if (!event) throw new Error('Evento no encontrado');

if (event.date_checkin_open && now < new Date(event.date_checkin_open)) {
  throw new Error(
    `El check-in abre el ${new Date(event.date_checkin_open).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`
  );
}

if (event.date_checkin_close && now > new Date(event.date_checkin_close)) {
  throw new Error('La ventana de check-in ha cerrado');
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

//NFC 
// ── Nuevo método: generar challenge NFC ──────────────────────────
async generateNFCChallenge(staffUserId: number, eventId: number) {
  // Verificar que el staff está asignado al evento
  const assignment = await staffAssignmentRepo.findByUserAndEvent(staffUserId, eventId);
  if (!assignment) throw new Error('No estás asignado a este evento');
  if (!assignment.checked_in) throw new Error('Debes hacer check-in antes de validar');

  const challengeId = crypto.randomUUID();
  const challengeValue = generateNFCChallenge();
  const expiresAt = Date.now() + 15000; // 15 segundos

  nfcChallenges.set(challengeId, { value: challengeValue, expiresAt });

  // Limpiar el challenge después de 15s automáticamente
  setTimeout(() => nfcChallenges.delete(challengeId), 15000);

  return { challenge_id: challengeId, challenge_value: challengeValue, expires_at: expiresAt };
}

// ── Nuevo método: validar ticket por NFC ─────────────────────────
async validateNFCTicket(
  ticketId:    number,
  challengeId: string,
  signature:   string,
  scannerUserId: number,
  scannerRole:   string,
  eventId:       number
) {
  // 1. Verificar challenge existe y no expiró
  const challenge = nfcChallenges.get(challengeId);
  if (!challenge) throw new Error('Challenge NFC no encontrado o expirado');
  if (Date.now() > challenge.expiresAt) {
    nfcChallenges.delete(challengeId);
    throw new Error('Challenge NFC expirado. Inicia el proceso nuevamente.');
  }

  // 2. Buscar ticket
  const ticket = await ticketRepo.findById(ticketId);
  if (!ticket) throw new Error('Ticket no encontrado');
  if (!ticket.device_public_key) throw new Error('Este ticket no tiene clave pública registrada');

  // 3. Verificar firma RSA
  const isValid = verifyRSASignature(challenge.value, signature, ticket.device_public_key);
  if (!isValid) throw new Error('Firma NFC inválida. Posible fraude.');

  // 4. Eliminar challenge usado (anti-replay)
  nfcChallenges.delete(challengeId);

  // 5. Verificar que pertenece al evento
  if (ticket.event_id !== eventId) throw new Error('Este ticket no pertenece a este evento');

  // 6. Verificar permisos del scanner
  if (['STAFF', 'STAFF_PROMOTER'].includes(scannerRole)) {
    const assignment = await staffAssignmentRepo.findByUserAndEvent(scannerUserId, eventId);
    if (!assignment)       throw new Error('No estás asignado a este evento');
    if (!assignment.checked_in) throw new Error('Debes hacer check-in antes de validar');
  } else if (scannerRole === 'ORGANIZER') {
    const event = await eventRepo.findById(eventId);
    if (!event || event.organizer_id !== scannerUserId)
      throw new Error('Solo el organizador puede validar tickets');
  } else if (scannerRole !== 'PAYPAC') {
    throw new Error('No tienes permisos para validar tickets');
  }

  // 7. Verificar ventana de check-in
  const now   = new Date();
  const event = await eventRepo.findById(eventId);
  if (!event) throw new Error('Evento no encontrado');
  if (event.date_checkin_open  && now < new Date(event.date_checkin_open))
    throw new Error(`El check-in abre el ${new Date(event.date_checkin_open).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`);
  if (event.date_checkin_close && now > new Date(event.date_checkin_close))
    throw new Error('La ventana de check-in ha cerrado');

  // 8. Verificar que no esté ya usado
  if (ticket.ticket_first_time === 0) throw new Error('Este ticket ya fue usado');
  if (!['PAID', 'ACTIVE', 'TRANSFERRED'].includes(ticket.status_ticket))
    throw new Error(`Este ticket no es válido. Status: ${ticket.status_ticket}`);

  // 9. Marcar como usado
  const validatedTicket = await ticketRepo.markAsUsed(ticket.id);

  return {
    valid:        true,
    ticket:       validatedTicket,
    scanner_id:   scannerUserId,
    scanner_role: scannerRole,
    method:       'NFC',
    message:      '¡Ticket NFC validado exitosamente! Bienvenido al evento.',
  };
}

}