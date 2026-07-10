import { TicketTransactionRepository } from '../repositories/tickettransaction.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { Prisma } from '@prisma/client';
import { TicketStatus } from '@prisma/client';
import { NotificationMessageQueueService } from './notificationmessagequeue.service';
import { io } from '../index';
import { PushNotificationService } from './push-notification.service';
import { prisma } from '../config/db';
import { generateTicketData } from '../utils/ticket.utils';


const transactionRepo = new TicketTransactionRepository();
const ticketRepo = new TicketRepository();
const emailService = new NotificationMessageQueueService();
const pushService = new PushNotificationService();

export class TicketTransactionService {
  /**
   * Crear un registro de transacción (auditoría)
   */
  async createTransaction(data: Prisma.TicketTransactionUncheckedCreateInput) {
     const transaction = await transactionRepo.create(data);

     // 🔔 Socket.IO — notificar al receptor en tiempo real
try {
  io.to(`user:${data.to_customer_id}`).emit('ticket:received', {
    transaction_id:   transaction.id,
    from_user_id:     data.from_customer_id,
    ticket_id:        data.ticket_id,
    transaction_type: data.type_transaction,
    message:          data.transaction_description,
    timestamp:        new Date().toISOString(),
  });
} catch (socketError: any) {
  console.error('⚠️ Error Socket.IO transfer:', socketError.message);
}
 
  // 📧 Notificar al receptor
  try {
    const { prisma } = await import('../config/db');
 
    // Verificar si el receptor existe en el sistema
    const recipient = await prisma.user.findFirst({
      where: {
        OR: [
          { email:        data.to_customer_uid   }, // to_customer_uid puede ser email
          { phone_number: data.to_customer_UUID_phone },
        ],
      },
      select: { id: true, name: true, last_name: true, email: true },
    });
 
    const sender = await prisma.user.findUnique({
      where: { id: data.from_customer_id },
      select: { name: true, last_name: true },
    });
 
    const senderName = sender ? `${sender.name} ${sender.last_name}` : 'Un usuario';
 
    // Buscar datos del ticket para el evento
    const ticket = await prisma.ticket.findUnique({
      where: { id: data.ticket_id },
      select: {
        ev_name:         true,
        ev_cover:        true,
        ev_date_event:   true,
        ev_place_address: true,
        loc_name_locality: true,
      },
    });
 
    if (recipient && recipient.email) {
      // ✅ Receptor REGISTRADO
      await emailService.queueEmail({
        userId: recipient.id,
        email:  recipient.email,
        templateCode: 'TICKET_TRANSFER_RECEIVED',
        variables: {
          recipient_name:  `${recipient.name} ${recipient.last_name}`,
          sender_name:     senderName,
          sender_message:  (data as any).transaction_description ?? '',
          event_name:      ticket?.ev_name          ?? 'tu evento',
          event_image:     ticket?.ev_cover         ?? '',
          event_date:      ticket?.ev_date_event
            ? new Date(ticket.ev_date_event).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })
            : '',
          event_address:   ticket?.ev_place_address ?? '',
          locality_name:   ticket?.loc_name_locality ?? '',
          wallet_link:     'https://app.paypac.com.co/wallet',
        },
      });
    } else {
      // ❌ Receptor NO REGISTRADO — enviar a email/cel contacto
      const contactEmail = data.to_customer_uid?.includes('@')
        ? data.to_customer_uid
        : null;
 
      if (contactEmail) {
        await emailService.queueEmail({
          userId: data.from_customer_id, // se usa el remitente como referencia
          email:  contactEmail,
          templateCode: 'TICKET_TRANSFER_RECEIVED_UNREGISTERED',
          variables: {
            sender_name:    senderName,
            event_name:     ticket?.ev_name ?? 'un evento',
            appstore_link:  'https://apps.apple.com/app/paypac',
            playstore_link: 'https://play.google.com/store/apps/paypac',
          },
        });
      }
 
      // Notificar al remitente que el receptor no está registrado
      const senderUser = await prisma.user.findUnique({
        where: { id: data.from_customer_id },
        select: { id: true, email: true, name: true, last_name: true },
      });
      if (senderUser?.email) {
        await emailService.queueEmail({
          userId: senderUser.id,
          email:  senderUser.email,
          templateCode: 'TICKET_TRANSFER_STATUS',
          variables: {
            sender_name:    `${senderUser.name} ${senderUser.last_name}`,
            recipient_name: data.to_customer_UUID_phone || data.to_customer_uid || 'el receptor',
            event_name:     ticket?.ev_name ?? 'tu evento',
            status:         'PENDING_REGISTRATION',
            wallet_link:    'https://app.paypac.com.co/wallet',
          },
        });
      }
    }
  } catch (emailError: any) {
    console.error('⚠️ Error enviando notificación de transferencia:', emailError.message);
  }
 
  return transaction;
  }

  /**
   * Obtener transacciones pendientes para el usuario autenticado
   */
  async getPendingTransactions(userId: number) {
    return transactionRepo.findPendingForUser(userId);
  }

  /**
   * Obtener historial completo de transacciones del usuario
   */
  async getUserHistory(userId: number) {
    return transactionRepo.findUserHistory(userId);
  }

  /**
   * Obtener historial de un ticket específico
   */
  async getTicketHistory(ticketId: number, userId: number) {
    // Verificar que el usuario tenga permisos para ver el historial
    const ticket = await ticketRepo.findById(ticketId);
    
    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    // Solo el dueño actual puede ver el historial
    if (ticket.customer_id !== userId) {
      throw new Error('No tienes permisos para ver el historial de este ticket');
    }

    return transactionRepo.findByTicket(ticketId);
  }

  /**
   * Aceptar transferencia de ticket
   */
  async acceptTransfer(transactionId: number, userId: number) {
  const transaction = await transactionRepo.findById(transactionId);

  if (!transaction) {
    throw new Error('Transacción no encontrada');
  }

  if (transaction.to_customer_id !== userId) {
    throw new Error('No tienes permisos para aceptar esta transferencia');
  }

  // Solo PENDING o FROZEN
  if (!['PENDING', 'FROZEN'].includes(transaction.status_ticket)) {
    throw new Error(`No se puede aceptar una transferencia con status: ${transaction.status_ticket}`);
  }

  // Si es venta y está congelada, debe pagar primero
  if (transaction.type_transaction === 'sale' && transaction.status_ticket === 'FROZEN') {
    throw new Error('Debes completar el pago antes de aceptar esta transferencia');
  }

  // ── Traspaso real del ticket ─────────────────────────────────────
  // El ticket original de A queda TRANSFERRED (auditoría, desaparece de
  // su wallet) y se genera un ticket NUEVO para B con credenciales nuevas
  // (reference/booking/token/totp) — invalida cualquier QR/TOTP que A
  // tuviera guardado en su dispositivo.
  const originalTicket = await ticketRepo.findById(transaction.ticket_id);
  if (!originalTicket) throw new Error('Ticket no encontrado');

  const recipientUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firebase_uid: true, phone_number: true,
              name: true, last_name: true, num_doc: true, type_doc: true },
  });
  if (!recipientUser) throw new Error('Receptor no encontrado');

  const newTicketData = generateTicketData(recipientUser.phone_number ?? '');

  const [, newTicket, completedTransaction] = await prisma.$transaction([
    // 1. Ticket original → TRANSFERRED
    prisma.ticket.update({
      where: { id: originalTicket.id },
      data: { status_ticket: TicketStatus.TRANSFERRED },
    }),
    // 2. Ticket nuevo para el receptor
    prisma.ticket.create({
      data: {
        transaction_id:           originalTicket.transaction_id,
        event_id:                 originalTicket.event_id,
        customer_id:              recipientUser.id,
        customer_uid:             recipientUser.firebase_uid ?? '',
        customer_ID_phone:        recipientUser.phone_number ?? '',
        reference_ticket:         newTicketData.reference_ticket,
        booking_ticket:           newTicketData.booking_ticket,
        token_ticket:             newTicketData.token_ticket,
        totp_secret:              newTicketData.totp_secret,
        ticket_first_time:        1,
        status_ticket:            TicketStatus.ACTIVE,
        first_name_user:          recipientUser.name,
        last_name_user:           recipientUser.last_name,
        user_num_doc:             recipientUser.num_doc,
        user_type_doc:            recipientUser.type_doc,
        // Snapshot del evento (copiado del original)
        ev_name:                  originalTicket.ev_name,
        ev_short_description:     originalTicket.ev_short_description,
        ev_cover:                 originalTicket.ev_cover,
        ev_date_event:            originalTicket.ev_date_event,
        ev_place_address:         originalTicket.ev_place_address,
        ev_event_type:            originalTicket.ev_event_type,
        ev_type_venue:            originalTicket.ev_type_venue,
        ev_place_seat:            originalTicket.ev_place_seat,
        ev_organizer_id:          originalTicket.ev_organizer_id,
        ev_status:                originalTicket.ev_status,
        // Snapshot de localidad
        loc_id_locality:          originalTicket.loc_id_locality,
        loc_name_locality:        originalTicket.loc_name_locality,
        loc_bkg_color:            originalTicket.loc_bkg_color,
        loc_title_color:          originalTicket.loc_title_color,
        loc_text_color:           originalTicket.loc_text_color,
        loc_title_color_location: originalTicket.loc_title_color_location,
        is_consumable:            originalTicket.is_consumable,
        consumable_total:         originalTicket.consumable_total,
        consumable_used:          originalTicket.consumable_used,
        vip_access:               originalTicket.vip_access,
      },
    }),
    // 3. Transacción → COMPLETED
    prisma.ticketTransaction.update({
      where: { id: transactionId },
      data: { status_ticket: 'COMPLETED', completed_at: new Date() },
    }),
  ]);

  console.log(`🎫 Transferencia ${transactionId}: ticket ${originalTicket.id} → TRANSFERRED, nuevo ticket ${newTicket.id} para user ${recipientUser.id}`);

  // 🔔 Socket.IO — remitente (quitar ticket de su wallet) y receptor (refrescar)
  try {
    io.to(`user:${transaction.from_customer_id}`).emit('ticket:transfer:accepted', {
      transaction_id: transactionId,
      ticket_id:      transaction.ticket_id,
      accepted_by_id: userId,
      timestamp:      new Date().toISOString(),
    });

    io.to(`user:${userId}`).emit('ticket:transfer:completed', {
      transaction_id: transactionId,
      new_ticket_id:  newTicket.id,
      event_name:     originalTicket.ev_name,
      timestamp:      new Date().toISOString(),
    });
  } catch (socketError: any) {
    console.error('⚠️ Error Socket.IO accept:', socketError.message);
  }

  // 📲 FCM push al remitente — independiente del socket
  try {
    const senderFcmToken = await prisma.user.findUnique({
      where: { id: transaction.from_customer_id },
      select: { fcm_token: true },
    });

    if (senderFcmToken?.fcm_token) {
      await pushService.sendTicketTransferAcceptedNotification(
        senderFcmToken.fcm_token,
        {
          recipientName: `${recipientUser.name} ${recipientUser.last_name}`,
          eventName: originalTicket.ev_name,
          transactionId,
          ticketId: transaction.ticket_id,
        }
      );
      console.log('📲 Push de aceptación enviada al remitente');
    } else {
      console.log('ℹ️ Remitente sin fcm_token — push omitida');
    }
  } catch (pushError: any) {
    console.error('⚠️ Error enviando push de aceptación:', pushError.message);
  }
 
  // 📧 Notificar al remitente
  try {
    const { prisma } = await import('../config/db');
    const [sender, recipient, ticket] = await Promise.all([
      prisma.user.findUnique({ where: { id: transaction.from_customer_id }, select: { id: true, name: true, last_name: true, email: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, last_name: true } }),
      prisma.ticket.findUnique({ where: { id: transaction.ticket_id }, select: { ev_name: true } }),
    ]);
 
    if (sender?.email) {
      await emailService.queueEmail({
        userId: sender.id,
        email:  sender.email,
        templateCode: 'TICKET_TRANSFER_STATUS',
        variables: {
          sender_name:    `${sender.name} ${sender.last_name}`,
          recipient_name: recipient ? `${recipient.name} ${recipient.last_name}` : 'el receptor',
          event_name:     ticket?.ev_name ?? 'tu evento',
          status:         'ACCEPTED',
          wallet_link:    'https://app.paypac.com.co/wallet',
        },
      });
    }
  } catch (emailError: any) {
    console.error('⚠️ Error enviando notificación de aceptación:', emailError.message);
  }
 
  return {
    transaction: completedTransaction,
    new_ticket_id: newTicket.id,
    message: 'Transferencia aceptada exitosamente',
  };
}

  /**
   * Rechazar transferencia de ticket
   */
  async rejectTransfer(transactionId: number, userId: number) {
    const transaction = await transactionRepo.findById(transactionId);

    if (!transaction) {
      throw new Error('Transacción no encontrada');
    }

    // Verificar que el usuario sea el receptor
    if (transaction.to_customer_id !== userId) {
      throw new Error('No tienes permisos para rechazar esta transferencia');
    }

    // Verificar que la transacción esté pendiente
    if (!['PENDING', 'FROZEN'].includes(transaction.status_ticket)) {
      throw new Error(`No se puede rechazar una transferencia con status: ${transaction.status_ticket}`);
    }

    // Obtener el ticket
    const ticket = await ticketRepo.findById(transaction.ticket_id);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    // Regresar el ticket al remitente original
   
    await ticketRepo.transferOwnership(
  transaction.ticket_id,
  transaction.from_customer_id,
  transaction.from_customer_uid,
  transaction.from_customer_UUID_phone,
  transaction.from_customer_token,
);
    
// ← agregar aquí
await ticketRepo.updateStatus(transaction.ticket_id, TicketStatus.ACTIVE);

    const canceledTransaction = await transactionRepo.cancel(transactionId);

    // 🔔 Socket.IO — notificar al remitente
try {
  io.to(`user:${transaction.from_customer_id}`).emit('ticket:transfer:rejected', {
    transaction_id: transactionId,
    ticket_id:      transaction.ticket_id,
    rejected_by_id: userId,
    timestamp:      new Date().toISOString(),
  });

  // ✅ AGREGAR: FCM push notification
  const senderFcmToken = await prisma.user.findUnique({
    where: { id: transaction.from_customer_id },
    select: { fcm_token: true },
  });
  
  if (senderFcmToken?.fcm_token) {
    const [recipient, ticket] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, last_name: true } }),
      prisma.ticket.findUnique({ where: { id: transaction.ticket_id }, select: { ev_name: true } }),
    ]);
    
    await pushService.sendTicketTransferRejectedNotification(
      senderFcmToken.fcm_token,
      {
        recipientName: recipient ? `${recipient.name} ${recipient.last_name}` : 'El receptor',
        eventName: ticket?.ev_name ?? 'tu evento',
        transactionId,
        ticketId: transaction.ticket_id,
      }
    );
  }
} catch (socketError: any) {
  console.error('⚠️ Error Socket.IO reject:', socketError.message);
}

 
  // 📧 Notificar al remitente
  try {
    const { prisma } = await import('../config/db');
    const [sender, recipient, ticket] = await Promise.all([
      prisma.user.findUnique({ where: { id: transaction.from_customer_id }, select: { id: true, name: true, last_name: true, email: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, last_name: true } }),
      prisma.ticket.findUnique({ where: { id: transaction.ticket_id }, select: { ev_name: true } }),
    ]);
 
    if (sender?.email) {
      await emailService.queueEmail({
        userId: sender.id,
        email:  sender.email,
        templateCode: 'TICKET_TRANSFER_STATUS',
        variables: {
          sender_name:    `${sender.name} ${sender.last_name}`,
          recipient_name: recipient ? `${recipient.name} ${recipient.last_name}` : 'el receptor',
          event_name:     ticket?.ev_name ?? 'tu evento',
          status:         'REJECTED',
          wallet_link:    'https://app.paypac.com.co/wallet',
        },
      });
    }
  } catch (emailError: any) {
    console.error('⚠️ Error enviando notificación de rechazo:', emailError.message);
  }
 
  return { transaction: canceledTransaction, message: 'Transferencia rechazada. El ticket ha sido devuelto al remitente.' };
 
  }

  /**
   * Obtener transacciones enviadas por el usuario
   */
  async getSentTransactions(userId: number) {
    return transactionRepo.findSentByUser(userId);
  }

  /**
   * Obtener transacciones recibidas por el usuario
   */
  async getReceivedTransactions(userId: number) {
    return transactionRepo.findReceivedByUser(userId);
  }

  /**
   * Contar transacciones pendientes para notificaciones
   */
  async countPendingTransactions(userId: number) {
    return transactionRepo.countPendingForUser(userId);
  }

  /**
   * Obtener detalles de una transacción específica
   */
  async getTransactionById(transactionId: number, userId: number) {
    const transaction = await transactionRepo.findById(transactionId);

    if (!transaction) {
      throw new Error('Transacción no encontrada');
    }

    // Verificar que el usuario esté involucrado en la transacción
    const isInvolved =
      transaction.from_customer_id === userId ||
      transaction.to_customer_id === userId;

    if (!isInvolved) {
      throw new Error('No tienes permisos para ver esta transacción');
    }

    return transaction;
  }

  /**
   * Cancelar transacción pendiente (solo el remitente puede cancelar)
   */
  async cancelTransaction(transactionId: number, userId: number) {
    const transaction = await transactionRepo.findById(transactionId);

    if (!transaction) {
      throw new Error('Transacción no encontrada');
    }

    // Verificar que el usuario sea el remitente
    if (transaction.from_customer_id !== userId) {
      throw new Error('Solo el remitente puede cancelar esta transferencia');
    }

    // Verificar que la transacción esté pendiente
    if (!['PENDING', 'FROZEN'].includes(transaction.status_ticket)) {
      throw new Error(`No se puede cancelar una transferencia con status: ${transaction.status_ticket}`);
    }

    // Obtener el ticket
    const ticket = await ticketRepo.findById(transaction.ticket_id);

    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }

    // Regresar el ticket al remitente
    await ticketRepo.transferOwnership(
  transaction.ticket_id,
  transaction.from_customer_id,
  transaction.from_customer_uid,
  transaction.from_customer_UUID_phone,
  transaction.from_customer_token,
)
   
// ← agregar aquí
await ticketRepo.updateStatus(transaction.ticket_id, TicketStatus.ACTIVE);

    // Cancelar la transacción
    const canceledTransaction = await transactionRepo.cancel(transactionId);

    return {
      transaction: canceledTransaction,
      message: 'Transferencia cancelada exitosamente',
    };
  }

  /**
   * FASE 2: Procesar pago de una venta de ticket
   * Se llamará desde el webhook de Wompi cuando se confirme el pago
   */
  async processPayment(transactionId: number, paymentData: any) {
    const transaction = await transactionRepo.findById(transactionId);

    if (!transaction) {
      throw new Error('Transacción no encontrada');
    }

    // Verificar que sea una venta
    if (transaction.type_transaction !== 'sale') {
      throw new Error('Esta transacción no es una venta');
    }

    // Verificar que esté en estado FROZEN
    if (transaction.status_ticket !== 'FROZEN') {
      throw new Error(`No se puede procesar el pago para una transacción con status: ${transaction.status_ticket}`);
    }

    // TODO: Validar el pago con Wompi
    // TODO: Actualizar el balance del vendedor
    // TODO: Aplicar comisiones

    // Cambiar a PAID
    const paidTransaction = await transactionRepo.updateStatus(transactionId, 'PAID');

    return {
      transaction: paidTransaction,
      message: 'Pago procesado exitosamente',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
// 1. tickettransaction.service.ts — agregar método sendTransfer()
// ═══════════════════════════════════════════════════════════════════════════
 
async sendTransfer(
  senderId: number,
  data: {
    ticket_id:             number;
    contact:               string; // email o celular del destinatario
    type_transaction:      'transfer' | 'sale' | 'gift';
    transaction_description?: string;
  }
) {
  //const { prisma } = await import('../config/db');
 
  // 1. Verificar que el ticket existe y pertenece al remitente
  const ticket = await ticketRepo.findById(data.ticket_id);
  if (!ticket) throw new Error('Ticket no encontrado');
  if (ticket.customer_id !== senderId)
    throw new Error('Este ticket no te pertenece');
  if (!['ACTIVE', 'PAID'].includes(ticket.status_ticket))
    throw new Error(`No puedes transferir un ticket con estado: ${ticket.status_ticket}`);
 
  // 2. Obtener datos del remitente
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { id: true, name: true, last_name: true, email: true,
              firebase_uid: true, phone_number: true },
  });
  if (!sender) throw new Error('Remitente no encontrado');
 
  // 3. Buscar destinatario por email o celular
  const recipient = await prisma.user.findFirst({
    where: {
      OR: [
        { email:        { equals: data.contact, mode: 'insensitive' } },
        { phone_number: data.contact },
      ],
    },
    select: { id: true, name: true, last_name: true,
              email: true, firebase_uid: true, phone_number: true },
  });
 
  const isRegistered = !!recipient;
 
  // 4. Congelar el ticket
  await ticketRepo.updateStatus(data.ticket_id, 'FROZEN' as any);
 
  // 5. Crear la transacción
  const crypto = await import('crypto');
  const newToken = crypto.randomBytes(32).toString('hex');
 
  const transaction = await transactionRepo.create({
    ticket_id:               data.ticket_id,
    from_customer_id:        senderId,
    from_customer_token:     ticket.token_ticket,
    from_customer_uid:       sender.firebase_uid ?? '',
    from_customer_UUID_phone: sender.phone_number ?? '',
    reference_ticket:        ticket.reference_ticket,
    booking_ticket:          ticket.booking_ticket,
    to_customer_id:          isRegistered ? recipient!.id : senderId, // placeholder si no registrado
    to_customer_token:       newToken,
    to_customer_uid:         isRegistered ? (recipient!.firebase_uid ?? '') : data.contact,
    to_customer_UUID_phone:  isRegistered ? (recipient!.phone_number ?? '') : data.contact,
    type_transaction:        data.type_transaction,
    ev_name:                 ticket.ev_name,
    transaction_description: data.transaction_description ?? '',
  });
 
  // 6. Socket.IO — solo si está registrado
  try {
    const { io } = await import('../index');
    const senderName = `${sender.name} ${sender.last_name}`;

    if (isRegistered) {
      io.to(`user:${recipient!.id}`).emit('ticket:received', {
        transaction_id:   transaction.id,
        from_user_id:     senderId,
        ticket_id:        data.ticket_id,
        transaction_type: data.type_transaction,
        message:          data.transaction_description ?? '',
        timestamp:        new Date().toISOString(),
      });

      // ✅ AGREGAR: FCM push notification para receptor registrado
    const recipientFcmToken = await prisma.user.findUnique({
      where: { id: recipient!.id },
      select: { fcm_token: true },
    });
    
    if (recipientFcmToken?.fcm_token) {
      await pushService.sendTicketTransferReceivedNotification(
        recipientFcmToken.fcm_token,
        {
          fromUserName: senderName,
          eventName: ticket.ev_name,
          transactionId: transaction.id,
          ticketId: data.ticket_id,
        }
      );
    }

    }
  } catch (socketError: any) {
    console.error('⚠️ Socket.IO transfer error:', socketError.message);
  }
 
  // 7. Email — según si está registrado o no
  try {
    const eventDate = ticket.ev_date_event
      ? new Date(ticket.ev_date_event).toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' })
      : '';
    const senderName = `${sender.name} ${sender.last_name}`; 
 
    if (isRegistered && recipient!.email) {
      await emailService.queueEmail({
        userId: recipient!.id,
        email:  recipient!.email,
        templateCode: 'TICKET_TRANSFER_RECEIVED',
        variables: {
          recipient_name:  `${recipient!.name} ${recipient!.last_name}`,
          sender_name:     senderName,
          sender_message:  data.transaction_description ?? '',
          event_name:      ticket.ev_name,
          event_image:     ticket.ev_cover,
          event_date:      eventDate,
          event_address:   ticket.ev_place_address,
          locality_name:   ticket.loc_name_locality,
          wallet_link:     'https://app.paypac.com.co/wallet',
        },
      });
    } else if (data.contact.includes('@')) {
      // No registrado — enviar a su email
      await emailService.queueEmail({
        userId: senderId,
        email:  data.contact,
        templateCode: 'TICKET_TRANSFER_RECEIVED_UNREGISTERED',
        variables: {
          sender_name:    senderName,
          event_name:     ticket.ev_name,
          appstore_link:  'https://apps.apple.com/app/paypac',
          playstore_link: 'https://play.google.com/store/apps/paypac',
        },
      });
 
      // Notificar al remitente que el destinatario no está registrado
      if (sender.email) {
        await emailService.queueEmail({
          userId: senderId,
          email:  sender.email,
          templateCode: 'TICKET_TRANSFER_STATUS',
          variables: {
            sender_name:    senderName,
            recipient_name: data.contact,
            event_name:     ticket.ev_name,
            status:         'PENDING_REGISTRATION',
            wallet_link:    'https://app.paypac.com.co/wallet',
          },
        });
      }
    }
  } catch (emailError: any) {
    console.error('⚠️ Email transfer error:', emailError.message);
  }
 
  return {
    transaction,
    is_registered: isRegistered,
    message: isRegistered
      ? 'Ticket enviado. El destinatario tiene 30 minutos para aceptarlo.'
      : 'El destinatario no está registrado en PayPac. Le enviamos un mensaje para que descargue la app. El ticket estará reservado 48 horas.',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. tickettransaction.service.ts — agregar método acceptByContact()
//    Se llama al registrarse un nuevo usuario — busca transferencias pendientes
// ═══════════════════════════════════════════════════════════════════════════
 
async acceptByContact(userId: number, contact: string) {
  const { prisma } = await import('../config/db');
 
  // Buscar transacciones pendientes donde el contacto coincide
  const pendingTransactions = await prisma.ticketTransaction.findMany({
    where: {
      status_ticket: 'PENDING',
      OR: [
        { to_customer_uid:       { equals: contact, mode: 'insensitive' } },
        { to_customer_UUID_phone: contact },
      ],
    },
  });
 
  if (pendingTransactions.length === 0) return { updated: 0, transactions: [] };
 
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firebase_uid: true, phone_number: true },
  });
 
  const results = [];
  for (const tx of pendingTransactions) {
    try {
      // Actualizar to_customer_id con el usuario real
      await prisma.ticketTransaction.update({
        where: { id: tx.id },
        data: {
          to_customer_id:          userId,
          to_customer_uid:         user?.firebase_uid ?? '',
          to_customer_UUID_phone:  user?.phone_number ?? '',
        },
      });
 
      // Socket.IO — ahora sí tiene room
      try {
        const { io } = await import('../index');
        io.to(`user:${userId}`).emit('ticket:received', {
          transaction_id:   tx.id,
          from_user_id:     tx.from_customer_id,
          ticket_id:        tx.ticket_id,
          transaction_type: tx.type_transaction,
          message:          tx.transaction_description,
          timestamp:        new Date().toISOString(),
        });
      } catch {}
 
      results.push(tx.id);
    } catch (err: any) {
      console.error(`⚠️ Error actualizando tx ${tx.id}:`, err.message);
    }
  }
 
  return { updated: results.length, transaction_ids: results };
}

}
