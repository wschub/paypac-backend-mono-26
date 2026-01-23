import { EventFavoritesRepository } from '../repositories/eventfavorites.repository';
import { EventRepository } from '../repositories/event.repository';
import { EventLocalitiesRepository } from '../repositories/eventLocalities.repository';
import { Prisma } from '@prisma/client';

const favoritesRepo = new EventFavoritesRepository();
const eventRepo = new EventRepository();
const localitiesRepo = new EventLocalitiesRepository();

export class EventFavoritesService {
  /**
   * Agregar evento a favoritos
   */
  async addFavorite(
    userId: number,
    data: {
      event_id: number;
      price_ticket: number;
      locality_id?: number;
    }
  ) {
    // Verificar que el evento existe
    const event = await eventRepo.findById(data.event_id);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Verificar que no esté ya en favoritos
    const existing = await favoritesRepo.findByUserAndEvent(userId, data.event_id);
    if (existing) {
      throw new Error('Este evento ya está en tus favoritos');
    }

    // Si se especifica localidad, verificar que existe y pertenece al evento
    if (data.locality_id) {
      const locality = await localitiesRepo.findById(data.locality_id);
      if (!locality || locality.event_id !== data.event_id) {
        throw new Error('Localidad no encontrada o no pertenece a este evento');
      }
    }

    // Validar precio
    if (data.price_ticket < 0) {
      throw new Error('El precio del ticket debe ser mayor o igual a 0');
    }

    // Crear favorito
    const favoriteData: Prisma.EventFavoritesUncheckedCreateInput = {
      user_id: userId,
      event_id: data.event_id,
      price_ticket: data.price_ticket,
      locality_id: data.locality_id || null,
    };

    return favoritesRepo.create(favoriteData);
  }

  /**
   * Obtener favoritos de un usuario
   */
  async getUserFavorites(userId: number) {
    return favoritesRepo.findByUserId(userId);
  }

  /**
   * Obtener favorito por ID
   */
  async getFavoriteById(id: number, userId: number) {
    const favorite = await favoritesRepo.findById(id);
    if (!favorite) {
      throw new Error('Favorito no encontrado');
    }

    // Verificar que el favorito pertenece al usuario
    if (favorite.user_id !== userId) {
      throw new Error('No tienes permisos para ver este favorito');
    }

    return favorite;
  }

  /**
   * Actualizar favorito (cambiar localidad o precio de referencia)
   */
  async updateFavorite(
    id: number,
    userId: number,
    data: {
      price_ticket?: number;
      locality_id?: number;
    }
  ) {
    const favorite = await favoritesRepo.findById(id);
    if (!favorite) {
      throw new Error('Favorito no encontrado');
    }

    // Verificar que el favorito pertenece al usuario
    if (favorite.user_id !== userId) {
      throw new Error('No tienes permisos para actualizar este favorito');
    }

    // Si se actualiza localidad, verificar que existe
    if (data.locality_id) {
      const locality = await localitiesRepo.findById(data.locality_id);
      if (!locality || locality.event_id !== favorite.event_id) {
        throw new Error('Localidad no encontrada o no pertenece a este evento');
      }
    }

    return favoritesRepo.update(id, data);
  }

  /**
   * Eliminar favorito
   */
  async removeFavorite(id: number, userId: number) {
    const favorite = await favoritesRepo.findById(id);
    if (!favorite) {
      throw new Error('Favorito no encontrado');
    }

    // Verificar que el favorito pertenece al usuario
    if (favorite.user_id !== userId) {
      throw new Error('No tienes permisos para eliminar este favorito');
    }

    return favoritesRepo.delete(id);
  }

  /**
   * Eliminar favorito por evento (toggle)
   */
  async toggleFavorite(userId: number, eventId: number) {
    const existing = await favoritesRepo.findByUserAndEvent(userId, eventId);

    if (existing) {
      // Si existe, eliminarlo
      await favoritesRepo.delete(existing.id);
      return {
        action: 'removed',
        message: 'Evento eliminado de favoritos',
        is_favorite: false,
      };
    } else {
      // Si no existe, agregarlo con valores por defecto
      const event = await eventRepo.findById(eventId);
      if (!event) {
        throw new Error('Evento no encontrado');
      }

      // Obtener el precio más bajo de las localidades
      const localities = await localitiesRepo.findByEventId(eventId);
      let minPrice = 0;
      if (localities.length > 0 && localities[0].stages && localities[0].stages.length > 0) {
       // minPrice = Math.min(...localities[0].stages.map(s => s.price_ticket)
//);
     
      minPrice = Math.min(
  ...localities[0].stages.map((s: { price_ticket: number }) => s.price_ticket)
);

    }

      await this.addFavorite(userId, {
        event_id: eventId,
        price_ticket: minPrice,
      });

      return {
        action: 'added',
        message: 'Evento agregado a favoritos',
        is_favorite: true,
      };
    }
  }

  /**
   * Verificar si un evento está en favoritos del usuario
   */
  async isFavorite(userId: number, eventId: number): Promise<boolean> {
    const favorite = await favoritesRepo.findByUserAndEvent(userId, eventId);
    return !!favorite;
  }

  /**
   * Obtener estadísticas de favoritos del usuario
   */
  async getUserFavoritesStats(userId: number) {
    const favorites = await favoritesRepo.findByUserId(userId);

    return {
      total_favorites: favorites.length,
      by_status: {
        upcoming: favorites.filter(f => 
          f.event.date_event > new Date() && 
          ['APPROVED', 'SCHEDULED', 'ACTIVE'].includes(f.event.status)
        ).length,
        past: favorites.filter(f => 
          f.event.date_event < new Date() || 
          f.event.status === 'FINALIZED'
        ).length,
        canceled: favorites.filter(f => f.event.status === 'CANCELED').length,
      },
    };
  }

  /**
   * Obtener eventos más populares (para ORGANIZER/PAYPAC)
   */
  async getMostPopularEvents(limit: number = 10, userRole: string) {
    if (!['PAYPAC', 'ORGANIZER'].includes(userRole)) {
      throw new Error('No tienes permisos para ver esta información');
    }

    return favoritesRepo.getMostPopularEvents(limit);
  }

  /**
   * Obtener favoritos recientes del usuario
   */
  async getRecentFavorites(userId: number, limit: number = 5) {
    return favoritesRepo.getRecentFavorites(userId, limit);
  }

  /**
   * Obtener conteo de favoritos de un evento (para ORGANIZER)
   */
  async getEventFavoritesCount(
    eventId: number,
    userId: number,
    userRole: string
  ) {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Solo el dueño del evento o PAYPAC pueden ver esta info
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para ver esta información');
    }

    const count = await favoritesRepo.countByEventId(eventId);
    const favorites = await favoritesRepo.findByEventId(eventId);

    return {
      event_id: eventId,
      event_name: event.name,
      total_favorites: count,
      favorites: favorites.map(f => ({
        user_id: f.user.id,
        user_name: f.user.name,
        added_at: f.createdAt,
        locality: f.locality?.name_locality || 'General',
      })),
    };
  }
}