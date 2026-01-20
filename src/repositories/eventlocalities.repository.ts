import { prisma } from '../config/db';
import { EventLocalities, Prisma } from '@prisma/client';

export class EventLocalitiesRepository {
  /**
   * Crear una nueva localidad para un evento
   */
  async create(data: Prisma.EventLocalitiesUncheckedCreateInput): Promise<EventLocalities> {
    return prisma.eventLocalities.create({
      data,
      include: {
        event: true,
        stages: true,
      },
    });
  }

  /**
   * Obtener todas las localidades de un evento específico
   */
  async findByEventId(eventId: number): Promise<EventLocalities[]> {
    return prisma.eventLocalities.findMany({
      where: { event_id: eventId },
      include: {
        stages: {
          orderBy: { date_start: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Buscar localidad por ID
   */
  async findById(id: number): Promise<EventLocalities | null> {
    return prisma.eventLocalities.findUnique({
      where: { id },
      include: {
        event: true,
        stages: {
          orderBy: { date_start: 'asc' },
        },
        rewardRules: true,
        discounts: true,
      },
    });
  }

  /**
   * Actualizar localidad
   */
  async update(
    id: number,
    data: Prisma.EventLocalitiesUpdateInput
  ): Promise<EventLocalities> {
    return prisma.eventLocalities.update({
      where: { id },
      data,
      include: {
        event: true,
        stages: true,
      },
    });
  }

  /**
   * Eliminar localidad
   */
  async delete(id: number): Promise<EventLocalities> {
    return prisma.eventLocalities.delete({
      where: { id },
    });
  }

  /**
   * Verificar si una localidad existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventLocalities.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar localidades de un evento
   */
  async countByEventId(eventId: number): Promise<number> {
    return prisma.eventLocalities.count({
      where: { event_id: eventId },
    });
  }

  /**
   * Verificar si un evento tiene localidades
   */
  async eventHasLocalities(eventId: number): Promise<boolean> {
    const count = await this.countByEventId(eventId);
    return count > 0;
  }

  /**
   * Obtener localidad con información completa de stages
   */
  async findByIdWithDetails(id: number): Promise<EventLocalities | null> {
    return prisma.eventLocalities.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            organizer_id: true,
            status: true,
          },
        },
        stages: {
          orderBy: { date_start: 'asc' },
        },
        rewardRules: true,
        discounts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}