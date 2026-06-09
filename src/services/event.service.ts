import { EventRepository } from '../repositories/event.repository';
import { Prisma, EVENT_STATUS } from '@prisma/client';
import { EventLiquidationService } from './event_liquidation.service';
import { prisma } from '../prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { generateUniqueSlug } from '../utils/slug';


const eventRepo = new EventRepository();
const liquidationService = new EventLiquidationService();

export class EventService {

  
  /**
   * Crear un nuevo evento
   * Solo ORGANIZER y PAYPAC pueden crear eventos
   */
  async createEvent(
    data: Prisma.EventUncheckedCreateInput,
    userId: number,
    userRole: string
  ) {
    // Validar que el usuario tenga permiso para crear eventos
    if (!['PAYPAC', 'ORGANIZER'].includes(userRole)) {
      throw new Error('No tienes permisos para crear eventos');
    }

    const publicId = uuidv4();
    const publicUrl = await generateUniqueSlug((data as any).name);

    const eventData = {
      ...data,
      organizer_id: userId,
      status: EVENT_STATUS.CREATED,
      public_id: publicId,
      public_url: publicUrl,
    };

    return eventRepo.create(eventData);
  }

  /**
   * Obtener eventos con filtros
   * Filtra según el rol del usuario
   */
  async getEvents(
  filters: {
    status?: EVENT_STATUS | EVENT_STATUS[];
    event_type?: string;
    category_id?: number;
    subcategory_id?: number;  // ← agregar
    subgenre_id?:   number;   // ← agregar
    country?: string;
    city?: string;
    search?: string;
      date_from?:     string;   // ← agregar
    date_to?:       string;   // ← agregar
    latitude?:      string;   // ← agregar
    longitude?:     string;   // ← agregar
    allow_external_promoters?: boolean;
  },
  userRole: string,
  userId?: number
) {
  let events: any[];

  // Si es ORGANIZER, solo ve sus propios eventos
  if (userRole === 'ORGANIZER' && userId) {
    events = await eventRepo.findByOrganizer(userId);

  // Si es CUSTOMER o PROMOTER, solo ve eventos ACTIVOS o APPROVED públicos
  } else if (['CUSTOMER', 'PROMOTER'].includes(userRole)) {
    const publicFilters = {
      ...filters,
      status: filters.status || [EVENT_STATUS.ACTIVE, EVENT_STATUS.APPROVED],
    };
    events = await eventRepo.findAll(publicFilters);

  // PAYPAC y STAFF pueden ver todos los eventos
  } else {
    events = await eventRepo.findAll(filters);
  }

  // Enriquecer cada evento con price_from
  return events.map(event => ({
    ...event,
    price_from: this.getPriceFrom(event.localities ?? []),
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
   * Obtener evento por ID
   */
  async getEventById(id: number) {
    const event = await eventRepo.findById(id);
    if (!event) {
      throw new Error('Evento no encontrado');
    }
    return event;
  }

  /**
   * Obtener eventos del organizador autenticado
   */
  async getMyEvents(userId: number) {
    return eventRepo.findByOrganizer(userId);
  }

  /**
   * Actualizar evento
   * Solo el dueño (ORGANIZER) o PAYPAC pueden actualizar
   */
  async updateEvent(
    id: number,
    data: Prisma.EventUpdateInput,
    userId: number,
    userRole: string
  ) {
    const event = await eventRepo.findById(id);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Verificar ownership
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para actualizar este evento');
    }

    // Si el evento ya fue APPROVED, solo PAYPAC puede editarlo
    if (event.status === EVENT_STATUS.APPROVED && !isPaypac) {
      throw new Error(
        'Este evento ya fue aprobado. Solo PAYPAC puede modificarlo'
      );
    }

    // Si cambió el nombre, regenerar public_url
    let updateData: Prisma.EventUpdateInput = { ...data };
    if ((data as any).name && (data as any).name !== event.name) {
      updateData.public_url = await generateUniqueSlug((data as any).name, id);
    }

    return eventRepo.update(id, updateData);
  }

  /**
   * Eliminar evento
   * Solo el dueño o PAYPAC pueden eliminar
   */
  async deleteEvent(id: number, userId: number, userRole: string) {
    const event = await eventRepo.findById(id);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para eliminar este evento');
    }

    // No se puede eliminar si hay tickets vendidos (agregar validación futura)
    // TODO: Verificar si hay invoices/tickets asociados

    return eventRepo.delete(id,userRole);
  }

  /**
   * Actualizar status del evento
   * Solo PAYPAC puede cambiar el status (aprobar/rechazar/cancelar)
   */
  async updateEventStatus(
    id: number,
    status: EVENT_STATUS,
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') {
      throw new Error('Solo PAYPAC puede cambiar el status del evento');
    }

    const event = await eventRepo.findById(id);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Validar transiciones de estado permitidas
    const validTransitions: Record<EVENT_STATUS, EVENT_STATUS[]> = {
      CREATED: [EVENT_STATUS.APPROVED, EVENT_STATUS.CANCELED],
      APPROVED: [EVENT_STATUS.SCHEDULED, EVENT_STATUS.CANCELED],
      SCHEDULED: [EVENT_STATUS.ACTIVE, EVENT_STATUS.RE_SCHEDULED, EVENT_STATUS.CANCELED],
      ACTIVE: [EVENT_STATUS.FINALIZED, EVENT_STATUS.CANCELED],
      CANCELED: [], // No se puede cambiar desde cancelado
      RE_SCHEDULED: [EVENT_STATUS.SCHEDULED, EVENT_STATUS.CANCELED],
      FINALIZED: [], // No se puede cambiar desde finalizado
    };

    const allowedStatuses = validTransitions[event.status];
    if (!allowedStatuses.includes(status)) {
      throw new Error(
        `No se puede cambiar de ${event.status} a ${status}`
      );
    }

    // ✅ AHORA
const updatedEvent = await eventRepo.updateStatus(id, status);

if (status === EVENT_STATUS.FINALIZED) {
  try {
    await liquidationService.autoCreateFromEvent(id);
  } catch (liqError: any) {
    console.error('⚠️ Error creando liquidación automática:', liqError.message);
  }
}

return updatedEvent;
  }

  /**
   * Obtener estadísticas de eventos de un organizador
   */
  async getOrganizerStats(organizerId: number) {
    const events = await eventRepo.findByOrganizer(organizerId);

    const stats = {
      total: events.length,
      byStatus: {
        CREATED: events.filter(e => e.status === EVENT_STATUS.CREATED).length,
        APPROVED: events.filter(e => e.status === EVENT_STATUS.APPROVED).length,
        SCHEDULED: events.filter(e => e.status === EVENT_STATUS.SCHEDULED).length,
        ACTIVE: events.filter(e => e.status === EVENT_STATUS.ACTIVE).length,
        FINALIZED: events.filter(e => e.status === EVENT_STATUS.FINALIZED).length,
        CANCELED: events.filter(e => e.status === EVENT_STATUS.CANCELED).length,
        RE_SCHEDULED: events.filter(e => e.status === EVENT_STATUS.RE_SCHEDULED).length,
      },
    };

    return stats;
  }

  /**
 * Obtener eventos disponibles para promotores externos
 * con resumen de ventas del promotor autenticado
 */
async getEventByPublicUrl(publicUrl: string) {
  return eventRepo.findByPublicUrl(publicUrl);
}

async getFeaturedEvents(limit = 10) {
  return eventRepo.getFeaturedEvents(limit);
}

async getAvailableEventsForPromoter(promoter_id: number) {
  const events = await eventRepo.findAvailableForPromoters(promoter_id);

  return events.map(event => ({
    ...event,
    price_from: this.getPriceFrom(event.localities ?? []),
  }));
}

  async getPublicEvents(filters: {
    search?: string;
    date_from?: string;
    date_to?: string;
    city?: string;
    category_id?: string;
    sort_by?: string;
    page?: string;
    limit?: string;
    featured?: string;
  }) {
    const now = new Date();
    const page = parseInt(filters.page || '1') || 1;
    const limit = Math.min(parseInt(filters.limit || '20') || 20, 100);
    const skip = (page - 1) * limit;

    const categoryIds = filters.category_id
      ? filters.category_id.split(',').map(Number).filter(n => !isNaN(n))
      : undefined;

    const where: any = {
      status: { in: ['APPROVED', 'ACTIVE'] },
      event_type: 'PUBLICO',
      ...(filters.featured === 'true' && { featured: true }),
      localities: {
        some: {
          stages: {
            some: {
              date_start: { lte: now },
              date_end: { gte: now },
            },
          },
        },
      },
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { short_description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.date_from && { date_event: { gte: new Date(filters.date_from) } }),
      ...(filters.date_to && { date_event: { lte: new Date(filters.date_to) } }),
      ...(filters.city && { city: filters.city }),
      ...(categoryIds && categoryIds.length > 0 && { category_id: { in: categoryIds } }),
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          localities: {
            include: {
              stages: {
                where: { date_start: { lte: now }, date_end: { gte: now } },
                orderBy: { price_ticket: 'asc' },
                take: 1,
              },
            },
          },
          _count: {
            select: {
              tickets: { where: { status_ticket: { in: ['PAID', 'ACTIVE'] } } },
              views: true,
            },
          },
        },
      }) as any,
      prisma.event.count({ where }),
    ]);

    let eventsFormatted = (events as any[]).map((event: any) => {
      // Elegir la localidad con el stage activo más barato
      const localitiesWithStage = event.localities.filter(
        (l: any) => l.stages.length > 0
      );
      localitiesWithStage.sort(
        (a: any, b: any) => a.stages[0].price_ticket - b.stages[0].price_ticket
      );
      const locality = localitiesWithStage[0];
      const stage = locality?.stages[0];
      return {
        id: event.id,
        public_id: event.public_id,
        public_url: event.public_url,
        featured: event.featured,
        name: event.name,
        image: event.image,
        short_description: event.short_description,
        date_event: event.date_event,
        place_address: event.place_address,
        description: event.description,
        cover: event.cover,
        url_video: event.url_video,
        organizer_id: event.organizer_id,
        price_from: stage
          ? {
              name_locality: locality!.name_locality,
              stage_name: stage.stage_name,
              date_start: stage.date_start,
              date_end: stage.date_end,
              price_ticket: stage.price_ticket,
            }
          : null,
        popularityScore:
          (event._count.tickets * 0.6) + (event._count.views * 0.4),
      };
    });

    const sortBy = filters.sort_by || 'date_asc';
    if (sortBy === 'popularity') {
      eventsFormatted.sort((a, b) =>
        b.popularityScore !== a.popularityScore
          ? b.popularityScore - a.popularityScore
          : new Date(a.date_event).getTime() - new Date(b.date_event).getTime()
      );
    } else if (sortBy === 'price_asc') {
      eventsFormatted.sort((a, b) => {
        const pa = a.price_from?.price_ticket ?? Infinity;
        const pb = b.price_from?.price_ticket ?? Infinity;
        return pa !== pb
          ? pa - pb
          : new Date(a.date_event).getTime() - new Date(b.date_event).getTime();
      });
    } else if (sortBy === 'price_desc') {
      eventsFormatted.sort((a, b) => {
        const pa = a.price_from?.price_ticket ?? 0;
        const pb = b.price_from?.price_ticket ?? 0;
        return pa !== pb
          ? pb - pa
          : new Date(a.date_event).getTime() - new Date(b.date_event).getTime();
      });
    } else if (sortBy === 'name_asc') {
      eventsFormatted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      eventsFormatted.sort(
        (a, b) =>
          new Date(a.date_event).getTime() - new Date(b.date_event).getTime()
      );
    }

    const eventsClean = eventsFormatted.map(
      ({ popularityScore, ...event }) => event
    );

    return { data: eventsClean, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPublicEventById(id: number | string) {
    const now = new Date();

    const where = typeof id === 'number' ? { id } : { public_id: id };

    const event = await prisma.event.findUnique({
      where,
      select: {
        id: true,
        public_id: true,
        public_url: true,
        featured: true,
        name: true,
        image: true,
        short_description: true,
        date_event: true,
        place_address: true,
        description: true,
        cover: true,
        url_video: true,
        organizer_id: true,
        status: true,
        event_type: true,
        localities: {
          include: {
            stages: {
              where: { date_start: { lte: now }, date_end: { gte: now } },
              orderBy: { price_ticket: 'asc' },
              take: 1,
            },
          },
        },
      },
    }) as any;

    const ev = event as any;

    if (
      !ev ||
      !['APPROVED', 'ACTIVE'].includes(ev.status) ||
      ev.event_type !== 'PUBLICO'
    ) {
      throw new Error('Event not found');
    }

    const locality = ev.localities?.[0];
    const stage = locality?.stages?.[0];

    return {
      data: {
        id: ev.id,
        public_id: ev.public_id,
        public_url: ev.public_url,
        featured: ev.featured,
        name: ev.name,
        image: ev.image,
        short_description: ev.short_description,
        date_event: ev.date_event,
        place_address: ev.place_address,
        description: ev.description,
        cover: ev.cover,
        url_video: ev.url_video,
        organizer_id: ev.organizer_id,
        price_from: stage
          ? {
              name_locality: locality.name_locality,
              stage_name: stage.stage_name,
              date_start: stage.date_start,
              date_end: stage.date_end,
              price_ticket: stage.price_ticket,
            }
          : null,
      },
    };
  }
}