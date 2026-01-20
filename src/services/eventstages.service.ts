import { EventStagesRepository } from '../repositories/eventStages.repository';
import { EventLocalitiesRepository } from '../repositories/eventLocalities.repository';
import { EventRepository } from '../repositories/event.repository';
import { Prisma, EVENT_STATUS } from '@prisma/client';

const stagesRepo = new EventStagesRepository();
const localitiesRepo = new EventLocalitiesRepository();
const eventRepo = new EventRepository();

export class EventStagesService {
  /**
   * Crear una nueva etapa para una localidad
   * Solo el dueño del evento o PAYPAC pueden crear etapas
   */
  async createStage(
    localityId: number,
    data: Omit<Prisma.EventStagesUncheckedCreateInput, 'locality_id'>,
    userId: number,
    userRole: string
  ) {
    // Verificar que la localidad existe
    const locality = await localitiesRepo.findById(localityId);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }

    // Verificar que el evento existe
    const event = await eventRepo.findById(locality.event_id);
    if (!event) {
      throw new Error('Evento asociado no encontrado');
    }

    // Verificar ownership
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para agregar etapas a esta localidad');
    }

    // No permitir agregar etapas si el evento ya está ACTIVE, FINALIZED o CANCELED
    if ([EVENT_STATUS.ACTIVE, EVENT_STATUS.FINALIZED, EVENT_STATUS.CANCELED].includes(event.status)) {
      throw new Error(
        `No se pueden agregar etapas a un evento en estado ${event.status}`
      );
    }

    // Validar fechas
    this.validateDates(data.date_start, data.date_end);

    // Validar precio
    if (data.price_ticket <= 0) {
      throw new Error('El precio del ticket debe ser mayor a 0');
    }

    // Verificar solapamiento de fechas
    const overlapping = await stagesRepo.findOverlappingStages(
      localityId,
      new Date(data.date_start),
      new Date(data.date_end)
    );

    if (overlapping.length > 0) {
      throw new Error(
        `Las fechas se solapan con otra etapa existente: "${overlapping[0].stage_name}"`
      );
    }

    // Crear la etapa
    const stageData: Prisma.EventStagesUncheckedCreateInput = {
      ...data,
      locality_id: localityId,
    };

    return stagesRepo.create(stageData);
  }

  /**
   * Obtener todas las etapas de una localidad
   */
  async getStagesByLocalityId(localityId: number) {
    const locality = await localitiesRepo.findById(localityId);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }

    return stagesRepo.findByLocalityId(localityId);
  }

  /**
   * Obtener una etapa específica por ID
   */
  async getStageById(id: number) {
    const stage = await stagesRepo.findById(id);
    if (!stage) {
      throw new Error('Etapa no encontrada');
    }
    return stage;
  }

  /**
   * Actualizar una etapa
   * Solo el dueño del evento o PAYPAC pueden actualizar
   */
  async updateStage(
    id: number,
    data: Prisma.EventStagesUpdateInput,
    userId: number,
    userRole: string
  ) {
    const stage = await stagesRepo.findById(id);
    if (!stage) {
      throw new Error('Etapa no encontrada');
    }

    // Verificar que la localidad y el evento existen
    const locality = await localitiesRepo.findById(stage.locality_id);
    if (!locality) {
      throw new Error('Localidad asociada no encontrada');
    }

    const event = await eventRepo.findById(locality.event_id);
    if (!event) {
      throw new Error('Evento asociado no encontrado');
    }

    // Verificar ownership
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para actualizar esta etapa');
    }

    // No permitir actualizar si el evento ya está ACTIVE o FINALIZED
    if ([EVENT_STATUS.ACTIVE, EVENT_STATUS.FINALIZED].includes(event.status)) {
      throw new Error(
        `No se pueden actualizar etapas de un evento en estado ${event.status}`
      );
    }

    // Validar fechas si se están actualizando
    if (data.date_start && data.date_end) {
      this.validateDates(data.date_start as any, data.date_end as any);
    }

    // Validar precio si se está actualizando
    if (data.price_ticket && (data.price_ticket as number) <= 0) {
      throw new Error('El precio del ticket debe ser mayor a 0');
    }

    // Verificar solapamiento solo si se actualizan las fechas
    if (data.date_start || data.date_end) {
      const dateStart = (data.date_start as Date) || stage.date_start;
      const dateEnd = (data.date_end as Date) || stage.date_end;

      const overlapping = await stagesRepo.findOverlappingStages(
        stage.locality_id,
        new Date(dateStart),
        new Date(dateEnd),
        id // Excluir la etapa actual
      );

      if (overlapping.length > 0) {
        throw new Error(
          `Las fechas se solapan con otra etapa: "${overlapping[0].stage_name}"`
        );
      }
    }

    return stagesRepo.update(id, data);
  }

  /**
   * Eliminar una etapa
   * Solo el dueño del evento o PAYPAC pueden eliminar
   */
  async deleteStage(id: number, userId: number, userRole: string) {
    const stage = await stagesRepo.findById(id);
    if (!stage) {
      throw new Error('Etapa no encontrada');
    }

    const locality = await localitiesRepo.findById(stage.locality_id);
    if (!locality) {
      throw new Error('Localidad asociada no encontrada');
    }

    const event = await eventRepo.findById(locality.event_id);
    if (!event) {
      throw new Error('Evento asociado no encontrado');
    }

    // Verificar ownership
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para eliminar esta etapa');
    }

    // No permitir eliminar si el evento ya está ACTIVE o FINALIZED
    if ([EVENT_STATUS.ACTIVE, EVENT_STATUS.FINALIZED].includes(event.status)) {
      throw new Error(
        `No se pueden eliminar etapas de un evento en estado ${event.status}`
      );
    }

    // TODO: Verificar si hay tickets vendidos en esta etapa
    // Si hay tickets vendidos, no permitir eliminar

    return stagesRepo.delete(id);
  }

  /**
   * Obtener etapa activa actual de una localidad
   */
  async getActiveStage(localityId: number) {
    const locality = await localitiesRepo.findById(localityId);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }

    const activeStage = await stagesRepo.findActiveStage(localityId);
    
    if (!activeStage) {
      return {
        message: 'No hay etapa activa en este momento',
        active_stage: null,
      };
    }

    return {
      message: 'Etapa activa encontrada',
      active_stage: activeStage,
    };
  }

  /**
   * Obtener próximas etapas de una localidad
   */
  async getUpcomingStages(localityId: number) {
    const locality = await localitiesRepo.findById(localityId);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }

    return stagesRepo.findUpcomingStages(localityId);
  }

  /**
   * Obtener estadísticas de precios de una localidad
   */
  async getPriceStats(localityId: number) {
    const locality = await localitiesRepo.findById(localityId);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }

    return stagesRepo.getPriceStatsByLocalityId(localityId);
  }

  /**
   * Validar que date_end sea posterior a date_start
   */
  private validateDates(dateStart: Date | string, dateEnd: Date | string) {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    if (end <= start) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Validar que las fechas no sean en el pasado (opcional)
    const now = new Date();
    if (start < now) {
      throw new Error('La fecha de inicio no puede ser en el pasado');
    }
  }

  /**
   * Validar disponibilidad de tickets (placeholder para futuro)
   */
  async checkAvailability(stageId: number) {
    const stage = await stagesRepo.findById(stageId);
    if (!stage) {
      throw new Error('Etapa no encontrada');
    }

    // TODO: Consultar cuántos tickets se han vendido en esta etapa
    // const ticketsSold = await ticketsRepo.countByStageId(stageId);
    // const ticketsAvailable = stage.locality.event.num_max_tickets - ticketsSold;

    return {
      stage_id: stage.id,
      stage_name: stage.stage_name,
      price_ticket: stage.price_ticket,
      date_start: stage.date_start,
      date_end: stage.date_end,
      is_active: new Date() >= stage.date_start && new Date() <= stage.date_end,
      // tickets_available: ticketsAvailable, // TODO
      // tickets_sold: ticketsSold, // TODO
    };
  }
}