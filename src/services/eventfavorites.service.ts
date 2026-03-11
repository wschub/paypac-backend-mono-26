import { EventFavoritesRepository } from '../repositories/eventfavorites.repository';
import { EventRepository } from '../repositories/event.repository';
import { Prisma } from '@prisma/client';

const favoritesRepo = new EventFavoritesRepository();
const eventRepo = new EventRepository();


export class EventFavoritesService {
  /**
   * Agregar evento a favoritos
   */
  async addFavorite(
    userId: number,
    data: {
      event_id: number
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

   

   

    // Crear favorito
    const favoriteData: Prisma.EventFavoritesUncheckedCreateInput = {
      user_id: userId,
      event_id: data.event_id,
    };

    return favoritesRepo.create(favoriteData);
  }

  /**
   * Obtener favoritos de un usuario
   */
  async getUserFavorites(userId: number) {
  const favorites = await favoritesRepo.findByUserId(userId);

  return favorites.map(f => ({
    ...f,
    event: {
      ...f.event,
      price_from: this.getPriceFrom(f.event.localities ?? []),
    },
  }));
}

private getPriceFrom(localities: any[]) {
  const now = new Date();
  let cheapest: {
    name_locality: string;
    stage_name: string;
    date_start: Date;
    date_end: Date;
    price_ticket: number;
  } | null = null;

  for (const locality of localities) {
    for (const stage of locality.stages) {
      const inRange = new Date(stage.date_start) <= now && now <= new Date(stage.date_end);
      if (!inRange) continue;
      if (!cheapest || stage.price_ticket < cheapest.price_ticket) {
        cheapest = {
          name_locality: locality.name_locality,
          stage_name:    stage.stage_name,
          date_start:    stage.date_start,
          date_end:      stage.date_end,
          price_ticket:  stage.price_ticket,
        };
      }
    }
  }

  return cheapest;
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
    await favoritesRepo.delete(existing.id);
    return {
      action: 'removed',
      message: 'Evento eliminado de favoritos',
      is_favorite: false,
    };
  } else {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    await this.addFavorite(userId, { event_id: eventId });

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
        
      })),
    };
  }
}