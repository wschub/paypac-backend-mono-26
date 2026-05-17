import { TicketConsumptionRepository } from '../repositories/ticket_consumption.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { prisma } from '../prisma/client';

const consumptionRepo = new TicketConsumptionRepository();
const ticketRepo      = new TicketRepository();

export class TicketConsumptionService {

  async registerConsumption(
    ticketId: number,
    amount: number,
    description: string | undefined,
    staffId: number
  ) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new Error('Ticket no encontrado');

    if (!(ticket as any).is_consumable) {
      throw new Error('Este ticket no es de tipo consumible');
    }

    if (!['PAID', 'ACTIVE'].includes(ticket.status_ticket)) {
      throw new Error(`El ticket no está activo. Status: ${ticket.status_ticket}`);
    }

    const total     = (ticket as any).consumable_total as number;
    const used      = (ticket as any).consumable_used  as number;
    const remaining = total - used;

    if (amount <= 0) throw new Error('El monto debe ser mayor a 0');
    if (amount > remaining) {
      throw new Error(`Saldo insuficiente. Disponible: $${remaining.toLocaleString('es-CO')}`);
    }

    const [consumption] = await prisma.$transaction([
      prisma.ticketConsumption.create({
        data: { ticket_id: ticketId, amount, description, consumed_by_id: staffId },
      }),
      prisma.ticket.update({
        where: { id: ticketId },
        data: { consumable_used: { increment: amount } },
      }),
    ]);

    return {
      consumption,
      balance: { total, used: used + amount, remaining: remaining - amount },
    };
  }

  async getHistory(ticketId: number, requesterId: number, requesterRole: string) {
    const ticket = await ticketRepo.findById(ticketId);
    if (!ticket) throw new Error('Ticket no encontrado');

    const isOwner = ticket.customer_id === requesterId;
    const isStaff = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER'].includes(requesterRole);
    if (!isOwner && !isStaff) throw new Error('No tienes permisos para ver este historial');

    if (!(ticket as any).is_consumable) {
      throw new Error('Este ticket no es de tipo consumible');
    }

    const consumptions = await consumptionRepo.findByTicketId(ticketId);
    const total        = (ticket as any).consumable_total as number;
    const used         = (ticket as any).consumable_used  as number;

    return {
      balance: { total, used, remaining: total - used },
      consumptions,
    };
  }
}
