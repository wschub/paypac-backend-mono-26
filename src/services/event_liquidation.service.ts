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
}