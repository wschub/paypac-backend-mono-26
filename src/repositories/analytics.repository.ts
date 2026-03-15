import { prisma } from '../config/db';

// ─── Date Range Helper ────────────────────────────────────────────────────────

export type DateRangeKey = 'today' | 'month' | 'quarter' | 'year' | 'custom';

export function resolveDateRange(range: DateRangeKey, from?: string, to?: string) {
  const now  = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startOf = (d: Date) => { d.setHours(0,0,0,0); return d; };
  const endOf   = (d: Date) => { d.setHours(23,59,59,999); return d; };

  switch (range) {
    case 'today':
      return { from: startOf(new Date()), to: endOf(new Date()) };
    case 'month':
      return { from: new Date(year, month, 1), to: new Date(year, month + 1, 0, 23, 59, 59) };
    case 'quarter': {
      const q = Math.floor(month / 3);
      return { from: new Date(year, q * 3, 1), to: new Date(year, q * 3 + 3, 0, 23, 59, 59) };
    }
    case 'year':
      return { from: new Date(year, 0, 1), to: new Date(year, 11, 31, 23, 59, 59) };
    case 'custom':
      return { from: new Date(from!), to: new Date(to!) };
    default:
      return { from: new Date(year, month, 1), to: new Date(year, month + 1, 0, 23, 59, 59) };
  }
}

// ─── Analytics Repository ─────────────────────────────────────────────────────

export class AnalyticsRepository {

  // ── Shared ────────────────────────────────────────────────────────────────

  async getRevenueStats(from: Date, to: Date, organizer_id?: number) {
    const eventFilter = organizer_id ? { organizer_id } : {};
    const events = organizer_id
      ? (await prisma.event.findMany({ where: eventFilter, select: { id: true } })).map(e => e.id)
      : undefined;

    const where: any = {
      status: 'PAID',
      createdAt: { gte: from, lte: to },
      ...(events && { event_id: { in: events } }),
    };

    const agg = await prisma.invoice.aggregate({
      where,
      _sum:   { total: true, total_ticket_dcto: true },
      _count: { id: true },
      _avg:   { total: true },
    });

    // Comisiones desde EventLiquidation
    const commissions = await prisma.eventLiquidation.aggregate({
      where: {
        liquidation_date: { gte: from, lte: to },
        ...(organizer_id && { company: { users: { some: { id: organizer_id } } } }),
      },
      _sum: { paypac_commission: true, net_amount: true, gross_amount: true },
    });

    return {
      total_revenue:    agg._sum.total          ?? 0,
      total_invoices:   agg._count.id           ?? 0,
      avg_ticket:       Math.round(agg._avg.total ?? 0),
      total_commission: commissions._sum.paypac_commission ?? 0,
      total_net:        commissions._sum.net_amount        ?? 0,
      gmv:              commissions._sum.gross_amount      ?? 0,
    };
  }

  async getRevenueByMonth(from: Date, to: Date, organizer_id?: number) {
  const events = organizer_id
    ? (await prisma.event.findMany({ where: { organizer_id }, select: { id: true } })).map(e => e.id)
    : undefined;
 
  const invoices = await prisma.invoice.findMany({
    where: {
      status: 'PAID',
      createdAt: { gte: from, lte: to },
      ...(events && { event_id: { in: events } }),
    },
    select: {
      total:                      true,
      createdAt:                  true,
      paypac_commission_amount:   true,
      promoter_commission_amount: true,
    },
  });
 
  const byMonth: Record<string, {
    revenue:     number;
    commissions: number;
    promoters:   number;
    count:       number;
  }> = {};
 
  for (const inv of invoices) {
    const key = `${inv.createdAt.getFullYear()}-${String(inv.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { revenue: 0, commissions: 0, promoters: 0, count: 0 };
    byMonth[key].revenue     += inv.total;
    byMonth[key].commissions += inv.paypac_commission_amount   ?? 0;
    byMonth[key].promoters   += inv.promoter_commission_amount ?? 0;
    byMonth[key].count++;
  }
 
  return Object.entries(byMonth)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}


// ─── 2. AGREGAR getOrganizerCohorts() ────────────────────────────────────────
 
async getOrganizerCohorts() {
  const companies = await prisma.company.findMany({
    where: { status: 1 },
    select: { id: true, createdAt: true },
  });
 
  // Agrupar por quarter de creación
  const byQuarter: Record<string, { total: number; ids: number[] }> = {};
  for (const c of companies) {
    const q = `Q${Math.floor(c.createdAt.getMonth() / 3) + 1} ${c.createdAt.getFullYear()}`;
    if (!byQuarter[q]) byQuarter[q] = { total: 0, ids: [] };
    byQuarter[q].total++;
    byQuarter[q].ids.push(c.id);
  }
 
  // Activa = tuvo al menos 1 evento creado en los últimos 90 días
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
 
  const results = await Promise.all(
    Object.entries(byQuarter).map(async ([quarter, data]) => {
      const activeOrgs = await prisma.event.groupBy({
        by: ['organizer_id'],
        where: {
          organizer_id: { in: data.ids },
          createdAt:    { gte: cutoff },
        },
      });
 
      const activeIds = new Set(activeOrgs.map(e => e.organizer_id));
      const active    = data.ids.filter(id => activeIds.has(id)).length;
      const churned   = data.total - active;
 
      return {
        quarter,
        total:     data.total,
        active,
        churned,
        retention: data.total > 0 ? Math.round((active / data.total) * 100) : 0,
      };
    })
  );
 
  return results.sort((a, b) => a.quarter.localeCompare(b.quarter));
}


  async getTicketStats(from: Date, to: Date, organizer_id?: number) {
    const events = organizer_id
      ? (await prisma.event.findMany({ where: { organizer_id }, select: { id: true } })).map(e => e.id)
      : undefined;

    const total = await prisma.ticket.count({
      where: {
        created_at: { gte: from, lte: to },
        ...(events && { event_id: { in: events } }),
      },
    });

    return { total_tickets: total };
  }

  async getTicketsByDay(from: Date, to: Date, organizer_id?: number) {
    const events = organizer_id
      ? (await prisma.event.findMany({ where: { organizer_id }, select: { id: true } })).map(e => e.id)
      : undefined;

    const tickets = await prisma.ticket.findMany({
      where: {
        created_at: { gte: from, lte: to },
        ...(events && { event_id: { in: events } }),
      },
      select: { created_at: true },
    });

    const byDay: Record<string, number> = {};
    for (const t of tickets) {
      const key = t.created_at.toISOString().split('T')[0];
      byDay[key] = (byDay[key] ?? 0) + 1;
    }
    return Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getOccupancyRate(organizer_id?: number) {
    const events = await prisma.event.findMany({
      where: {
        status: { in: ['ACTIVE', 'APPROVED'] },
        ...(organizer_id && { organizer_id }),
      },
      include: {
        localities: { select: { num_max_tickets: true, num_tickets_sold: true } },
      },
    });

    let totalCapacity = 0;
    let totalSold     = 0;
    for (const e of events) {
      for (const l of e.localities) {
        totalCapacity += l.num_max_tickets ?? 0;
        totalSold     += l.num_tickets_sold ?? 0;
      }
    }

    return {
      total_capacity: totalCapacity,
      total_sold:     totalSold,
      occupancy_rate: totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100 * 10) / 10 : 0,
    };
  }

  // ── PAYPAC only ───────────────────────────────────────────────────────────

  async getEventsByStatus() {
    const grouped = await prisma.event.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    return grouped.map(g => ({ status: g.status, count: g._count.id }));
  }

  async getUsersByRole() {
    const grouped = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });
    return grouped.map(g => ({ role: g.role, count: g._count.id }));
  }

  async getTopEventsByOccupancy(limit = 5, from: Date, to: Date) {
    const events = await prisma.event.findMany({
      where: { status: { in: ['ACTIVE', 'APPROVED', 'FINALIZED'] } },
      include: {
        localities: { select: { num_max_tickets: true, num_tickets_sold: true } },
      },
      take: 50,
    });

    const invoiceAgg = await prisma.invoice.groupBy({
      by: ['event_id'],
      where: { status: 'PAID', createdAt: { gte: from, lte: to } },
      _sum: { total: true },
    });
    const revenueMap = Object.fromEntries(invoiceAgg.map(a => [a.event_id, a._sum.total ?? 0]));

    return events
      .map(e => {
        const capacity = e.localities.reduce((a, l) => a + (l.num_max_tickets ?? 0), 0);
        const sold     = e.localities.reduce((a, l) => a + (l.num_tickets_sold ?? 0), 0);
        return {
          event_id:     e.id,
          name:         e.name,
          sold,
          capacity,
          revenue:      revenueMap[e.id] ?? 0,
          occupancy_pct: capacity > 0 ? Math.round((sold / capacity) * 100) : 0,
        };
      })
      .sort((a, b) => b.occupancy_pct - a.occupancy_pct)
      .slice(0, limit);
  }

  async getOperationalAlerts() {
    const [pendingCompanies, eventsToday, eventsNearCapacity] = await Promise.all([
      prisma.company.count({ where: { status: 0 } }),
      prisma.event.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
      }),
      prisma.event.findMany({
        where: { status: { in: ['ACTIVE', 'APPROVED'] } },
        include: { localities: { select: { num_max_tickets: true, num_tickets_sold: true } } },
      }).then(events => events.filter(e => {
        const cap  = e.localities.reduce((a, l) => a + (l.num_max_tickets ?? 0), 0);
        const sold = e.localities.reduce((a, l) => a + (l.num_tickets_sold ?? 0), 0);
        return cap > 0 && (sold / cap) >= 0.95;
      }).length),
    ]);

    const overdueLiquidations = await prisma.eventLiquidation.count({ where: { status: 'OVERDUE' } });

    return {
      pending_companies:      pendingCompanies,
      events_published_today: eventsToday,
      events_near_capacity:   eventsNearCapacity,
      overdue_liquidations:   overdueLiquidations,
    };
  }

  async getRefundStats(from: Date, to: Date) {
    const agg = await prisma.invoice.aggregate({
      where: { status: 'REFUNDED', refunded_at: { gte: from, lte: to } },
      _sum:   { refunded_amount: true },
      _count: { id: true },
    });
    return {
      total_refunds:  agg._sum.refunded_amount ?? 0,
      refund_count:   agg._count.id             ?? 0,
    };
  }

  async getOrganizerHealth() {
    const companies = await prisma.company.findMany({
      where: { status: 1 },
      include: {
        users: { where: { role: 'ORGANIZER' }, select: { id: true } },
      },
    });

    const results = await Promise.all(companies.map(async company => {
      const organizerIds = company.users.map(u => u.id);
      const eventIds = (await prisma.event.findMany({
        where: { organizer_id: { in: organizerIds } },
        select: { id: true },
      })).map(e => e.id);

      const revenue = await prisma.invoice.aggregate({
        where: { event_id: { in: eventIds }, status: 'PAID' },
        _sum: { total: true },
      });

      const eventCount = eventIds.length;

      return {
        company_id:   company.id,
        company_name: company.company_name,
        gmv:          revenue._sum.total ?? 0,
        event_count:  eventCount,
        nps_score:    company.nps_score,
      };
    }));

    return results.sort((a, b) => b.gmv - a.gmv);
  }

  async getGMVByCategory(from: Date, to: Date) {
    const invoices = await prisma.invoice.findMany({
      where: { status: 'PAID', createdAt: { gte: from, lte: to } },
      select: { total: true, event_id: true },
    });

    const eventIds = [...new Set(invoices.map(i => i.event_id))];
    const events   = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      include: { category: { select: { id: true, category_name: true } } },
    });
    const catMap = Object.fromEntries(events.map(e => [e.id, e.category?.category_name ?? 'Sin categoría']));

    const byCategory: Record<string, { gmv: number; count: number }> = {};
    for (const inv of invoices) {
      const cat = catMap[inv.event_id] ?? 'Sin categoría';
      if (!byCategory[cat]) byCategory[cat] = { gmv: 0, count: 0 };
      byCategory[cat].gmv   += inv.total;
      byCategory[cat].count += 1;
    }

    return Object.entries(byCategory)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.gmv - a.gmv);
  }

  async getGeographicAnalysis() {
    const buyers = await prisma.user.groupBy({
      by: ['city'],
      where: { role: 'CUSTOMER', city: { not: null } },
      _count: { id: true },
    });

    const eventsByCity = await prisma.event.groupBy({
      by: ['city'],
      _count: { id: true },
    });

    const cityMap = Object.fromEntries(eventsByCity.map(e => [e.city, e._count.id]));

    return buyers
      .filter(b => b.city)
      .map(b => ({
        city:         b.city!,
        buyers:       b._count.id,
        events:       cityMap[b.city!] ?? 0,
        demand_ratio: cityMap[b.city!]
          ? Math.round((b._count.id / cityMap[b.city!]) * 10) / 10
          : b._count.id,
      }))
      .sort((a, b) => b.buyers - a.buyers);
  }

  async getRiskIndicators(from: Date, to: Date) {
    const [totalPaid, totalRefunded, overdueLiq, lowOccupancyEvents] = await Promise.all([
      prisma.invoice.count({ where: { status: 'PAID', createdAt: { gte: from, lte: to } } }),
      prisma.invoice.count({ where: { status: 'REFUNDED', refunded_at: { gte: from, lte: to } } }),
      prisma.eventLiquidation.findMany({
        where: { status: 'OVERDUE' },
        include: { company: { select: { company_name: true } }, event: { select: { name: true } } },
      }),
      prisma.event.findMany({
        where: { status: { in: ['ACTIVE', 'APPROVED'] } },
        include: { localities: { select: { num_max_tickets: true, num_tickets_sold: true } } },
      }).then(events => events.filter(e => {
        const cap  = e.localities.reduce((a, l) => a + (l.num_max_tickets ?? 0), 0);
        const sold = e.localities.reduce((a, l) => a + (l.num_tickets_sold ?? 0), 0);
        return cap > 0 && (sold / cap) < 0.30;
      })),
    ]);

    const refund_rate = totalPaid > 0 ? Math.round((totalRefunded / totalPaid) * 100 * 10) / 10 : 0;

    return {
      refund_rate,
      overdue_liquidations: overdueLiq,
      low_occupancy_events: lowOccupancyEvents.map(e => ({
        event_id:     e.id,
        name:         e.name,
        date_event:   e.date_event,
        occupancy_pct: (() => {
          const cap  = e.localities.reduce((a, l) => a + (l.num_max_tickets ?? 0), 0);
          const sold = e.localities.reduce((a, l) => a + (l.num_tickets_sold ?? 0), 0);
          return cap > 0 ? Math.round((sold / cap) * 100) : 0;
        })(),
      })),
    };
  }

  // ── ORGANIZER only ────────────────────────────────────────────────────────

  async getMyEventsProgress(organizer_id: number) {
    const events = await prisma.event.findMany({
      where: { organizer_id, status: { not: 'CANCELED' } },
      include: {
        localities: { select: { num_max_tickets: true, num_tickets_sold: true } },
      },
      orderBy: { date_event: 'asc' },
    });

    const eventIds = events.map(e => e.id);
    const invoiceAgg = await prisma.invoice.groupBy({
      by: ['event_id'],
      where: { event_id: { in: eventIds }, status: 'PAID' },
      _sum: { total: true },
    });
    const revenueMap = Object.fromEntries(invoiceAgg.map(a => [a.event_id, a._sum.total ?? 0]));

    return events.map(e => {
      const capacity = e.localities.reduce((a, l) => a + (l.num_max_tickets ?? 0), 0);
      const sold     = e.localities.reduce((a, l) => a + (l.num_tickets_sold ?? 0), 0);
      return {
        event_id:      e.id,
        name:          e.name,
        date_event:    e.date_event,
        status:        e.status,
        sold,
        capacity,
        revenue:       revenueMap[e.id] ?? 0,
        occupancy_pct: capacity > 0 ? Math.round((sold / capacity) * 100) : 0,
      };
    });
  }

  async getUpcomingEvents(organizer_id: number, days = 60) {
    const to = new Date();
    to.setDate(to.getDate() + days);
    return prisma.event.count({
      where: {
        organizer_id,
        date_event: { gte: new Date(), lte: to },
        status: { in: ['APPROVED', 'SCHEDULED', 'ACTIVE'] },
      },
    });
  }

  async getEventStatusSummary(organizer_id: number) {
    const grouped = await prisma.event.groupBy({
      by: ['status'],
      where: { organizer_id },
      _count: { id: true },
    });
    return grouped.map(g => ({ status: g.status, count: g._count.id }));
  }

  async getSalesByChannel(event_id: number, from?: Date, to?: Date) {
    const invoices = await prisma.invoice.findMany({
      where: {
        event_id,
        status: 'PAID',
        ...(from && to && { createdAt: { gte: from, lte: to } }),
      },
      select: { total: true, num_items: true, createdAt: true },
    });

    // sales_channel viene de Event — aproximamos por invoice directa vs promoter
    const directSales = invoices.reduce((a, i) => ({ total: a.total + i.total, tickets: a.tickets + i.num_items }), { total: 0, tickets: 0 });
    return { direct: directSales, invoices_count: invoices.length };
  }

  async getTicketsByHour(event_id: number, date: Date) {
    const start = new Date(date); start.setHours(0,0,0,0);
    const end   = new Date(date); end.setHours(23,59,59,999);

    const tickets = await prisma.ticket.findMany({
      where: { event_id, created_at: { gte: start, lte: end } },
      select: { created_at: true },
    });

    const byHour: Record<number, number> = {};
    for (const t of tickets) {
      const h = t.created_at.getHours();
      byHour[h] = (byHour[h] ?? 0) + 1;
    }
    return Array.from({ length: 24 }, (_, h) => ({ hour: h, count: byHour[h] ?? 0 }));
  }

  async getBuyerOrigin(event_id: number) {
    const tickets = await prisma.ticket.findMany({
      where: { event_id },
      select: { customer_id: true },
    });
    const customerIds = [...new Set(tickets.map(t => t.customer_id))];

    const buyers = await prisma.user.groupBy({
      by: ['city'],
      where: { id: { in: customerIds }, city: { not: null } },
      _count: { id: true },
    });

    const total = buyers.reduce((a, b) => a + b._count.id, 0);
    return buyers
      .filter(b => b.city)
      .map(b => ({ city: b.city!, count: b._count.id, pct: total > 0 ? Math.round((b._count.id / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  }

  async getBuyerDemographics(event_id: number) {
    const tickets = await prisma.ticket.findMany({
      where: { event_id },
      select: { customer_id: true },
    });
    const customerIds = [...new Set(tickets.map(t => t.customer_id))];
    const buyers = await prisma.user.findMany({
      where: { id: { in: customerIds }, birth_date: { not: null } },
      select: { birth_date: true },
    });

    const now = new Date();
    const segments: Record<string, number> = { '18-25': 0, '26-34': 0, '35-44': 0, '45+': 0 };
    for (const b of buyers) {
      const age = Math.floor((now.getTime() - b.birth_date!.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (age < 26)      segments['18-25']++;
      else if (age < 35) segments['26-34']++;
      else if (age < 45) segments['35-44']++;
      else               segments['45+']++;
    }
    const total = Object.values(segments).reduce((a, b) => a + b, 0);
    return Object.entries(segments).map(([segment, count]) => ({
      segment,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }
}