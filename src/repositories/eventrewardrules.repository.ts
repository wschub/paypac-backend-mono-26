import { prisma } from '../config/db';
import { EventRewardRules, Prisma, EventRewardPromoters } from '@prisma/client';

export class EventRewardRulesRepository {
  /**
   * Crear una nueva regla de recompensa
   */
  async create(data: Prisma.EventRewardRulesUncheckedCreateInput): Promise<EventRewardRules> {
    return prisma.eventRewardRules.create({
      data,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            organizer_id: true,
            status: true,
          },
        },
        locality: true,
      },
    });
  }

  /**
   * Obtener todas las reglas de un evento
   */
  async findByEventId(eventId: number): Promise<EventRewardRules[]> {
    return prisma.eventRewardRules.findMany({
      where: { event_id: eventId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        locality: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar regla por ID
   */
  async findById(id: number): Promise<EventRewardRules | null> {
    return prisma.eventRewardRules.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            organizer_id: true,
            status: true,
          },
        },
        locality: true,
        balances: true,
      },
    });
  }

  /**
   * Obtener reglas por tipo de recompensa
   */
  async findByRewardType(
    eventId: number,
    rewardType: EventRewardPromoters
  ): Promise<EventRewardRules[]> {
    return prisma.eventRewardRules.findMany({
      where: {
        event_id: eventId,
        reward_type: rewardType,
      },
      include: {
        locality: true,
      },
    });
  }

  /**
   * Obtener reglas por localidad
   */
  async findByLocalityId(localityId: number): Promise<EventRewardRules[]> {
    return prisma.eventRewardRules.findMany({
      where: { locality_id: localityId },
      include: {
        event: true,
        locality: true,
      },
    });
  }

  /**
   * Actualizar regla
   */
  async update(
    id: number,
    data: Prisma.EventRewardRulesUpdateInput
  ): Promise<EventRewardRules> {
    return prisma.eventRewardRules.update({
      where: { id },
      data,
      include: {
        event: true,
        locality: true,
      },
    });
  }

  /**
   * Eliminar regla
   */
  async delete(id: number): Promise<EventRewardRules> {
    return prisma.eventRewardRules.delete({
      where: { id },
    });
  }

  /**
   * Verificar si una regla existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventRewardRules.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar reglas de un evento
   */
  async countByEventId(eventId: number): Promise<number> {
    return prisma.eventRewardRules.count({
      where: { event_id: eventId },
    });
  }

  /**
   * Buscar regla aplicable según cantidad y monto
   * Para calcular recompensa en el momento de la venta
   */
  async findApplicableRule(
    eventId: number,
    quantity: number,
    amount: number,
    localityId?: number
  ): Promise<EventRewardRules | null> {
    const where: Prisma.EventRewardRulesWhereInput = {
      event_id: eventId,
      AND: [
        // Validar cantidad mínima
        {
          OR: [
            { min_qty_tickets: null },
            { min_qty_tickets: { lte: quantity } },
          ],
        },
        // Validar monto mínimo
        {
          OR: [
            { min_amount_tickets: null },
            { min_amount_tickets: { lte: amount } },
          ],
        },
      ],
    };

    // Filtrar por localidad si se especifica
    if (localityId) {
      where.OR = [
        { locality_id: null }, // Reglas generales
        { locality_id: localityId }, // Reglas específicas de localidad
      ];
    } else {
      where.locality_id = null; // Solo reglas generales
    }

    // Retornar la primera regla que coincida
    // Ordenar por reward_percentage/reward_amount DESC para dar la mejor recompensa
    return prisma.eventRewardRules.findFirst({
      where,
      orderBy: [
        { reward_percentage: 'desc' },
        { reward_amount: 'desc' },
      ],
      include: {
        locality: true,
      },
    });
  }

  /**
   * Obtener todas las reglas aplicables (puede haber múltiples)
   */
  async findAllApplicableRules(
    eventId: number,
    quantity: number,
    amount: number,
    localityId?: number
  ): Promise<EventRewardRules[]> {
    const where: Prisma.EventRewardRulesWhereInput = {
      event_id: eventId,
      AND: [
        {
          OR: [
            { min_qty_tickets: null },
            { min_qty_tickets: { lte: quantity } },
          ],
        },
        {
          OR: [
            { min_amount_tickets: null },
            { min_amount_tickets: { lte: amount } },
          ],
        },
      ],
    };

    if (localityId) {
      where.OR = [
        { locality_id: null },
        { locality_id: localityId },
      ];
    }

    return prisma.eventRewardRules.findMany({
      where,
      orderBy: [
        { reward_percentage: 'desc' },
        { reward_amount: 'desc' },
      ],
      include: {
        locality: true,
      },
    });
  }
}