import { prisma } from '../config/db';
import { Ticket, Prisma } from '@prisma/client';

export class TicketRepository {
  /**
   * Crear un nuevo ticket
   */
  async create(data: Prisma.TicketUncheckedCreateInput): Promise<Ticket> {
    return prisma.ticket.create({
      data,
    });
  }

  /**
   * Crear múltiples tickets en batch (compra múltiple)
   */
  async createMany(data: Prisma.TicketUncheckedCreateInput[]): Promise<number> {
    const result = await prisma.ticket.createMany({
      data,
      skipDuplicates: true,
    });
    return result.count;
  }

  /**
   * Buscar ticket por ID
   */
  async findById(id: number): Promise<Ticket | null> {
    return prisma.ticket.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar ticket por reference_ticket
   */
  async findByReference(referenceTicket: string): Promise<Ticket | null> {
    return prisma.ticket.findFirst({
      where: { reference_ticket: referenceTicket },
    });
  }

  /**
   * Buscar ticket por token_ticket (validación en entrada)
   */
  async findByToken(tokenTicket: string): Promise<Ticket | null> {
    return prisma.ticket.findFirst({
      where: { token_ticket: tokenTicket },
    });
  }

  /**
   * Buscar todos los tickets de un usuario (Wallet)
   */
  async findByCustomer(customerId: number): Promise<Ticket[]> {
    return prisma.ticket.findMany({
      where: { customer_id: customerId },
      orderBy: { ev_date_event: 'asc' },
    });
  }

  /**
   * Buscar tickets por evento
   */
  async findByEvent(eventId: number): Promise<Ticket[]> {
    return prisma.ticket.findMany({
      where: { event_id: eventId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Buscar tickets por transaction_id
   */
  async findByTransaction(transactionId: number): Promise<Ticket[]> {
    return prisma.ticket.findMany({
      where: { transaction_id: transactionId },
    });
  }

  /**
   * Actualizar ticket (principalmente para transferencias)
   */
  async update(id: number, data: Prisma.TicketUpdateInput): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data,
    });
  }

  /**
   * Marcar ticket como usado
   */
  async markAsUsed(id: number): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data: {
        ticket_first_time: 0,
        status_ticket: 'USED',
        used_at: new Date(),
      },
    });
  }

  /**
   * Actualizar dueño del ticket (transferencia)
   */
  async transferOwnership(
    id: number,
    newCustomerId: number,
    newCustomerUid: string,
    newCustomerIdPhone: string,
    newTokenTicket: string
  ): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data: {
        customer_id: newCustomerId,
        customer_uid: newCustomerUid,
        customer_ID_phone: newCustomerIdPhone,
        token_ticket: newTokenTicket,
        status_ticket: 'TRANSFERRED',
      },
    });
  }

  /**
   * Actualizar status del ticket
   */
  async updateStatus(id: number, status: string): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data: { status_ticket: status },
    });
  }

  /**
   * Verificar si un ticket existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.ticket.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Verificar si un reference_ticket ya existe
   */
  async referenceExists(referenceTicket: string): Promise<boolean> {
    const count = await prisma.ticket.count({
      where: { reference_ticket: referenceTicket },
    });
    return count > 0;
  }

  /**
   * Contar tickets por usuario
   */
  async countByCustomer(customerId: number): Promise<number> {
    return prisma.ticket.count({
      where: { customer_id: customerId },
    });
  }

  /**
   * Contar tickets por evento y status
   */
  async countByEventAndStatus(eventId: number, status: string): Promise<number> {
    return prisma.ticket.count({
      where: {
        event_id: eventId,
        status_ticket: status,
      },
    });
  }

  /**
   * Buscar tickets próximos a vencer (para notificaciones)
   */
  async findUpcoming(customerId: number, daysAhead: number = 7): Promise<Ticket[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    return prisma.ticket.findMany({
      where: {
        customer_id: customerId,
        ev_date_event: {
          gte: now,
          lte: futureDate,
        },
        status_ticket: {
          in: ['PAID', 'ACTIVE'],
        },
      },
      orderBy: { ev_date_event: 'asc' },
    });
  }

  /**
   * Eliminar ticket (soft delete - cambiar status a CANCELED)
   */
  async softDelete(id: number): Promise<Ticket> {
    return prisma.ticket.update({
      where: { id },
      data: {
        status_ticket: 'CANCELED',
      },
    });
  }

  /**
   * Eliminar ticket permanentemente (solo para testing o admin)
   */
  async delete(id: number): Promise<Ticket> {
    return prisma.ticket.delete({
      where: { id },
    });
  }
}
