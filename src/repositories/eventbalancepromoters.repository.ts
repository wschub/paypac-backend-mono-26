import { prisma } from '../config/db';
import { EventBalancePromoters, Prisma } from '@prisma/client';

export class EventBalancePromotersRepository {
  /**
   * Crear un nuevo balance
   */
  async create(data: Prisma.EventBalancePromotersUncheckedCreateInput): Promise<EventBalancePromoters> {
    return prisma.eventBalancePromoters.create({
      data,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date_event: true,
            status: true,
          },
        },
        promoter: {
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            phone_number: true,
          },
        },
        rewardRule: true,
      },
    });
  }

  /**
   * Obtener todos los balances de un evento
   */
  async findByEventId(eventId: number) {
    return prisma.eventBalancePromoters.findMany({
      where: { event_id: eventId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date_event: true,
          },
        },
        promoter: {
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
          },
        },
        rewardRule: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener todos los balances de un promotor
   */
  async findByPromoterId(promoterId: number): Promise<EventBalancePromoters[]> {
    return prisma.eventBalancePromoters.findMany({
      where: { promoter_id: promoterId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date_event: true,
            status: true,
          },
        },
        rewardRule: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar balance por ID
   */
  async findById(id: number): Promise<EventBalancePromoters | null> {
    return prisma.eventBalancePromoters.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            organizer_id: true,
            date_event: true,
            status: true,
          },
        },
        promoter: {
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
            phone_number: true,
          },
        },
        rewardRule: true,
      },
    });
  }

  /**
   * Obtener balances por estado
   */
  async findByStatus(status: number): Promise<EventBalancePromoters[]> {
    return prisma.eventBalancePromoters.findMany({
      where: { status },
      include: {
        event: true,
        promoter: {
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener balances pendientes de un evento
   */
  async findPendingByEventId(eventId: number): Promise<EventBalancePromoters[]> {
    return prisma.eventBalancePromoters.findMany({
      where: {
        event_id: eventId,
        status: 0, // PENDING
      },
      include: {
        promoter: {
          select: {
            id: true,
            name: true,
            last_name: true,
            email: true,
          },
        },
        rewardRule: true,
      },
    });
  }

  /**
   * Actualizar balance
   */
  async update(
    id: number,
    data: Prisma.EventBalancePromotersUpdateInput
  ): Promise<EventBalancePromoters> {
    return prisma.eventBalancePromoters.update({
      where: { id },
      data,
      include: {
        event: true,
        promoter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        rewardRule: true,
      },
    });
  }

  /**
   * Actualizar múltiples balances (para marcar como pagado en lote)
   */
  async updateMany(
    ids: number[],
    data: Prisma.EventBalancePromotersUpdateInput
  ): Promise<number> {
    const result = await prisma.eventBalancePromoters.updateMany({
      where: {
        id: { in: ids },
      },
      data,
    });
    return result.count;
  }

  /**
   * Eliminar balance
   */
  async delete(id: number): Promise<EventBalancePromoters> {
    return prisma.eventBalancePromoters.delete({
      where: { id },
    });
  }

  /**
   * Calcular total de balances por promotor y estado
   */
  async calculateTotalsByPromoter(promoterId: number) {
    const balances = await this.findByPromoterId(promoterId);

    const pending = balances
      .filter(b => b.status === 0)
      .reduce((sum, b) => sum + (b.reward_amount || 0), 0);

    const paid = balances
      .filter(b => b.status === 1)
      .reduce((sum, b) => sum + (b.reward_amount || 0), 0);

    const canceled = balances
      .filter(b => b.status === 2)
      .reduce((sum, b) => sum + (b.reward_amount || 0), 0);

    return {
      total_pending: pending,
      total_paid: paid,
      total_canceled: canceled,
      total_all: pending + paid,
    };
  }

  /**
   * Asignar fecha de corte a balances pendientes de un evento
   */
  async assignCutoffDate(
    eventId: number,
    expirationDate: Date
  ): Promise<number> {
    const result = await prisma.eventBalancePromoters.updateMany({
      where: {
        event_id: eventId,
        status: 0, // Solo PENDING
        expiration_date: null, // Solo si aún no tiene fecha asignada
      },
      data: {
        expiration_date: expirationDate,
        updatedAt: new Date(),
      },
    });
    return result.count;
  }

  /**
   * Obtener estadísticas de balances por evento
   */
  async getEventBalanceStats(eventId: number) {
    const balances = await this.findByEventId(eventId);

    // Agrupar por promotor
    const byPromoter = balances.reduce((acc, balance) => {
      const promoterId = balance.promoter_id;
      if (!acc[promoterId]) {
        acc[promoterId] = {
          promoter: balance.promoter,
          total_pending: 0,
          total_paid: 0,
          count: 0,
        };
      }
      if (balance.status === 0) {
        acc[promoterId].total_pending += balance.reward_amount || 0;
      } else if (balance.status === 1) {
        acc[promoterId].total_paid += balance.reward_amount || 0;
      }
      acc[promoterId].count += 1;
      return acc;
    }, {} as Record<number, any>);

    return {
      total_balances: balances.length,
      total_pending: balances
        .filter(b => b.status === 0)
        .reduce((sum, b) => sum + (b.reward_amount || 0), 0),
      total_paid: balances
        .filter(b => b.status === 1)
        .reduce((sum, b) => sum + (b.reward_amount || 0), 0),
      by_promoter: Object.values(byPromoter),
    };
  }

  /**
   * Verificar si existe balance
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventBalancePromoters.count({
      where: { id },
    });
    return count > 0;
  }
}