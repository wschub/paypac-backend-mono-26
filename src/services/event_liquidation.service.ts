import { EventLiquidationRepository } from '../repositories/event_liquidation.repository';
import { EventRepository } from '../repositories/event.repository';
import { Prisma, EventLiquidationStatus } from '@prisma/client';

const liquidationRepo = new EventLiquidationRepository();
const eventRepo       = new EventRepository();

export class EventLiquidationService {

  async createLiquidation(data: {
    company_id: number;
    event_id: number;
    gross_amount: number;
    paypac_commission: number;
    promoter_commission?: number;
    refunds?: number;
    liquidation_date: Date;
  }, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede crear liquidaciones');

    const event = await eventRepo.findById(data.event_id);
    if (!event) throw new Error('Evento no encontrado');

    const num_liquidation = await liquidationRepo.generateNumLiquidation();
    const net_amount =
      data.gross_amount
      - data.paypac_commission
      - (data.promoter_commission ?? 0)
      - (data.refunds ?? 0);

    return liquidationRepo.create({
      ...data,
      num_liquidation,
      net_amount,
      promoter_commission: data.promoter_commission ?? 0,
      refunds: data.refunds ?? 0,
    });
  }

  async getLiquidations(filters: {
    company_id?: number;
    event_id?: number;
    status?: EventLiquidationStatus;
    from?: Date;
    to?: Date;
  }, userRole: string, userId: number) {
    // ORGANIZER solo ve las suyas — se aplica company_id desde el token en el controller
    return liquidationRepo.findAll(filters);
  }

  async getLiquidationById(id: number, userRole: string, companyId?: number) {
    const liq = await liquidationRepo.findById(id);
    if (!liq) throw new Error('Liquidación no encontrada');

    if (userRole === 'ORGANIZER' && liq.company_id !== companyId)
      throw new Error('No tienes permisos para ver esta liquidación');

    return liq;
  }

  async updateStatus(id: number, status: EventLiquidationStatus, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede actualizar el estado');
    const liq = await liquidationRepo.findById(id);
    if (!liq) throw new Error('Liquidación no encontrada');
    return liquidationRepo.updateStatus(id, status);
  }

  async getMyBalance(companyId: number, from?: Date, to?: Date) {
    const summary = await liquidationRepo.sumByCompany(companyId, from, to);
    const pending = await liquidationRepo.findAll({ company_id: companyId, status: 'PENDING' });
    const overdue = await liquidationRepo.findAll({ company_id: companyId, status: 'OVERDUE' });

    return {
      total_gross:      summary._sum.gross_amount      ?? 0,
      total_net:        summary._sum.net_amount        ?? 0,
      total_commission: summary._sum.paypac_commission ?? 0,
      total_refunds:    summary._sum.refunds           ?? 0,
      available:        pending.reduce((a, l) => a + l.net_amount, 0),
      overdue_amount:   overdue.reduce((a, l) => a + l.net_amount, 0),
      pending_count:    pending.length,
      overdue_count:    overdue.length,
    };
  }

  async deleteLiquidation(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede eliminar liquidaciones');
    const liq = await liquidationRepo.findById(id);
    if (!liq) throw new Error('Liquidación no encontrada');
    return liquidationRepo.delete(id);
  }

  // ─── Auto-crear liquidación al finalizar evento ───────────────────────────────

async autoCreateFromEvent(event_id: number): Promise<void> {
  const { prisma } = await import('../config/db');

  // Verificar que no exista ya una liquidación para este evento
  const existing = await liquidationRepo.findAll({ event_id });
  if (existing.length > 0) {
    console.log(`⚠️ Ya existe liquidación para evento ${event_id} — omitiendo`);
    return;
  }

  const event = await eventRepo.findById(event_id);
  if (!event) throw new Error(`Evento ${event_id} no encontrado`);

  // Obtener company_id desde el organizador
  const organizer = await prisma.user.findUnique({
    where: { id: event.organizer_id },
    select: { company_id: true },
  });
  if (!organizer?.company_id) {
    console.error(`⚠️ Organizador del evento ${event_id} no tiene empresa asignada`);
    return;
  }

  // Calcular desde Invoice
  const invoiceAgg = await prisma.invoice.aggregate({
    where: { event_id, status: 'PAID' },
    _sum: {
      total:                      true,
      paypac_commission_amount:   true,
      promoter_commission_amount: true,
      refunded_amount:            true,
    },
  });

  const gross_amount        = invoiceAgg._sum.total                      ?? 0;
  const paypac_commission   = invoiceAgg._sum.paypac_commission_amount   ?? 0;
  const promoter_commission = invoiceAgg._sum.promoter_commission_amount ?? 0;
  const refunds             = invoiceAgg._sum.refunded_amount            ?? 0;
  const net_amount          = gross_amount - paypac_commission - promoter_commission - refunds;

  const num_liquidation = await liquidationRepo.generateNumLiquidation();

  await liquidationRepo.create({
    company_id:          organizer.company_id,
    event_id,
    num_liquidation,
    gross_amount,
    paypac_commission,
    promoter_commission,
    refunds,
    net_amount,
    status:              'PENDING',
    liquidation_date:    new Date(),
  });

  console.log(`✅ Liquidación ${num_liquidation} creada automáticamente para evento ${event_id}`);
}

}