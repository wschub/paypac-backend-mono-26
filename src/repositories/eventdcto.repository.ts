import { prisma } from '../config/db';
import { EventDcto, Prisma } from '@prisma/client';

export class EventDctoRepository {
  /**
   * Crear un nuevo descuento
   */
  async create(data: Prisma.EventDctoUncheckedCreateInput): Promise<EventDcto> {
    return prisma.eventDcto.create({
      data,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            organizer_id: true,
            status: true,
          },
        },
        locality: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Obtener todos los descuentos de un evento
   */
  async findByEventId(eventId: number): Promise<EventDcto[]> {
    return prisma.eventDcto.findMany({
      where: { event_id: eventId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        locality: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar descuento por ID
   */
  async findById(id: number): Promise<EventDcto | null> {
    return prisma.eventDcto.findUnique({
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
        locality: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Buscar descuento por nombre en un evento
   */
  async findByName(eventId: number, codeOrName: string): Promise<EventDcto | null> {
  return prisma.eventDcto.findFirst({
    where: {
      event_id: eventId,
      OR: [
        { name_dcto: { equals: codeOrName, mode: 'insensitive' } },
        { code:      { equals: codeOrName, mode: 'insensitive' } },
      ],
    },
  });
}

async incrementUses(eventId: number, codeOrName: string): Promise<void> {
  await prisma.eventDcto.updateMany({
    where: {
      event_id: eventId,
      OR: [
        { name_dcto: { equals: codeOrName, mode: 'insensitive' } },
        { code:      { equals: codeOrName, mode: 'insensitive' } },
      ],
    },
    data: { uses_count: { increment: 1 } },
  });
}

  /**
   * Obtener descuentos por localidad
   */
  async findByLocalityId(localityId: number): Promise<EventDcto[]> {
    return prisma.eventDcto.findMany({
      where: { locality_id: localityId },
      include: {
        event: true,
        locality: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener descuentos creados por un usuario
   */
  async findByUserId(userId: number): Promise<EventDcto[]> {
    return prisma.eventDcto.findMany({
      where: { user_id: userId },
      include: {
        event: true,
        locality: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualizar descuento
   */
  async update(id: number, data: Prisma.EventDctoUpdateInput): Promise<EventDcto> {
    return prisma.eventDcto.update({
      where: { id },
      data,
      include: {
        event: true,
        locality: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Eliminar descuento
   */
  async delete(id: number): Promise<EventDcto> {
    return prisma.eventDcto.delete({
      where: { id },
    });
  }

  /**
   * Verificar si un descuento existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventDcto.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar descuentos de un evento
   */
  async countByEventId(eventId: number): Promise<number> {
    return prisma.eventDcto.count({
      where: { event_id: eventId },
    });
  }

  /**
   * Obtener descuentos aplicables a una cantidad de tickets
   */
  async findApplicableDiscounts(
    eventId: number,
    quantity: number,
    localityId?: number
  ): Promise<EventDcto[]> {
    const where: Prisma.EventDctoWhereInput = {
      event_id: eventId,
      OR: [
        // Sin restricción de cantidad
        {
          min_qty_tickets: null,
          max_qty_tickets: null,
        },
        // Dentro del rango de cantidad
        {
          AND: [
            {
              OR: [
                { min_qty_tickets: null },
                { min_qty_tickets: { lte: quantity } },
              ],
            },
            {
              OR: [
                { max_qty_tickets: null },
                { max_qty_tickets: { gte: quantity } },
              ],
            },
          ],
        },
      ],
    };

    // Si se especifica localidad, filtrar por ella o descuentos generales
    if (localityId) {
      where.OR = [
        { locality_id: null }, // Descuentos generales
        { locality_id: localityId }, // Descuentos específicos de la localidad
      ];
    }

    return prisma.eventDcto.findMany({
      where,
      include: {
        locality: true,
      },
      orderBy: { value_dcto: 'desc' }, // Mayor descuento primero
    });
  }



}