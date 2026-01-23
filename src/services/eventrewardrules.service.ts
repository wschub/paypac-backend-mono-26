import { EventRewardRulesRepository } from '../repositories/eventrewardrules.repository';
import { EventRepository } from '../repositories/event.repository';
import { EventLocalitiesRepository } from '../repositories/eventlocalities.repository';
import { Prisma, EVENT_STATUS, EventRewardPromoters } from '@prisma/client';

const rewardRulesRepo = new EventRewardRulesRepository();
const eventRepo = new EventRepository();
const localitiesRepo = new EventLocalitiesRepository();

export class EventRewardRulesService {
  /**
   * Crear una nueva regla de recompensa
   * Solo el dueño del evento o PAYPAC pueden crear reglas
   */
  async createRewardRule(
    eventId: number,
    data: Omit<Prisma.EventRewardRulesUncheckedCreateInput, 'event_id'>,
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
      throw new Error('No tienes permisos para crear reglas de recompensa en este evento');
    }

    // Verificar que el evento permite promotores
    if (!event.allow_external_promoters && !event.allow_paypac_promotion) {
      throw new Error('Este evento no permite promotores externos');
    }

    // No permitir crear reglas si el evento ya está FINALIZED o CANCELED
    if ([EVENT_STATUS.FINALIZED, EVENT_STATUS.CANCELED].includes(event.status)) {
      throw new Error(
        `No se pueden crear reglas de recompensa en un evento en estado ${event.status}`
      );
    }

    // Validar tipo de recompensa
    const validRewardTypes = Object.values(EventRewardPromoters);
    if (!validRewardTypes.includes(data.reward_type)) {
      throw new Error('Tipo de recompensa inválido');
    }

    // Validar según el tipo de recompensa
    this.validateRewardData(data.reward_type, data);

    // Si se especifica localidad, verificar que existe
    if (data.locality_id) {
      const locality = await localitiesRepo.findById(data.locality_id);
      if (!locality || locality.event_id !== eventId) {
        throw new Error('Localidad no encontrada o no pertenece a este evento');
      }
    }

    // Crear la regla
    const ruleData: Prisma.EventRewardRulesUncheckedCreateInput = {
      ...data,
      event_id: eventId,
    };

    return rewardRulesRepo.create(ruleData);
  }

  /**
   * Obtener todas las reglas de un evento
   */
  async getRewardRulesByEventId(eventId: number) {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    return rewardRulesRepo.findByEventId(eventId);
  }

  /**
   * Obtener una regla específica por ID
   */
  async getRewardRuleById(id: number) {
    const rule = await rewardRulesRepo.findById(id);
    if (!rule) {
      throw new Error('Regla de recompensa no encontrada');
    }
    return rule;
  }

  /**
   * Actualizar una regla de recompensa
   * Solo el dueño del evento o PAYPAC pueden actualizar
   */
  async updateRewardRule(
    id: number,
    data: Prisma.EventRewardRulesUpdateInput,
    userId: number,
    userRole: string
  ) {
    const rule = await rewardRulesRepo.findById(id);
    if (!rule) {
      throw new Error('Regla de recompensa no encontrada');
    }

    const event = await eventRepo.findById(rule.event_id);
    if (!event) {
      throw new Error('Evento asociado no encontrado');
    }

    // Verificar ownership
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para actualizar esta regla');
    }

    // No permitir actualizar si el evento ya está FINALIZED
    if (event.status === EVENT_STATUS.FINALIZED) {
      throw new Error(
        `No se pueden actualizar reglas de un evento en estado ${event.status}`
      );
    }

    // Validar datos si se están actualizando
    if (data.reward_type) {
      this.validateRewardData(data.reward_type as EventRewardPromoters, data);
    }

    return rewardRulesRepo.update(id, data);
  }

  /**
   * Eliminar una regla de recompensa
   * Solo el dueño del evento o PAYPAC pueden eliminar
   */
  async deleteRewardRule(id: number, userId: number, userRole: string) {
    const rule = await rewardRulesRepo.findById(id);
    if (!rule) {
      throw new Error('Regla de recompensa no encontrada');
    }

    const event = await eventRepo.findById(rule.event_id);
    if (!event) {
      throw new Error('Evento asociado no encontrado');
    }

    // Verificar ownership
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para eliminar esta regla');
    }

    // Verificar si la regla ya fue usada en balances
    if (rule.balances && rule.balances.length > 0) {
      throw new Error(
        'No se puede eliminar una regla que ya tiene balances asociados'
      );
    }

    return rewardRulesRepo.delete(id);
  }

  /**
   * Calcular recompensa para una venta
   * Usado por el servicio de transacciones
   */
  async calculateReward(
    eventId: number,
    quantity: number,
    totalAmount: number,
    localityId?: number
  ): Promise<{
    rule: any;
    rewardAmount: number;
    description: string;
  } | null> {
    // Buscar la regla aplicable
    const rule = await rewardRulesRepo.findApplicableRule(
      eventId,
      quantity,
      totalAmount,
      localityId
    );

    if (!rule) {
      return null; // No hay regla aplicable
    }

    let rewardAmount = 0;
    let description = '';

    switch (rule.reward_type) {
      case EventRewardPromoters.PERCENTAGE:
        rewardAmount = Math.round((totalAmount * (rule.reward_percentage || 0)) / 100);
        description = `${quantity} tickets × ${rule.reward_percentage}% = $${rewardAmount.toLocaleString()}`;
        break;

      case EventRewardPromoters.FIXED_AMOUNT:
        rewardAmount = rule.reward_amount || 0;
        description = `Monto fijo: $${rewardAmount.toLocaleString()}`;
        break;

      case EventRewardPromoters.TICKET_REWARD:
        // TODO: Implementar lógica de tickets gratis
        description = `${rule.reward_amount || 0} tickets gratis`;
        break;

      case EventRewardPromoters.CASH_REWARD:
        rewardAmount = rule.reward_amount || 0;
        description = `Bono en efectivo: $${rewardAmount.toLocaleString()}`;
        break;

      default:
        description = 'Recompensa especial';
    }

    return {
      rule: {
        id: rule.id,
        type: rule.reward_type,
        locality: rule.locality?.name_locality || 'General',
      },
      rewardAmount,
      description,
    };
  }

  /**
   * Validar datos según tipo de recompensa
   */
  private validateRewardData(
    rewardType: EventRewardPromoters,
    data: any
  ) {
    switch (rewardType) {
      case EventRewardPromoters.PERCENTAGE:
        if (!data.reward_percentage || data.reward_percentage <= 0 || data.reward_percentage > 100) {
          throw new Error('El porcentaje debe estar entre 1 y 100');
        }
        break;

      case EventRewardPromoters.FIXED_AMOUNT:
      case EventRewardPromoters.CASH_REWARD:
        if (!data.reward_amount || data.reward_amount <= 0) {
          throw new Error('El monto de recompensa debe ser mayor a 0');
        }
        break;

      case EventRewardPromoters.TICKET_REWARD:
        if (!data.reward_amount || data.reward_amount <= 0) {
          throw new Error('La cantidad de tickets debe ser mayor a 0');
        }
        break;

      default:
        // NONE, GUEST_LIST, CONSUMPTION_REWARD no requieren validación especial
        break;
    }
  }
}