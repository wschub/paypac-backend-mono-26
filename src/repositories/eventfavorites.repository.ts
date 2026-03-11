import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class EventFavoritesRepository {
  async create(data: Prisma.EventFavoritesUncheckedCreateInput) {
    return prisma.eventFavorites.create({
      data,
      include: {
        event: true,
        user: true,
      },
    });
  }

  async findByUserId(userId: number) {
  return prisma.eventFavorites.findMany({
    where: { user_id: userId },
    include: {
      event: {
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
      },
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

  async findById(id: number) {
    return prisma.eventFavorites.findUnique({
      where: { id },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async findByUserAndEvent(userId: number, eventId: number) {
    return prisma.eventFavorites.findFirst({
      where: {
        user_id: userId,
        event_id: eventId,
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async findByEventId(eventId: number) {
    return prisma.eventFavorites.findMany({
      where: { event_id: eventId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, data: Prisma.EventFavoritesUpdateInput) {
    return prisma.eventFavorites.update({
      where: { id },
      data,
      include: {
        event: true,
        user: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.eventFavorites.delete({
      where: { id },
    });
  }

  async deleteByUserAndEvent(userId: number, eventId: number) {
    const favorite = await this.findByUserAndEvent(userId, eventId);
    if (!favorite) return null;
    return this.delete(favorite.id);
  }

  async countByUserId(userId: number): Promise<number> {
    return prisma.eventFavorites.count({
      where: { user_id: userId },
    });
  }

  async countByEventId(eventId: number): Promise<number> {
    return prisma.eventFavorites.count({
      where: { event_id: eventId },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventFavorites.count({
      where: { id },
    });
    return count > 0;
  }

  async getMostPopularEvents(limit: number = 10) {
    const favorites = await prisma.eventFavorites.groupBy({
      by: ['event_id'],
      _count: { event_id: true },
      orderBy: { _count: { event_id: 'desc' } },
      take: limit,
    });

    const eventIds = favorites.map(f => f.event_id);

    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
    });

    return events.map(event => ({
      ...event,
      favorites_count:
        favorites.find(f => f.event_id === event.id)?._count.event_id || 0,
    }));
  }

  async getRecentFavorites(userId: number, limit: number = 5) {
    return prisma.eventFavorites.findMany({
      where: { user_id: userId },
      include: {
        event: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
