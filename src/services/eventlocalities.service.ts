import { EventLocalitiesRepository } from '../repositories/eventLocalities.repository';
import { EventRepository } from '../repositories/event.repository';
import { Prisma, EVENT_STATUS } from '@prisma/client';

const localitiesRepo = new EventLocalitiesRepository();
const eventRepo = new EventRepository();

export class EventLocalitiesService {
  /**
   * Crear una nueva localidad para un evento
   * Solo el dueño del evento o PAYPAC pueden crear localidades
   */
  async createLocality(
    eventId: number,
    data: Omit<Prisma.EventLocalitiesUncheckedCreateInput, 'event_id'>,
    userId: number,
    userRole: string
  ) {
    // Verificar que el evento existe
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Verificar ownership
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para agregar localidades a este evento');
    }

    // No permitir agregar localidades si el evento ya está ACTIVE o FINALIZED
    if ([EVENT_STATUS.ACTIVE, EVENT_STATUS.FINALIZED, EVENT_STATUS.CANCELED].includes(event.status)) {
      throw new Error(
        `No se pueden agregar localidades a un evento en estado ${event.status}`
      );
    }

    // Crear la localidad
    const localityData: Prisma.EventLocalitiesUncheckedCreateInput = {
      ...data,
      event_id: eventId,
    };

    return localitiesRepo.create(localityData);
  }

  /**
   * Obtener todas las localidades de un evento
   */
  async getLocalitiesByEventId(eventId: number) {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    return localitiesRepo.findByEventId(eventId);
  }

  /**
   * Obtener una localidad específica por ID
   */
  async getLocalityById(id: number) {
    const locality = await localitiesRepo.findByIdWithDetails(id);
    if (!locality) {
      throw new Error('Localidad no encontrada');
    }
    return locality;
  }

  /**
   * Actualizar una localidad
   * Solo el dueño del evento o PAYPAC pueden actualizar
   */
  async updateLocality(
    id: number,
    data: Prisma.EventLocalitiesUpdateInput,
    userId: number,
    userRole: string
  ) {
    const locality = await localitiesRepo.findById(id);
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
      throw new Error('No tienes permisos para actualizar esta localidad');
    }

    // No permitir actualizar si el evento ya está ACTIVE o FINALIZED
    if ([EVENT_STATUS.ACTIVE, EVENT_STATUS.FINALIZED].includes(event.status)) {
      throw new Error(
        `No se pueden actualizar localidades de un evento en estado ${event.status}`
      );
    }

    return localitiesRepo.update(id, data);
  }

  /**
   * Eliminar una localidad
   * Solo el dueño del evento o PAYPAC pueden eliminar
   */
  async deleteLocality(id: number, userId: number, userRole: string) {
    const locality = await localitiesRepo.findById(id);
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
      throw new Error('No tienes permisos para eliminar esta localidad');
    }

    // No permitir eliminar si el evento ya está ACTIVE o FINALIZED
    if ([EVENT_STATUS.ACTIVE, EVENT_STATUS.FINALIZED].includes(event.status)) {
      throw new Error(
        `No se pueden eliminar localidades de un evento en estado ${event.status}`
      );
    }

    // Verificar si hay stages asociadas (opcional: podrías permitir cascade delete)
    if (locality.stages && locality.stages.length > 0) {
      throw new Error(
        'No se puede eliminar una localidad con etapas asociadas. Elimina las etapas primero.'
      );
    }

    return localitiesRepo.delete(id);
  }

  /**
   * Obtener estadísticas de localidades de un evento
   */
  async getLocalitiesStats(eventId: number) {
    const localities = await localitiesRepo.findByEventId(eventId);

    const stats = {
      total_localities: localities.length,
      localities_with_stages: localities.filter(l => l.stages && l.stages.length > 0).length,
      total_stages: localities.reduce((sum, l) => sum + (l.stages?.length || 0), 0),
      localities: localities.map(l => ({
        id: l.id,
        name: l.name_locality,
        stages_count: l.stages?.length || 0,
      })),
    };

    return stats;
  }

  /**
   * Validar que los colores sean válidos (formato hexadecimal)
   */
  private isValidHexColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  /**
   * Validar datos de localidad antes de crear/actualizar
   */
  validateLocalityData(data: any) {
    const { bkg_color, title_color, text_color, title_color_location } = data;

    const colors = [
      { name: 'bkg_color', value: bkg_color },
      { name: 'title_color', value: title_color },
      { name: 'text_color', value: text_color },
      { name: 'title_color_location', value: title_color_location },
    ];

    for (const color of colors) {
      if (color.value && !this.isValidHexColor(color.value)) {
        throw new Error(
          `El color ${color.name} debe ser un código hexadecimal válido (ej: #FF5733)`
        );
      }
    }

    return true;
  }
}