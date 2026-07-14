import { prisma } from '../config/db';
import { Prisma, EVENT_STATUS } from '@prisma/client';

export class EventRepository {
  /**
   * Crear un nuevo evento
   */
  async create(data: Prisma.EventUncheckedCreateInput) {
    return prisma.event.create({
      data,
      include: {
        category: true,       // ✅ 1:N singular
        subcategory: true,    // ✅ 1:N singular
        subgenre: true,       // ✅ 1:N singular
      },
    });
  }

  /**
   * Obtener todos los eventos con filtros opcionales
   */
  async findAll(filters?: {
     status?: EVENT_STATUS | EVENT_STATUS[];  // ← cambio
    event_type?: string;
    organizer_id?: number;
    category_id?: number;
    subcategory_id?: number;  // ← agregar
  subgenre_id?:   number;   // ← agregar
    country?: string;
    city?: string;
    search?: string;
    date_from?:     string;   // ← agregar
  date_to?:       string;   // ← agregar
  latitude?:      string;   // ← agregar (para futuro cálculo de distancia)
  longitude?:     string;   // ← agregar
    allow_external_promoters?: boolean;
  }) {
    const where: Prisma.EventWhereInput = {};

    // ✅ Filtro where — maneja ambos casos
if (filters?.status) {
  where.status = Array.isArray(filters.status)
    ? { in: filters.status }
    : filters.status;
}

    if (filters?.event_type) {
      where.event_type = filters.event_type as any;
    }

    if (filters?.organizer_id) {
      where.organizer_id = filters.organizer_id;
    }

    if (filters?.country) {
      where.country = filters.country;
    }

    if (filters?.city) {
      where.city = filters.city;
    }

    // ✅ Filtro por category_id usando FK directa (1:N)
    if (filters?.category_id) {
      where.category_id = filters.category_id;
    }

    if (filters?.subcategory_id) {
  where.subcategory_id = filters.subcategory_id;
}

if (filters?.subgenre_id) {
  where.subgenre_id = filters.subgenre_id;
}

if (filters?.allow_external_promoters !== undefined) {
  where.allow_external_promoters = filters.allow_external_promoters;
}

if (filters?.date_from || filters?.date_to) {
  where.date_event = {
    ...(filters.date_from && { gte: new Date(filters.date_from) }),
    ...(filters.date_to   && { lte: new Date(filters.date_to)   }),
  };
}

    

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { short_description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.event.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        subgenre: true,
        localities: {
          include: {
            stages: true,
          },
        },
      },
      orderBy: { date_event: 'asc' },
    });
  }

  /**
   * Buscar evento por ID
   */
  async findById(id: number) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        subgenre: true,
        cityRef: true,
        localities: {
          include: {
            stages: true,
          },
        },
        rewardRules: true,
        discounts: true,
      },
    });
  }

  /**
   * Buscar eventos de un organizador específico
   */
  async findByOrganizer(organizerId: number) {
    return prisma.event.findMany({
      where: { organizer_id: organizerId },
      include: {
        category: true,
        subcategory: true,
        subgenre: true,
        localities: {
          include: {
            stages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Actualizar evento
   */
  async update(id: number, data: Prisma.EventUpdateInput) {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        category: true,
        subcategory: true,
        subgenre: true,
        localities: {
          include: {
            stages: true,
          },
        },
      },
    });
  }

  /**
   * Eliminar evento
   */
  async delete(id: number, userRole: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!event) throw new Error('Evento no encontrado');

    // 1. Aplicar reglas de negocio para el borrado
    if (event.status === 'CREATED') {
      if (userRole !== 'PAYPAC' && userRole !== 'ORGANIZER') {
        throw new Error('Solo usuarios con rol PAYPAC u ORGANIZER pueden eliminar eventos en estado CREATED');
      }
    } else if (event.status === 'CANCELED') {
      if (userRole !== 'PAYPAC') {
        throw new Error(`Solo usuarios con rol PAYPAC pueden eliminar eventos en estado CANCELED`);
      }
    } else {
      throw new Error(`No se permite eliminar un evento en estado ${event.status}.`);
    }

    // 2. Ejecutar borrado en cascada manual para relaciones sin 'onDelete: Cascade' en el schema
    return prisma.$transaction([
      // Eliminar etapas vinculadas a las localidades
      prisma.eventStages.deleteMany({
        where: { locality: { event_id: id } }
      }),
      prisma.eventLocalities.deleteMany({ where: { event_id: id } }),
      prisma.eventRewardRules.deleteMany({ where: { event_id: id } }),
      prisma.eventBalancePromoters.deleteMany({ where: { event_id: id } }),
      prisma.eventDcto.deleteMany({ where: { event_id: id } }),
      prisma.eventSeatStatus.deleteMany({ where: { event_id: id } }),
      
      // Limpieza de ventas (Tickets e Invoices)
      prisma.ticket.deleteMany({ where: { event_id: id } }),
      prisma.invoiceTickets.deleteMany({ where: { invoice: { event_id: id } } }),
      prisma.invoice.deleteMany({ where: { event_id: id } }),

      prisma.eventLiquidation.deleteMany({ where: { event_id: id } }),
      
      // Listas auxiliares
      prisma.eventWaitingList.deleteMany({ where: { event_id: id } }),
      prisma.eventPrivateGuestList.deleteMany({ where: { event_id: id } }),

      // Se eliminan manualmente estas tablas para evitar violaciones de FK si el Cascade no está activo en la DB
      prisma.eventFavorites.deleteMany({ where: { event_id: id } }),
      prisma.eventStaffAssignment.deleteMany({ where: { event_id: id } }),
      prisma.eventView.deleteMany({ where: { event_id: id } }),
      prisma.event.delete({ where: { id } }),
    ]);
  }

  /**
   * Actualizar solo el status del evento
   */
  async updateStatus(id: number, status: EVENT_STATUS) {
    return prisma.event.update({
      where: { id },
      data: { status },
      include: {
        category: true,
        subcategory: true,
      },
    });
  }

  /**
   * Verificar si un evento existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.event.count({ where: { id } });
    return count > 0;
  }

  /**
   * Contar eventos por organizador
   */
  async countByOrganizer(organizerId: number): Promise<number> {
    return prisma.event.count({ where: { organizer_id: organizerId } });
  }

  /**
 * Obtener eventos disponibles para promotores externos
 * Incluye resumen de ventas del promotor en cada evento
 */
async findAvailableForPromoters(promoter_id: number) {
  const events = await prisma.event.findMany({
    where: {
      allow_external_promoters: true,
      status: { in: ['APPROVED', 'ACTIVE'] },
    },
    include: {
      category: true,
      subcategory: true,
      subgenre: true,
      localities: {
        include: { stages: true },
      },
      promoterBalances: {
        where: { promoter_id },
        select: {
          tickets_sold: true,
          reward_amount: true,
          status: true,
        },
      },
    },
    orderBy: { date_event: 'asc' },
  });

  return events.map(({ promoterBalances, ...event }) => {
    const tickets_sold    = promoterBalances.reduce((acc, b) => acc + b.tickets_sold, 0);
    const total_earned    = promoterBalances.reduce((acc, b) => acc + (b.reward_amount ?? 0), 0);
    const pending_amount  = promoterBalances
      .filter(b => b.status === 0)
      .reduce((acc, b) => acc + (b.reward_amount ?? 0), 0);

    return {
      ...event,
      promoter_summary: {
        has_sales:      tickets_sold > 0,
        tickets_sold,
        total_earned,
        pending_amount,
      },
    };
  });
}

async findByPublicId(publicId: string) {
  return prisma.event.findUnique({
    where: { public_id: publicId },
    include: {
      category: true,
      subcategory: true,
      subgenre: true,
      localities: { include: { stages: true } },
    },
  });
}

async findByPublicUrl(publicUrl: string) {
  return prisma.event.findUnique({
    where: { public_url: publicUrl },
    include: {
      category: true,
      subcategory: true,
      subgenre: true,
      localities: { include: { stages: true } },
    },
  });
}

async getFeaturedEvents(limit = 10) {
  return prisma.event.findMany({
    where: {
      featured: true,
      status: { in: ['APPROVED', 'ACTIVE'] },
    },
    orderBy: { date_event: 'asc' },
    take: limit,
    include: {
      category: true,
      subcategory: true,
      subgenre: true,
      localities: { include: { stages: true } },
    },
  });
}
}