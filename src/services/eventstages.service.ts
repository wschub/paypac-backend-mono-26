import { EventStagesRepository } from '../repositories/eventstages.repository';
import { EventLocalitiesRepository } from '../repositories/eventlocalities.repository';
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
    const locality = await localitiesRepo.findById(localityId);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }

    const event = await eventRepo.findById(locality.event_id);
    if (!event) {
      throw new Error('Evento asociado no encontrado');
    }

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para agregar etapas a esta localidad');
    }

    const blockedStatuses: EVENT_STATUS[] = [
      EVENT_STATUS.ACTIVE,
      EVENT_STATUS.FINALIZED,
      EVENT_STATUS.CANCELED,
    ];

    if (blockedStatuses.includes(event.status)) {
      throw new Error(`No se pueden agregar etapas a un evento en estado ${event.status}`);
    }

    this.validateDates(data.date_start, data.date_end);

    if (data.price_ticket <= 0) {
      throw new Error('El precio del ticket debe ser mayor a 0');
    }

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

    const stageData: Prisma.EventStagesUncheckedCreateInput = {
      ...data,
      locality_id: localityId,
    };

    return stagesRepo.create(stageData);
  }

  async getStagesByLocalityId(localityId: number) {
    const locality = await localitiesRepo.findById(localityId);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }

    return stagesRepo.findByLocalityId(localityId);
  }

  async getStageById(id: number) {
    const stage = await stagesRepo.findById(id);
    if (!stage) {
      throw new Error('Etapa no encontrada');
    }
    return stage;
  }

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

    const locality = await localitiesRepo.findById(stage.locality_id);
    if (!locality) {
      throw new Error('Localidad asociada no encontrada');
    }

    const event = await eventRepo.findById(locality.event_id);
    if (!event) {
      throw new Error('Evento asociado no encontrado');
    }

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para actualizar esta etapa');
    }

    const lockedStatuses: EVENT_STATUS[] = [
      EVENT_STATUS.ACTIVE,
      EVENT_STATUS.FINALIZED,
    ];

    if (lockedStatuses.includes(event.status)) {
      throw new Error(`No se pueden actualizar etapas de un evento en estado ${event.status}`);
    }

    if (data.date_start && data.date_end) {
      this.validateDates(data.date_start as any, data.date_end as any);
    }

    if (data.price_ticket && (data.price_ticket as number) <= 0) {
      throw new Error('El precio del ticket debe ser mayor a 0');
    }

    if (data.date_start || data.date_end) {
      const dateStart = (data.date_start as Date) || stage.date_start;
      const dateEnd = (data.date_end as Date) || stage.date_end;

      const overlapping = await stagesRepo.findOverlappingStages(
        stage.locality_id,
        new Date(dateStart),
        new Date(dateEnd),
        id
      );

      if (overlapping.length > 0) {
        throw new Error(
          `Las fechas se solapan con otra etapa: "${overlapping[0].stage_name}"`
        );
      }
    }

    return stagesRepo.update(id, data);
  }

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

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para eliminar esta etapa');
    }

    const lockedStatuses: EVENT_STATUS[] = [
      EVENT_STATUS.ACTIVE,
      EVENT_STATUS.FINALIZED,
    ];

    if (lockedStatuses.includes(event.status)) {
      throw new Error(`No se pueden eliminar etapas de un evento en estado ${event.status}`);
    }

    return stagesRepo.delete(id);
  }

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

  async getUpcomingStages(localityId: number) {
    const locality = await localitiesRepo.findById(localityId);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }

    return stagesRepo.findUpcomingStages(localityId);
  }

  async getPriceStats(localityId: number) {
    const locality = await localitiesRepo.findById(localityId);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }

    return stagesRepo.getPriceStatsByLocalityId(localityId);
  }

  private validateDates(dateStart: Date | string, dateEnd: Date | string) {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    if (end <= start) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const now = new Date();
    if (start < now) {
      throw new Error('La fecha de inicio no puede ser en el pasado');
    }
  }

  async checkAvailability(stageId: number) {
    const stage = await stagesRepo.findById(stageId);
    if (!stage) {
      throw new Error('Etapa no encontrada');
    }

    return {
      stage_id: stage.id,
      stage_name: stage.stage_name,
      price_ticket: stage.price_ticket,
      date_start: stage.date_start,
      date_end: stage.date_end,
      is_active: new Date() >= stage.date_start && new Date() <= stage.date_end,
    };
  }
}
