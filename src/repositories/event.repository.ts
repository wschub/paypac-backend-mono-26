import { prisma } from '../config/db';
import { Prisma, EVENT_STATUS } from '@prisma/client';

export class EventRepository {
  /**
   * Crear un nuevo evento
   */
  async create(data: Prisma.EventUncheckedCreateInput) {
    return prisma.event.create({
      data,
      include: {
        category: true,       // ✅ 1:N singular
        subcategory: true,    // ✅ 1:N singular
        subgenre: true,       // ✅ 1:N singular
      },
    });
  }

  /**
   * Obtener todos los eventos con filtros opcionales
   */
  async findAll(filters?: {
     status?: EVENT_STATUS | EVENT_STATUS[];  // ← cambio
    event_type?: string;
    organizer_id?: number;
    category_id?: number;
    country?: string;
    city?: string;
    search?: string;
  }) {
    const where: Prisma.EventWhereInput = {};

    // ✅ Filtro where — maneja ambos casos
if (filters?.status) {
  where.status = Array.isArray(filters.status)
    ? { in: filters.status }
    : filters.status;
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

    // ✅ Filtro por category_id usando FK directa (1:N)
    if (filters?.category_id) {
      where.category_id = filters.category_id;
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
        category: true,
        subcategory: true,
        subgenre: true,
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
  async findById(id: number) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        subgenre: true,
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
  async findByOrganizer(organizerId: number) {
    return prisma.event.findMany({
      where: { organizer_id: organizerId },
      include: {
        category: true,
        subcategory: true,
        subgenre: true,
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
  async update(id: number, data: Prisma.EventUpdateInput) {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        category: true,
        subcategory: true,
        subgenre: true,
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
  async delete(id: number) {
    return prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Actualizar solo el status del evento
   */
  async updateStatus(id: number, status: EVENT_STATUS) {
    return prisma.event.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        subcategory: true,
      },
    });
  }

  /**
   * Verificar si un evento existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.event.count({ where: { id } });
    return count > 0;
  }

  /**
   * Contar eventos por organizador
   */
  async countByOrganizer(organizerId: number): Promise<number> {
    return prisma.event.count({ where: { organizer_id: organizerId } });
  }
}