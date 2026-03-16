import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class PromoterCodeRepository {

  async create(data: Prisma.PromoterCodeUncheckedCreateInput) {
    return prisma.promoterCode.create({
      data,
      include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
    });
  }

  async findByCode(code: string) {
    return prisma.promoterCode.findUnique({
      where: { code },
      include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
    });
  }

  async findById(id: number) {
    return prisma.promoterCode.findUnique({
      where: { id },
      include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
    });
  }

  async findByPromoter(promoter_id: number) {
    return prisma.promoterCode.findFirst({
      where: { promoter_id },
      include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
    });
  }

  async findAll(filters?: { is_active?: boolean; promoter_id?: number }) {
    return prisma.promoterCode.findMany({
      where: {
        ...(filters?.is_active !== undefined && { is_active: filters.is_active }),
        ...(filters?.promoter_id && { promoter_id: filters.promoter_id }),
      },
      include: {
        promoter: { select: { id: true, name: true, last_name: true, email: true } },
        _count: { select: { invoices: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, data: Prisma.PromoterCodeUpdateInput) {
    return prisma.promoterCode.update({
      where: { id },
      data,
      include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
    });
  }

  async incrementUses(code: string) {
    return prisma.promoterCode.update({
      where: { code },
      data: { uses_count: { increment: 1 } },
    });
  }

  async codeExists(code: string): Promise<boolean> {
    const count = await prisma.promoterCode.count({ where: { code } });
    return count > 0;
  }

  async delete(id: number) {
    return prisma.promoterCode.delete({ where: { id } });
  }

  // Stats de un promotor — total ventas y comisiones acumuladas
  async getPromoterStats(promoter_id: number) {
    const code = await this.findByPromoter(promoter_id);
    if (!code) return null;

    const invoiceAgg = await prisma.invoice.aggregate({
      where: { promoter_code_id: code.id, status: 'PAID' },
      _sum:   { total: true, promoter_commission_amount: true },
      _count: { id: true },
    });

    return {
      code:              code.code,
      uses_count:        code.uses_count,
      total_sales:       invoiceAgg._sum.total                     ?? 0,
      total_commission:  invoiceAgg._sum.promoter_commission_amount ?? 0,
      total_invoices:    invoiceAgg._count.id                       ?? 0,
    };
  }
}