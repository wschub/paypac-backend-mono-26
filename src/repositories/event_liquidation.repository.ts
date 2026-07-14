import { prisma } from '../config/db';
import { Prisma, EventLiquidationStatus } from '@prisma/client';

export class EventLiquidationRepository {

  async create(data: Prisma.EventLiquidationUncheckedCreateInput) {
    return prisma.eventLiquidation.create({
      data,
      include: { company: true, event: true },
    });
  }

  async findAll(filters?: {
    company_id?: number;
    event_id?: number;
    status?: EventLiquidationStatus;
    from?: Date;
    to?: Date;
  }) {
    const where: Prisma.EventLiquidationWhereInput = {};
    if (filters?.company_id) where.company_id = filters.company_id;
    if (filters?.event_id)   where.event_id   = filters.event_id;
    if (filters?.status)     where.status      = filters.status;
    if (filters?.from || filters?.to) {
      where.liquidation_date = {
        ...(filters.from && { gte: filters.from }),
        ...(filters.to   && { lte: filters.to   }),
      };
    }
    return prisma.eventLiquidation.findMany({
      where,
      include: { company: true, event: { select: { id: true, name: true, date_event: true } } },
      orderBy: { liquidation_date: 'desc' },
    });
  }

  async findById(id: number) {
    return prisma.eventLiquidation.findUnique({
      where: { id },
      include: { company: true, event: true },
    });
  }

  async findByNumLiquidation(num_liquidation: string) {
    return prisma.eventLiquidation.findUnique({
      where: { num_liquidation },
      include: { company: true, event: true },
    });
  }

  async update(id: number, data: Prisma.EventLiquidationUpdateInput) {
    return prisma.eventLiquidation.update({
      where: { id },
      data,
      include: { company: true, event: true },
    });
  }

  async updateStatus(id: number, status: EventLiquidationStatus, paid_at?: Date) {
    return prisma.eventLiquidation.update({
      where: { id },
      data: {
        status,
        ...(status === 'PAID' && { paid_at: paid_at ?? new Date() }),
      },
    });
  }

  async delete(id: number) {
    return prisma.eventLiquidation.delete({ where: { id } });
  }

  async generateNumLiquidation(): Promise<string> {
    // Basado en el máximo existente, no en count() — count() choca si alguna
    // liquidación se borró en el medio (deja huecos que count()+1 repite).
    const last = await prisma.eventLiquidation.findFirst({
      orderBy: { id: 'desc' },
      select: { num_liquidation: true },
    });
    const lastNum = last ? parseInt(last.num_liquidation.replace('LIQ-', ''), 10) || 0 : 0;
    return `LIQ-${String(lastNum + 1).padStart(4, '0')}`;
  }

  async sumByCompany(company_id: number, from?: Date, to?: Date) {
    const where: Prisma.EventLiquidationWhereInput = { company_id };
    if (from || to) {
      where.liquidation_date = {
        ...(from && { gte: from }),
        ...(to   && { lte: to   }),
      };
    }
    return prisma.eventLiquidation.aggregate({
      where,
      _sum: { gross_amount: true, net_amount: true, paypac_commission: true, refunds: true },
    });
  }
}