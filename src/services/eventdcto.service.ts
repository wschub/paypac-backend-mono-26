import { EventDctoRepository } from '../repositories/eventDcto.repository';
import { EventRepository } from '../repositories/event.repository';
import { EventLocalitiesRepository } from '../repositories/eventLocalities.repository';
import { Prisma, EVENT_STATUS } from '@prisma/client';

const dctoRepo = new EventDctoRepository();
const eventRepo = new EventRepository();
const localitiesRepo = new EventLocalitiesRepository();

export class EventDctoService {
  /**
   * Crear un nuevo descuento
   * Solo el dueño del evento o PAYPAC pueden crear descuentos
   */
  async createDiscount(
    eventId: number,
    data: Omit<Prisma.EventDctoUncheckedCreateInput, 'event_id' | 'user_id'>,
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
      throw new Error('No tienes permisos para crear descuentos en este evento');
    }

    // No permitir crear descuentos si el evento ya está FINALIZED o CANCELED
    if ([EVENT_STATUS.FINALIZED, EVENT_STATUS.CANCELED].includes(event.status)) {
      throw new Error(
        `No se pueden crear descuentos en un evento en estado ${event.status}`
      );
    }

    // Validar tipo de descuento
    if (![1, 2].includes(data.type_dcto)) {
      throw new Error('Tipo de descuento inválido. Debe ser 1 (Porcentaje) o 2 (Monto fijo)');
    }

    // Validar valor del descuento
    if (data.value_dcto <= 0) {
      throw new Error('El valor del descuento debe ser mayor a 0');
    }

    // Si es porcentaje, validar que no sea mayor a 100
    if (data.type_dcto === 1 && data.value_dcto > 100) {
      throw new Error('El descuento por porcentaje no puede ser mayor a 100%');
    }

    // Si se especifica localidad, verificar que existe
    if (data.locality_id) {
      const locality = await localitiesRepo.findById(data.locality_id);
      if (!locality || locality.event_id !== eventId) {
        throw new Error('Localidad no encontrada o no pertenece a este evento');
      }
    }

    // Validar cantidades
    if (data.min_qty_tickets && data.max_qty_tickets) {
      if (data.min_qty_tickets > data.max_qty_tickets) {
        throw new Error('La cantidad mínima no puede ser mayor a la cantidad máxima');
      }
    }

    // Verificar que no exista un descuento con el mismo nombre
    const existing = await dctoRepo.findByName(eventId, data.name_dcto);
    if (existing) {
      throw new Error('Ya existe un descuento con ese nombre en este evento');
    }

    // Crear el descuento
    const discountData: Prisma.EventDctoUncheckedCreateInput = {
      ...data,
      event_id: eventId,
      user_id: userId,
    };

    return dctoRepo.create(discountData);
  }

  /**
   * Obtener todos los descuentos de un evento
   */
  async getDiscountsByEventId(eventId: number) {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    return dctoRepo.findByEventId(eventId);
  }

  /**
   * Obtener un descuento específico por ID
   */
  async getDiscountById(id: number) {
    const discount = await dctoRepo.findById(id);
    if (!discount) {
      throw new Error('Descuento no encontrado');
    }
    return discount;
  }

  /**
   * Actualizar un descuento
   * Solo el dueño del evento o PAYPAC pueden actualizar
   */
  async updateDiscount(
    id: number,
    data: Prisma.EventDctoUpdateInput,
    userId: number,
    userRole: string
  ) {
    const discount = await dctoRepo.findById(id);
    if (!discount) {
      throw new Error('Descuento no encontrado');
    }

    const event = await eventRepo.findById(discount.event_id);
    if (!event) {
      throw new Error('Evento asociado no encontrado');
    }

    // Verificar ownership
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para actualizar este descuento');
    }

    // No permitir actualizar si el evento ya está FINALIZED
    if (event.status === EVENT_STATUS.FINALIZED) {
      throw new Error(
        `No se pueden actualizar descuentos de un evento en estado ${event.status}`
      );
    }

    // Validaciones similares a la creación
    if (data.type_dcto && ![1, 2].includes(data.type_dcto as number)) {
      throw new Error('Tipo de descuento inválido');
    }

    if (data.value_dcto && (data.value_dcto as number) <= 0) {
      throw new Error('El valor del descuento debe ser mayor a 0');
    }

    if (data.type_dcto === 1 && data.value_dcto && (data.value_dcto as number) > 100) {
      throw new Error('El descuento por porcentaje no puede ser mayor a 100%');
    }

    return dctoRepo.update(id, data);
  }

  /**
   * Eliminar un descuento
   * Solo el dueño del evento o PAYPAC pueden eliminar
   */
  async deleteDiscount(id: number, userId: number, userRole: string) {
    const discount = await dctoRepo.findById(id);
    if (!discount) {
      throw new Error('Descuento no encontrado');
    }

    const event = await eventRepo.findById(discount.event_id);
    if (!event) {
      throw new Error('Evento asociado no encontrado');
    }

    // Verificar ownership
    const isOwner = event.organizer_id === userId;
    const isPaypac = userRole === 'PAYPAC';

    if (!isOwner && !isPaypac) {
      throw new Error('No tienes permisos para eliminar este descuento');
    }

    // TODO: Verificar si el descuento ya fue usado en facturas
    // Si fue usado, no permitir eliminar

    return dctoRepo.delete(id);
  }

  /**
   * Validar y calcular descuento
   * Endpoint público para que CUSTOMER pueda validar códigos
   */
  async validateDiscount(
    eventId: number,
    discountName: string,
    quantity: number,
    localityId?: number
  ) {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Buscar el descuento por nombre
    const discount = await dctoRepo.findByName(eventId, discountName);
    if (!discount) {
      throw new Error('Código de descuento no válido');
    }

    // Verificar si aplica a la localidad
    if (discount.locality_id && localityId && discount.locality_id !== localityId) {
      throw new Error('Este descuento no es válido para la localidad seleccionada');
    }

    // Verificar cantidad mínima
    if (discount.min_qty_tickets && quantity < discount.min_qty_tickets) {
      throw new Error(
        `Este descuento requiere comprar al menos ${discount.min_qty_tickets} tickets`
      );
    }

    // Verificar cantidad máxima
    if (discount.max_qty_tickets && quantity > discount.max_qty_tickets) {
      throw new Error(
        `Este descuento solo aplica hasta ${discount.max_qty_tickets} tickets`
      );
    }

    return {
      valid: true,
      discount: {
        id: discount.id,
        name: discount.name_dcto,
        description: discount.description,
        type: discount.type_dcto === 1 ? 'percentage' : 'fixed',
        value: discount.value_dcto,
      },
    };
  }

  /**
   * Calcular monto de descuento
   */
  calculateDiscountAmount(
    totalAmount: number,
    discountType: number,
    discountValue: number
  ): number {
    if (discountType === 1) {
      // Porcentaje
      return Math.round((totalAmount * discountValue) / 100);
    } else {
      // Monto fijo
      return Math.min(discountValue, totalAmount); // No puede ser mayor al total
    }
  }

  /**
   * Obtener descuentos aplicables
   */
  async getApplicableDiscounts(
    eventId: number,
    quantity: number,
    localityId?: number
  ) {
    return dctoRepo.findApplicableDiscounts(eventId, quantity, localityId);
  }
}