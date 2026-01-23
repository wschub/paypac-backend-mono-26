import { prisma } from '../config/db';
import { EventFavorites, Prisma } from '@prisma/client';

export class EventFavoritesRepository {
  /**
   * Agregar evento a favoritos
   */
  async create(data: Prisma.EventFavoritesUncheckedCreateInput): Promise<EventFavorites> {
    return prisma.eventFavorites.create({
      data,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            short_description: true,
            image: true,
            cover: true,
            date_event: true,
            place_address: true,
            city: true,
            country: true,
            status: true,
          },
        },
        locality: {
          select: {
            id: true,
            name_locality: true,
          },
        },
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
   * Obtener todos los favoritos de un usuario
   */
  async findByUserId(userId: number) {
    return prisma.eventFavorites.findMany({
      where: { user_id: userId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            short_description: true,
            image: true,
            cover: true,
            date_event: true,
            place_address: true,
            city: true,
            country: true,
            status: true,
            event_type: true,
            organizer_id: true,
          },
        },
        locality: {
          select: {
            id: true,
            name_locality: true,
            bkg_color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar favorito por ID
   */
  async findById(id: number) {
    return prisma.eventFavorites.findUnique({
      where: { id },
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
   * Verificar si un usuario ya tiene un evento en favoritos
   */
  async findByUserAndEvent(
    userId: number,
    eventId: number
  ) {
    return prisma.eventFavorites.findFirst({
      where: {
        user_id: userId,
        event_id: eventId,
      },
      include: {
        event: true,
        locality: true,
      },
    });
  }

  /**
   * Obtener favoritos de un evento específico (cuántos usuarios lo tienen)
   */
  async findByEventId(eventId: number): Promise<EventFavorites[]> {
    return prisma.eventFavorites.findMany({
      where: { event_id: eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        locality: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualizar favorito (por ejemplo, cambiar localidad o precio)
   */
  async update(
    id: number,
    data: Prisma.EventFavoritesUpdateInput
  ): Promise<EventFavorites> {
    return prisma.eventFavorites.update({
      where: { id },
      data,
      include: {
        event: true,
        locality: true,
      },
    });
  }

  /**
   * Eliminar favorito
   */
  async delete(id: number): Promise<EventFavorites> {
    return prisma.eventFavorites.delete({
      where: { id },
    });
  }

  /**
   * Eliminar favorito por usuario y evento
   */
  async deleteByUserAndEvent(
    userId: number,
    eventId: number
  ): Promise<EventFavorites | null> {
    const favorite = await this.findByUserAndEvent(userId, eventId);
    if (!favorite) {
      return null;
    }
    return this.delete(favorite.id);
  }

  /**
   * Contar favoritos de un usuario
   */
  async countByUserId(userId: number): Promise<number> {
    return prisma.eventFavorites.count({
      where: { user_id: userId },
    });
  }

  /**
   * Contar favoritos de un evento (popularidad)
   */
  async countByEventId(eventId: number): Promise<number> {
    return prisma.eventFavorites.count({
      where: { event_id: eventId },
    });
  }

  /**
   * Verificar si existe favorito
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventFavorites.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Obtener eventos más populares (más favoritos)
   */
  async getMostPopularEvents(limit: number = 10) {
    const favorites = await prisma.eventFavorites.groupBy({
      by: ['event_id'],
      _count: {
        event_id: true,
      },
      orderBy: {
        _count: {
          event_id: 'desc',
        },
      },
      take: limit,
    });

    // Obtener información completa de los eventos
    const eventIds = favorites.map(f => f.event_id);
    const events = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
      },
      select: {
        id: true,
        name: true,
        short_description: true,
        image: true,
        cover: true,
        date_event: true,
        city: true,
        country: true,
        status: true,
      },
    });

    // Combinar con el conteo
    return events.map(event => ({
      ...event,
      favorites_count: favorites.find(f => f.event_id === event.id)?._count.event_id || 0,
    }));
  }

  /**
   * Obtener favoritos recientes de un usuario
   */
  async getRecentFavorites(userId: number, limit: number = 5): Promise<EventFavorites[]> {
    return prisma.eventFavorites.findMany({
      where: { user_id: userId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            image: true,
            date_event: true,
            city: true,
            status: true,
          },
        },
        locality: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}