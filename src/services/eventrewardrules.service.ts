import { EventRewardRulesRepository } from '../repositories/eventrewardrules.repository';
import { EventRepository } from '../repositories/event.repository';
import { EventLocalitiesRepository } from '../repositories/eventlocalities.repository';
import { Prisma, EVENT_STATUS, EventRewardPromoters } from '@prisma/client';

const rewardRulesRepo = new EventRewardRulesRepository();
const eventRepo = new EventRepository();
const localitiesRepo = new EventLocalitiesRepository();

// Tipos con relaciones
type RewardRuleWithBalances = Prisma.EventRewardRulesGetPayload<{
  include: { balances: true };
}>;

type RewardRuleWithLocality = Prisma.EventRewardRulesGetPayload<{
  include: { locality: true };
}>;

export class EventRewardRulesService {
  async createRewardRule(
    eventId: number,
    data: Omit<Prisma.EventRewardRulesUncheckedCreateInput, 'event_id'>,
    userId: number,
    userRole: string
  ) {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para crear reglas de recompensa en este evento');
    }

    if (!event.allow_external_promoters && !event.allow_paypac_promotion) {
      throw new Error('Este evento no permite promotores externos');
    }

    if ([EVENT_STATUS.FINALIZED, EVENT_STATUS.CANCELED].includes(event.status as any)) {
      throw new Error(`No se pueden crear reglas en estado ${event.status}`);
    }

    if (!data.reward_type) {
      throw new Error('El tipo de recompensa es obligatorio');
    }

    const validRewardTypes = Object.values(EventRewardPromoters);
    if (!validRewardTypes.includes(data.reward_type)) {
      throw new Error('Tipo de recompensa inválido');
    }

    this.validateRewardData(data.reward_type, data);

    if (data.locality_id) {
      const locality = await localitiesRepo.findById(data.locality_id);
      if (!locality || locality.event_id !== eventId) {
        throw new Error('Localidad no encontrada o no pertenece a este evento');
      }
    }

    const ruleData: Prisma.EventRewardRulesUncheckedCreateInput = {
      ...data,
      event_id: eventId,
    };

    return rewardRulesRepo.create(ruleData);
  }

  async getRewardRulesByEventId(eventId: number) {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    return rewardRulesRepo.findByEventId(eventId);
  }

  async getRewardRuleById(id: number) {
    const rule = await rewardRulesRepo.findById(id);
    if (!rule) throw new Error('Regla de recompensa no encontrada');
    return rule;
  }

  async updateRewardRule(
    id: number,
    data: Prisma.EventRewardRulesUpdateInput,
    userId: number,
    userRole: string
  ) {
    const rule = await rewardRulesRepo.findById(id);
    if (!rule) throw new Error('Regla de recompensa no encontrada');

    const event = await eventRepo.findById(rule.event_id);
    if (!event) throw new Error('Evento asociado no encontrado');

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para actualizar esta regla');
    }

    if (event.status === EVENT_STATUS.FINALIZED) {
      throw new Error(`No se pueden actualizar reglas en estado ${event.status}`);
    }

    if (data.reward_type) {
      this.validateRewardData(data.reward_type as EventRewardPromoters, data);
    }

    return rewardRulesRepo.update(id, data);
  }

  async deleteRewardRule(id: number, userId: number, userRole: string) {
    const rule = (await rewardRulesRepo.findById(id)) as RewardRuleWithBalances | null;
    if (!rule) throw new Error('Regla de recompensa no encontrada');

    const event = await eventRepo.findById(rule.event_id);
    if (!event) throw new Error('Evento asociado no encontrado');

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para eliminar esta regla');
    }

    if (rule.balances.length > 0) {
      throw new Error('No se puede eliminar una regla que ya tiene balances asociados');
    }

    return rewardRulesRepo.delete(id);
  }

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
    const rule = (await rewardRulesRepo.findApplicableRule(
      eventId,
      quantity,
      totalAmount,
      localityId
    )) as RewardRuleWithLocality | null;

    if (!rule) return null;

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

  private validateRewardData(rewardType: EventRewardPromoters, data: any) {
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
        break;
    }
  }
}

/*import { EventRewardRulesRepository } from '../repositories/eventrewardrules.repository';
import { EventRepository } from '../repositories/event.repository';
import { EventLocalitiesRepository } from '../repositories/eventlocalities.repository';
import { Prisma, EVENT_STATUS, EventRewardPromoters, EventRewardRules } from '@prisma/client';

const rewardRulesRepo = new EventRewardRulesRepository();
const eventRepo = new EventRepository();
const localitiesRepo = new EventLocalitiesRepository();

type EventRewardRuleWithRelations = Prisma.EventRewardRulesGetPayload<{
  include: { balances: true };
}>;


export class EventRewardRulesService {
  async createRewardRule(
    eventId: number,
    data: Omit<Prisma.EventRewardRulesUncheckedCreateInput, 'event_id'>,
    userId: number,
    userRole: string
  ) {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para crear reglas de recompensa en este evento');
    }

    if (!event.allow_external_promoters && !event.allow_paypac_promotion) {
      throw new Error('Este evento no permite promotores externos');
    }

    if ([EVENT_STATUS.FINALIZED, EVENT_STATUS.CANCELED].includes(event.status as EVENT_STATUS)) {
      throw new Error(
        `No se pueden crear reglas de recompensa en un evento en estado ${event.status}`
      );
    }

    const validRewardTypes = Object.values(EventRewardPromoters);
    if (!data.reward_type || !validRewardTypes.includes(data.reward_type)) {
      throw new Error('Tipo de recompensa inválido');
    }

    this.validateRewardData(data.reward_type, data);

    if (data.locality_id) {
      const locality = await localitiesRepo.findById(data.locality_id);
      if (!locality || locality.event_id !== eventId) {
        throw new Error('Localidad no encontrada o no pertenece a este evento');
      }
    }

    const ruleData: Prisma.EventRewardRulesUncheckedCreateInput = {
      ...data,
      event_id: eventId,
    };

    return rewardRulesRepo.create(ruleData);
  }

  async getRewardRulesByEventId(eventId: number) {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    return rewardRulesRepo.findByEventId(eventId);
  }

  async getRewardRuleById(id: number) {
    const rule = await rewardRulesRepo.findById(id);
    if (!rule) throw new Error('Regla de recompensa no encontrada');
    return rule;
  }

  async updateRewardRule(
    id: number,
    data: Prisma.EventRewardRulesUpdateInput,
    userId: number,
    userRole: string
  ) {
    const rule = await rewardRulesRepo.findById(id);
    if (!rule) throw new Error('Regla de recompensa no encontrada');

    const event = await eventRepo.findById(rule.event_id);
    if (!event) throw new Error('Evento asociado no encontrado');

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para actualizar esta regla');
    }

    if (event.status === EVENT_STATUS.FINALIZED) {
      throw new Error(
        `No se pueden actualizar reglas de un evento en estado ${event.status}`
      );
    }

    if (data.reward_type) {
      this.validateRewardData(data.reward_type as EventRewardPromoters, data);
    }

    return rewardRulesRepo.update(id, data);
  }

  async deleteRewardRule(id: number, userId: number, userRole: string) {
    const rule = await rewardRulesRepo.findById(id);
    if (!rule) throw new Error('Regla de recompensa no encontrada');

    const event = await eventRepo.findById(rule.event_id);
    if (!event) throw new Error('Evento asociado no encontrado');

    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para eliminar esta regla');
    }

    if (rule.balances && rule.balances.length > 0) {
      throw new Error('No se puede eliminar una regla que ya tiene balances asociados');
    }

    return rewardRulesRepo.delete(id);
  }

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
    const rule = await rewardRulesRepo.findApplicableRule(
      eventId,
      quantity,
      totalAmount,
      localityId
    );

    if (!rule) return null;

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
    }
  }
}
 */