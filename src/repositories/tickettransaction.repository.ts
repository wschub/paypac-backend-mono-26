import { prisma } from '../config/db';
import { TicketTransaction, Prisma } from '@prisma/client';

export class TicketTransactionRepository {
  /**
   * Crear una nueva transacción de ticket
   */
  async create(data: Prisma.TicketTransactionUncheckedCreateInput): Promise<TicketTransaction> {
    return prisma.ticketTransaction.create({
      data,
    });
  }

  /**
   * Buscar transacción por ID
   */
  async findById(id: number): Promise<TicketTransaction | null> {
    return prisma.ticketTransaction.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar transacciones por ticket_id
   */
  async findByTicket(ticketId: number): Promise<TicketTransaction[]> {
    return prisma.ticketTransaction.findMany({
      where: { ticket_id: ticketId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Buscar transacciones pendientes para un usuario (receptor)
   */
  async findPendingForUser(userId: number): Promise<TicketTransaction[]> {
    return prisma.ticketTransaction.findMany({
      where: {
        to_customer_id: userId,
        status_ticket: {
          in: ['PENDING', 'FROZEN'],
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Buscar historial de transacciones de un usuario (enviadas y recibidas)
   */
  async findUserHistory(userId: number): Promise<TicketTransaction[]> {
    return prisma.ticketTransaction.findMany({
      where: {
        OR: [
          { from_customer_id: userId },
          { to_customer_id: userId },
        ],
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Buscar transacciones enviadas por un usuario
   */
  async findSentByUser(userId: number): Promise<TicketTransaction[]> {
    return prisma.ticketTransaction.findMany({
      where: { from_customer_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Buscar transacciones recibidas por un usuario
   */
  async findReceivedByUser(userId: number): Promise<TicketTransaction[]> {
    return prisma.ticketTransaction.findMany({
      where: { to_customer_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Actualizar transacción
   */
  async update(id: number, data: Prisma.TicketTransactionUpdateInput): Promise<TicketTransaction> {
    return prisma.ticketTransaction.update({
      where: { id },
      data,
    });
  }

  /**
   * Actualizar status de la transacción
   */
  async updateStatus(id: number, status: string): Promise<TicketTransaction> {
    return prisma.ticketTransaction.update({
      where: { id },
      data: { status_ticket: status },
    });
  }

  /**
   * Completar transacción
   */
  async complete(id: number): Promise<TicketTransaction> {
    return prisma.ticketTransaction.update({
      where: { id },
      data: {
        status_ticket: 'COMPLETED',
        completed_at: new Date(),
      },
    });
  }

  /**
   * Cancelar transacción
   */
  async cancel(id: number): Promise<TicketTransaction> {
    return prisma.ticketTransaction.update({
      where: { id },
      data: {
        status_ticket: 'CANCELLED',
      },
    });
  }

  /**
   * Verificar si existe una transacción
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.ticketTransaction.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar transacciones pendientes de un usuario
   */
  async countPendingForUser(userId: number): Promise<number> {
    return prisma.ticketTransaction.count({
      where: {
        to_customer_id: userId,
        status_ticket: {
          in: ['PENDING', 'FROZEN'],
        },
      },
    });
  }

  /**
   * Buscar transacciones por tipo
   */
  async findByType(type: string): Promise<TicketTransaction[]> {
    return prisma.ticketTransaction.findMany({
      where: { type_transaction: type },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Eliminar transacción (solo para admin/testing)
   */
  async delete(id: number): Promise<TicketTransaction> {
    return prisma.ticketTransaction.delete({
      where: { id },
    });
  }
}
