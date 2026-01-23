import { TicketTransactionRepository } from '../repositories/tickettransaction.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { Prisma } from '@prisma/client';

const transactionRepo = new TicketTransactionRepository();
const ticketRepo = new TicketRepository();

export class TicketTransactionService {
  /**
   * Crear un registro de transacción (auditoría)
   */
  async createTransaction(data: Prisma.TicketTransactionUncheckedCreateInput) {
    return transactionRepo.create(data);
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

  return {
    transaction: completedTransaction,
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
    await ticketRepo.update(transaction.ticket_id, {
      customer_id: transaction.from_customer_id,
      customer_uid: transaction.from_customer_uid,
      customer_ID_phone: transaction.from_customer_UUID_phone,
      token_ticket: transaction.from_customer_token, // Restaurar token anterior
      status_ticket: 'ACTIVE',
    });

    // Cancelar la transacción
    const canceledTransaction = await transactionRepo.cancel(transactionId);

    return {
      transaction: canceledTransaction,
      message: 'Transferencia rechazada. El ticket ha sido devuelto al remitente.',
    };
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
    await ticketRepo.update(transaction.ticket_id, {
      customer_id: transaction.from_customer_id,
      customer_uid: transaction.from_customer_uid,
      customer_ID_phone: transaction.from_customer_UUID_phone,
      token_ticket: transaction.from_customer_token,
      status_ticket: 'ACTIVE',
    });

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
