import { prisma } from '../config/db';
import { Event, Prisma, EVENT_STATUS } from '@prisma/client';

export class EventRepository {
  /**
   * Crear un nuevo evento
   */
  async create(data: Prisma.EventUncheckedCreateInput): Promise<Event> {
    return prisma.event.create({
      data,
      include: {
        categories: true,
        subcategories: true,
      },
    });
  }

  /**
   * Obtener todos los eventos con filtros opcionales
   */
  async findAll(filters?: {
    status?: EVENT_STATUS;
    event_type?: string;
    organizer_id?: number;
    category_id?: number;
    country?: string;
    city?: string;
    search?: string;
  }): Promise<Event[]> {
    const where: Prisma.EventWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.event_type) {
      where.event_type = filters.event_type as any;
    }

    if (filters?.organizer_id) {
      where.organizer_id = filters.organizer_id;
    }

    if (filters?.country) {
      where.country = filters.country;
    }

    if (filters?.city) {
      where.city = filters.city;
    }

    if (filters?.category_id) {
      where.categories = {
        some: {
          id: filters.category_id,
        },
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { short_description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.event.findMany({
      where,
      include: {
        categories: true,
        subcategories: true,
        localities: {
          include: {
            stages: true,
          },
        },
      },
      orderBy: { date_event: 'asc' },
    });
  }

  /**
   * Buscar evento por ID
   */
  async findById(id: number): Promise<Event | null> {
    return prisma.event.findUnique({
      where: { id },
      include: {
        categories: true,
        subcategories: true,
        localities: {
          include: {
            stages: true,
          },
        },
        rewardRules: true,
        discounts: true,
      },
    });
  }

  /**
   * Buscar eventos de un organizador específico
   */
  async findByOrganizer(organizerId: number): Promise<Event[]> {
    return prisma.event.findMany({
      where: { organizer_id: organizerId },
      include: {
        categories: true,
        subcategories: true,
        localities: {
          include: {
            stages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualizar evento
   */
  async update(id: number, data: Prisma.EventUpdateInput): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        categories: true,
        subcategories: true,
        localities: {
          include: {
            stages: true,
          },
        },
      },
    });
  }

  /**
   * Eliminar evento
   */
  async delete(id: number): Promise<Event> {
    return prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Actualizar solo el status del evento
   */
  async updateStatus(id: number, status: EVENT_STATUS): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data: { status },
      include: {
        categories: true,
        subcategories: true,
      },
    });
  }

  /**
   * Verificar si un evento existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.event.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar eventos por organizador
   */
  async countByOrganizer(organizerId: number): Promise<number> {
    return prisma.event.count({
      where: { organizer_id: organizerId },
    });
  }
}