import { prisma } from '../config/db';
import { EventStages, Prisma } from '@prisma/client';

export class EventStagesRepository {
  /**
   * Crear una nueva etapa (stage) para una localidad
   */
  async create(data: Prisma.EventStagesUncheckedCreateInput): Promise<EventStages> {
    return prisma.eventStages.create({
      data,
      include: {
        locality: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                organizer_id: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Obtener todas las etapas de una localidad específica
   */
  async findByLocalityId(localityId: number): Promise<EventStages[]> {
    return prisma.eventStages.findMany({
      where: { locality_id: localityId },
      include: {
        locality: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                date_event: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { date_start: 'asc' },
    });
  }

  /**
   * Buscar etapa por ID
   */
  async findById(id: number): Promise<EventStages | null> {
    return prisma.eventStages.findUnique({
      where: { id },
      include: {
        locality: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                organizer_id: true,
                status: true,
                date_event: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Actualizar etapa
   */
  async update(
    id: number,
    data: Prisma.EventStagesUpdateInput
  ): Promise<EventStages> {
    return prisma.eventStages.update({
      where: { id },
      data,
      include: {
        locality: {
          include: {
            event: true,
          },
        },
      },
    });
  }

  /**
   * Eliminar etapa
   */
  async delete(id: number): Promise<EventStages> {
    return prisma.eventStages.delete({
      where: { id },
    });
  }

  /**
   * Verificar si una etapa existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventStages.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar etapas de una localidad
   */
  async countByLocalityId(localityId: number): Promise<number> {
    return prisma.eventStages.count({
      where: { locality_id: localityId },
    });
  }

  /**
   * Verificar solapamiento de fechas en una localidad
   * Retorna las etapas que se solapan con el rango dado
   */
  async findOverlappingStages(
    localityId: number,
    dateStart: Date,
    dateEnd: Date,
    excludeStageId?: number
  ): Promise<EventStages[]> {
    const where: Prisma.EventStagesWhereInput = {
      locality_id: localityId,
      AND: [
        {
          OR: [
            // Caso 1: date_start está dentro del rango
            {
              date_start: {
                gte: dateStart,
                lte: dateEnd,
              },
            },
            // Caso 2: date_end está dentro del rango
            {
              date_end: {
                gte: dateStart,
                lte: dateEnd,
              },
            },
            // Caso 3: el rango está completamente dentro de la etapa existente
            {
              AND: [
                { date_start: { lte: dateStart } },
                { date_end: { gte: dateEnd } },
              ],
            },
          ],
        },
      ],
    };

    // Excluir la etapa actual si estamos actualizando
    if (excludeStageId) {
      where.id = { not: excludeStageId };
    }

    return prisma.eventStages.findMany({
      where,
      include: {
        locality: true,
      },
    });
  }

  /**
   * Obtener la etapa activa actual (si existe) para una localidad
   */
  async findActiveStage(localityId: number): Promise<EventStages | null> {
    const now = new Date();
    return prisma.eventStages.findFirst({
      where: {
        locality_id: localityId,
        date_start: { lte: now },
        date_end: { gte: now },
      },
      include: {
        locality: true,
      },
    });
  }

  /**
   * Obtener próximas etapas de una localidad
   */
  async findUpcomingStages(localityId: number): Promise<EventStages[]> {
    const now = new Date();
    return prisma.eventStages.findMany({
      where: {
        locality_id: localityId,
        date_start: { gt: now },
      },
      orderBy: { date_start: 'asc' },
      take: 5, // Limitar a las próximas 5 etapas
    });
  }

  /**
   * Obtener estadísticas de precios de una localidad
   */
  async getPriceStatsByLocalityId(localityId: number) {
    const stages = await this.findByLocalityId(localityId);
    
    if (stages.length === 0) {
      return {
        min_price: 0,
        max_price: 0,
        avg_price: 0,
        total_stages: 0,
      };
    }

    const prices = stages.map(s => s.price_ticket);
    return {
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
      avg_price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      total_stages: stages.length,
    };
  }
}