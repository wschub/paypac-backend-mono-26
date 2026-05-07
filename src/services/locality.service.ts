import { prisma } from '../prisma/client';
import { EventService } from './event.service';

const eventService = new EventService();

export class LocalityService {
  async getPublicLocalitiesByEvent(eventId: number) {
    await eventService.getPublicEventById(eventId);

    const now = new Date();

    const localities = await prisma.eventLocalities.findMany({
      where: {
        event_id: eventId,
        stages: {
          some: {
            date_start: { lte: now },
            date_end: { gte: now },
          },
        },
      },
      include: {
        stages: {
          where: {
            date_start: { lte: now },
            date_end: { gte: now },
          },
          orderBy: { price_ticket: 'asc' },
          take: 1,
        },
      },
      orderBy: { name_locality: 'asc' },
    });

    const validLocalities = localities.filter(loc => loc.stages.length > 0);

    return { data: validLocalities, total: validLocalities.length };
  }
}
