import { prisma } from '../prisma/client';

export class TicketConsumptionRepository {
  async create(data: {
    ticket_id: number;
    amount: number;
    description?: string;
    consumed_by_id: number;
  }) {
    return prisma.ticketConsumption.create({ data });
  }

  async findByTicketId(ticket_id: number) {
    return prisma.ticketConsumption.findMany({
      where: { ticket_id },
      orderBy: { consumed_at: 'desc' },
      include: {
        consumed_by: { select: { id: true, name: true, last_name: true } },
      },
    });
  }

  async sumByTicketId(ticket_id: number): Promise<number> {
    const result = await prisma.ticketConsumption.aggregate({
      where: { ticket_id },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }
}
