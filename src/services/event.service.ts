import { EventRepository } from '../repositories/event.repository';
import { Prisma, EVENT_STATUS } from '@prisma/client';

const eventRepo = new EventRepository();

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

    // Asignar el organizador automáticamente
    const eventData = {
      ...data,
      organizer_id: userId,
      status: EVENT_STATUS.CREATED, // Estado inicial
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
    country?: string;
    city?: string;
    search?: string;
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

    return eventRepo.update(id, data);
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

    return eventRepo.delete(id);
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

    return eventRepo.updateStatus(id, status);
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
}