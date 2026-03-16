import { TicketTransactionRepository } from '../repositories/tickettransaction.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { Prisma } from '@prisma/client';
import { TicketStatus } from '@prisma/client';
import { NotificationMessageQueueService } from './notificationmessagequeue.service';
import { io } from '../index';

const transactionRepo = new TicketTransactionRepository();
const ticketRepo = new TicketRepository();
const emailService = new NotificationMessageQueueService();

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

    const completedTransaction = await transactionRepo.complete(transactionId);

    // 🔔 Socket.IO — notificar al remitente
try {
  io.to(`user:${transaction.from_customer_id}`).emit('ticket:transfer:accepted', {
    transaction_id: transactionId,
    ticket_id:      transaction.ticket_id,
    accepted_by_id: userId,
    timestamp:      new Date().toISOString(),
  });
} catch (socketError: any) {
  console.error('⚠️ Error Socket.IO accept:', socketError.message);
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
 
  return { transaction: completedTransaction, message: 'Transferencia aceptada exitosamente' };
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
}
