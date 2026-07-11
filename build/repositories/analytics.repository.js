"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
exports.resolveDateRange = resolveDateRange;
const db_1 = require("../config/db");
function resolveDateRange(range, from, to) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOf = (d) => { d.setHours(0, 0, 0, 0); return d; };
    const endOf = (d) => { d.setHours(23, 59, 59, 999); return d; };
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
            return { from: new Date(from), to: new Date(to) };
        default:
            return { from: new Date(year, month, 1), to: new Date(year, month + 1, 0, 23, 59, 59) };
    }
}
// ─── Analytics Repository ─────────────────────────────────────────────────────
class AnalyticsRepository {
    // ── Shared ────────────────────────────────────────────────────────────────
    getRevenueStats(from, to, organizer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const eventFilter = organizer_id ? { organizer_id } : {};
            const events = organizer_id
                ? (yield db_1.prisma.event.findMany({ where: eventFilter, select: { id: true } })).map(e => e.id)
                : undefined;
            const where = Object.assign({ status: 'PAID', createdAt: { gte: from, lte: to } }, (events && { event_id: { in: events } }));
            const agg = yield db_1.prisma.invoice.aggregate({
                where,
                _sum: { total: true, total_ticket_dcto: true },
                _count: { id: true },
                _avg: { total: true },
            });
            // Comisiones desde EventLiquidation
            const commissions = yield db_1.prisma.eventLiquidation.aggregate({
                where: Object.assign({ liquidation_date: { gte: from, lte: to } }, (organizer_id && { company: { users: { some: { id: organizer_id } } } })),
                _sum: { paypac_commission: true, net_amount: true, gross_amount: true },
            });
            return {
                total_revenue: (_a = agg._sum.total) !== null && _a !== void 0 ? _a : 0,
                total_invoices: (_b = agg._count.id) !== null && _b !== void 0 ? _b : 0,
                avg_ticket: Math.round((_c = agg._avg.total) !== null && _c !== void 0 ? _c : 0),
                total_commission: (_d = commissions._sum.paypac_commission) !== null && _d !== void 0 ? _d : 0,
                total_net: (_e = commissions._sum.net_amount) !== null && _e !== void 0 ? _e : 0,
                gmv: (_f = commissions._sum.gross_amount) !== null && _f !== void 0 ? _f : 0,
            };
        });
    }
    getRevenueByMonth(from, to, organizer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const events = organizer_id
                ? (yield db_1.prisma.event.findMany({ where: { organizer_id }, select: { id: true } })).map(e => e.id)
                : undefined;
            const invoices = yield db_1.prisma.invoice.findMany({
                where: Object.assign({ status: 'PAID', createdAt: { gte: from, lte: to } }, (events && { event_id: { in: events } })),
                select: {
                    total: true,
                    createdAt: true,
                    paypac_commission_amount: true,
                    promoter_commission_amount: true,
                },
            });
            const byMonth = {};
            for (const inv of invoices) {
                const key = `${inv.createdAt.getFullYear()}-${String(inv.createdAt.getMonth() + 1).padStart(2, '0')}`;
                if (!byMonth[key])
                    byMonth[key] = { revenue: 0, commissions: 0, promoters: 0, count: 0 };
                byMonth[key].revenue += inv.total;
                byMonth[key].commissions += (_a = inv.paypac_commission_amount) !== null && _a !== void 0 ? _a : 0;
                byMonth[key].promoters += (_b = inv.promoter_commission_amount) !== null && _b !== void 0 ? _b : 0;
                byMonth[key].count++;
            }
            return Object.entries(byMonth)
                .map(([month, data]) => (Object.assign({ month }, data)))
                .sort((a, b) => a.month.localeCompare(b.month));
        });
    }
    // ─── 2. AGREGAR getOrganizerCohorts() ────────────────────────────────────────
    getOrganizerCohorts() {
        return __awaiter(this, void 0, void 0, function* () {
            const companies = yield db_1.prisma.company.findMany({
                where: { status: 1 },
                select: { id: true, createdAt: true },
            });
            // Agrupar por quarter de creación
            const byQuarter = {};
            for (const c of companies) {
                const q = `Q${Math.floor(c.createdAt.getMonth() / 3) + 1} ${c.createdAt.getFullYear()}`;
                if (!byQuarter[q])
                    byQuarter[q] = { total: 0, ids: [] };
                byQuarter[q].total++;
                byQuarter[q].ids.push(c.id);
            }
            // Activa = tuvo al menos 1 evento creado en los últimos 90 días
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 90);
            const results = yield Promise.all(Object.entries(byQuarter).map((_a) => __awaiter(this, [_a], void 0, function* ([quarter, data]) {
                const activeOrgs = yield db_1.prisma.event.groupBy({
                    by: ['organizer_id'],
                    where: {
                        organizer_id: { in: data.ids },
                        createdAt: { gte: cutoff },
                    },
                });
                const activeIds = new Set(activeOrgs.map(e => e.organizer_id));
                const active = data.ids.filter(id => activeIds.has(id)).length;
                const churned = data.total - active;
                return {
                    quarter,
                    total: data.total,
                    active,
                    churned,
                    retention: data.total > 0 ? Math.round((active / data.total) * 100) : 0,
                };
            })));
            return results.sort((a, b) => a.quarter.localeCompare(b.quarter));
        });
    }
    getTicketStats(from, to, organizer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = organizer_id
                ? (yield db_1.prisma.event.findMany({ where: { organizer_id }, select: { id: true } })).map(e => e.id)
                : undefined;
            const total = yield db_1.prisma.ticket.count({
                where: Object.assign({ created_at: { gte: from, lte: to } }, (events && { event_id: { in: events } })),
            });
            return { total_tickets: total };
        });
    }
    getTicketsByDay(from, to, organizer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const events = organizer_id
                ? (yield db_1.prisma.event.findMany({ where: { organizer_id }, select: { id: true } })).map(e => e.id)
                : undefined;
            const tickets = yield db_1.prisma.ticket.findMany({
                where: Object.assign({ created_at: { gte: from, lte: to } }, (events && { event_id: { in: events } })),
                select: { created_at: true },
            });
            const byDay = {};
            for (const t of tickets) {
                const key = t.created_at.toISOString().split('T')[0];
                byDay[key] = ((_a = byDay[key]) !== null && _a !== void 0 ? _a : 0) + 1;
            }
            return Object.entries(byDay)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date));
        });
    }
    getOccupancyRate(organizer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const events = yield db_1.prisma.event.findMany({
                where: Object.assign({ status: { in: ['ACTIVE', 'APPROVED'] } }, (organizer_id && { organizer_id })),
                include: {
                    localities: { select: { num_max_tickets: true, num_tickets_sold: true } },
                },
            });
            let totalCapacity = 0;
            let totalSold = 0;
            for (const e of events) {
                for (const l of e.localities) {
                    totalCapacity += (_a = l.num_max_tickets) !== null && _a !== void 0 ? _a : 0;
                    totalSold += (_b = l.num_tickets_sold) !== null && _b !== void 0 ? _b : 0;
                }
            }
            return {
                total_capacity: totalCapacity,
                total_sold: totalSold,
                occupancy_rate: totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100 * 10) / 10 : 0,
            };
        });
    }
    // ── PAYPAC only ───────────────────────────────────────────────────────────
    getEventsByStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const grouped = yield db_1.prisma.event.groupBy({
                by: ['status'],
                _count: { id: true },
            });
            return grouped.map(g => ({ status: g.status, count: g._count.id }));
        });
    }
    getUsersByRole() {
        return __awaiter(this, void 0, void 0, function* () {
            const grouped = yield db_1.prisma.user.groupBy({
                by: ['role'],
                _count: { id: true },
            });
            return grouped.map(g => ({ role: g.role, count: g._count.id }));
        });
    }
    getTopEventsByOccupancy() {
        return __awaiter(this, arguments, void 0, function* (limit = 5, from, to) {
            const events = yield db_1.prisma.event.findMany({
                where: { status: { in: ['ACTIVE', 'APPROVED', 'FINALIZED'] } },
                include: {
                    localities: { select: { num_max_tickets: true, num_tickets_sold: true } },
                },
                take: 50,
            });
            const invoiceAgg = yield db_1.prisma.invoice.groupBy({
                by: ['event_id'],
                where: { status: 'PAID', createdAt: { gte: from, lte: to } },
                _sum: { total: true },
            });
            const revenueMap = Object.fromEntries(invoiceAgg.map(a => { var _a; return [a.event_id, (_a = a._sum.total) !== null && _a !== void 0 ? _a : 0]; }));
            return events
                .map(e => {
                var _a;
                const capacity = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_max_tickets) !== null && _a !== void 0 ? _a : 0); }, 0);
                const sold = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_tickets_sold) !== null && _a !== void 0 ? _a : 0); }, 0);
                return {
                    event_id: e.id,
                    name: e.name,
                    sold,
                    capacity,
                    revenue: (_a = revenueMap[e.id]) !== null && _a !== void 0 ? _a : 0,
                    occupancy_pct: capacity > 0 ? Math.round((sold / capacity) * 100) : 0,
                };
            })
                .sort((a, b) => b.occupancy_pct - a.occupancy_pct)
                .slice(0, limit);
        });
    }
    getOperationalAlerts() {
        return __awaiter(this, void 0, void 0, function* () {
            const [pendingCompanies, eventsToday, eventsNearCapacity] = yield Promise.all([
                db_1.prisma.company.count({ where: { status: 0 } }),
                db_1.prisma.event.count({
                    where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
                }),
                db_1.prisma.event.findMany({
                    where: { status: { in: ['ACTIVE', 'APPROVED'] } },
                    include: { localities: { select: { num_max_tickets: true, num_tickets_sold: true } } },
                }).then(events => events.filter(e => {
                    const cap = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_max_tickets) !== null && _a !== void 0 ? _a : 0); }, 0);
                    const sold = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_tickets_sold) !== null && _a !== void 0 ? _a : 0); }, 0);
                    return cap > 0 && (sold / cap) >= 0.95;
                }).length),
            ]);
            const overdueLiquidations = yield db_1.prisma.eventLiquidation.count({ where: { status: 'OVERDUE' } });
            return {
                pending_companies: pendingCompanies,
                events_published_today: eventsToday,
                events_near_capacity: eventsNearCapacity,
                overdue_liquidations: overdueLiquidations,
            };
        });
    }
    getRefundStats(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const agg = yield db_1.prisma.invoice.aggregate({
                where: { status: 'REFUNDED', refunded_at: { gte: from, lte: to } },
                _sum: { refunded_amount: true },
                _count: { id: true },
            });
            return {
                total_refunds: (_a = agg._sum.refunded_amount) !== null && _a !== void 0 ? _a : 0,
                refund_count: (_b = agg._count.id) !== null && _b !== void 0 ? _b : 0,
            };
        });
    }
    getOrganizerHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            const companies = yield db_1.prisma.company.findMany({
                where: { status: 1 },
                include: {
                    users: { where: { role: 'ORGANIZER' }, select: { id: true } },
                },
            });
            const results = yield Promise.all(companies.map((company) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const organizerIds = company.users.map(u => u.id);
                const eventIds = (yield db_1.prisma.event.findMany({
                    where: { organizer_id: { in: organizerIds } },
                    select: { id: true },
                })).map(e => e.id);
                const revenue = yield db_1.prisma.invoice.aggregate({
                    where: { event_id: { in: eventIds }, status: 'PAID' },
                    _sum: { total: true },
                });
                const eventCount = eventIds.length;
                return {
                    company_id: company.id,
                    company_name: company.company_name,
                    gmv: (_a = revenue._sum.total) !== null && _a !== void 0 ? _a : 0,
                    event_count: eventCount,
                    nps_score: company.nps_score,
                };
            })));
            return results.sort((a, b) => b.gmv - a.gmv);
        });
    }
    getGMVByCategory(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const invoices = yield db_1.prisma.invoice.findMany({
                where: { status: 'PAID', createdAt: { gte: from, lte: to } },
                select: { total: true, event_id: true },
            });
            const eventIds = [...new Set(invoices.map(i => i.event_id))];
            const events = yield db_1.prisma.event.findMany({
                where: { id: { in: eventIds } },
                include: { category: { select: { id: true, category_name: true } } },
            });
            const catMap = Object.fromEntries(events.map(e => { var _a, _b; return [e.id, (_b = (_a = e.category) === null || _a === void 0 ? void 0 : _a.category_name) !== null && _b !== void 0 ? _b : 'Sin categoría']; }));
            const byCategory = {};
            for (const inv of invoices) {
                const cat = (_a = catMap[inv.event_id]) !== null && _a !== void 0 ? _a : 'Sin categoría';
                if (!byCategory[cat])
                    byCategory[cat] = { gmv: 0, count: 0 };
                byCategory[cat].gmv += inv.total;
                byCategory[cat].count += 1;
            }
            return Object.entries(byCategory)
                .map(([category, data]) => (Object.assign({ category }, data)))
                .sort((a, b) => b.gmv - a.gmv);
        });
    }
    getGeographicAnalysis() {
        return __awaiter(this, void 0, void 0, function* () {
            const buyers = yield db_1.prisma.user.groupBy({
                by: ['city'],
                where: { role: 'CUSTOMER', city: { not: null } },
                _count: { id: true },
            });
            const eventsByCity = yield db_1.prisma.event.groupBy({
                by: ['city'],
                _count: { id: true },
            });
            const cityMap = Object.fromEntries(eventsByCity.map(e => [e.city, e._count.id]));
            return buyers
                .filter(b => b.city)
                .map(b => {
                var _a;
                return ({
                    city: b.city,
                    buyers: b._count.id,
                    events: (_a = cityMap[b.city]) !== null && _a !== void 0 ? _a : 0,
                    demand_ratio: cityMap[b.city]
                        ? Math.round((b._count.id / cityMap[b.city]) * 10) / 10
                        : b._count.id,
                });
            })
                .sort((a, b) => b.buyers - a.buyers);
        });
    }
    getRiskIndicators(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalPaid, totalRefunded, overdueLiq, lowOccupancyEvents] = yield Promise.all([
                db_1.prisma.invoice.count({ where: { status: 'PAID', createdAt: { gte: from, lte: to } } }),
                db_1.prisma.invoice.count({ where: { status: 'REFUNDED', refunded_at: { gte: from, lte: to } } }),
                db_1.prisma.eventLiquidation.findMany({
                    where: { status: 'OVERDUE' },
                    include: { company: { select: { company_name: true } }, event: { select: { name: true } } },
                }),
                db_1.prisma.event.findMany({
                    where: { status: { in: ['ACTIVE', 'APPROVED'] } },
                    include: { localities: { select: { num_max_tickets: true, num_tickets_sold: true } } },
                }).then(events => events.filter(e => {
                    const cap = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_max_tickets) !== null && _a !== void 0 ? _a : 0); }, 0);
                    const sold = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_tickets_sold) !== null && _a !== void 0 ? _a : 0); }, 0);
                    return cap > 0 && (sold / cap) < 0.30;
                })),
            ]);
            const refund_rate = totalPaid > 0 ? Math.round((totalRefunded / totalPaid) * 100 * 10) / 10 : 0;
            return {
                refund_rate,
                overdue_liquidations: overdueLiq,
                low_occupancy_events: lowOccupancyEvents.map(e => ({
                    event_id: e.id,
                    name: e.name,
                    date_event: e.date_event,
                    occupancy_pct: (() => {
                        const cap = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_max_tickets) !== null && _a !== void 0 ? _a : 0); }, 0);
                        const sold = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_tickets_sold) !== null && _a !== void 0 ? _a : 0); }, 0);
                        return cap > 0 ? Math.round((sold / cap) * 100) : 0;
                    })(),
                })),
            };
        });
    }
    // ── ORGANIZER only ────────────────────────────────────────────────────────
    getMyEventsProgress(organizer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield db_1.prisma.event.findMany({
                where: { organizer_id, status: { not: 'CANCELED' } },
                include: {
                    localities: { select: { num_max_tickets: true, num_tickets_sold: true } },
                },
                orderBy: { date_event: 'asc' },
            });
            const eventIds = events.map(e => e.id);
            const invoiceAgg = yield db_1.prisma.invoice.groupBy({
                by: ['event_id'],
                where: { event_id: { in: eventIds }, status: 'PAID' },
                _sum: { total: true },
            });
            const revenueMap = Object.fromEntries(invoiceAgg.map(a => { var _a; return [a.event_id, (_a = a._sum.total) !== null && _a !== void 0 ? _a : 0]; }));
            return events.map(e => {
                var _a;
                const capacity = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_max_tickets) !== null && _a !== void 0 ? _a : 0); }, 0);
                const sold = e.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_tickets_sold) !== null && _a !== void 0 ? _a : 0); }, 0);
                return {
                    event_id: e.id,
                    name: e.name,
                    date_event: e.date_event,
                    status: e.status,
                    sold,
                    capacity,
                    revenue: (_a = revenueMap[e.id]) !== null && _a !== void 0 ? _a : 0,
                    occupancy_pct: capacity > 0 ? Math.round((sold / capacity) * 100) : 0,
                };
            });
        });
    }
    getUpcomingEvents(organizer_id_1) {
        return __awaiter(this, arguments, void 0, function* (organizer_id, days = 60) {
            const to = new Date();
            to.setDate(to.getDate() + days);
            return db_1.prisma.event.count({
                where: {
                    organizer_id,
                    date_event: { gte: new Date(), lte: to },
                    status: { in: ['APPROVED', 'SCHEDULED', 'ACTIVE'] },
                },
            });
        });
    }
    getEventStatusSummary(organizer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const grouped = yield db_1.prisma.event.groupBy({
                by: ['status'],
                where: { organizer_id },
                _count: { id: true },
            });
            return grouped.map(g => ({ status: g.status, count: g._count.id }));
        });
    }
    getSalesByChannel(event_id, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoices = yield db_1.prisma.invoice.findMany({
                where: Object.assign({ event_id, status: 'PAID' }, (from && to && { createdAt: { gte: from, lte: to } })),
                select: { total: true, num_items: true, createdAt: true },
            });
            // sales_channel viene de Event — aproximamos por invoice directa vs promoter
            const directSales = invoices.reduce((a, i) => ({ total: a.total + i.total, tickets: a.tickets + i.num_items }), { total: 0, tickets: 0 });
            return { direct: directSales, invoices_count: invoices.length };
        });
    }
    getTicketsByHour(event_id, date) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            const tickets = yield db_1.prisma.ticket.findMany({
                where: { event_id, created_at: { gte: start, lte: end } },
                select: { created_at: true },
            });
            const byHour = {};
            for (const t of tickets) {
                const h = t.created_at.getHours();
                byHour[h] = ((_a = byHour[h]) !== null && _a !== void 0 ? _a : 0) + 1;
            }
            return Array.from({ length: 24 }, (_, h) => { var _a; return ({ hour: h, count: (_a = byHour[h]) !== null && _a !== void 0 ? _a : 0 }); });
        });
    }
    getBuyerOrigin(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const tickets = yield db_1.prisma.ticket.findMany({
                where: { event_id },
                select: { customer_id: true },
            });
            const customerIds = [...new Set(tickets.map(t => t.customer_id))];
            const buyers = yield db_1.prisma.user.groupBy({
                by: ['city'],
                where: { id: { in: customerIds }, city: { not: null } },
                _count: { id: true },
            });
            const total = buyers.reduce((a, b) => a + b._count.id, 0);
            return buyers
                .filter(b => b.city)
                .map(b => ({ city: b.city, count: b._count.id, pct: total > 0 ? Math.round((b._count.id / total) * 100) : 0 }))
                .sort((a, b) => b.count - a.count);
        });
    }
    getBuyerDemographics(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const tickets = yield db_1.prisma.ticket.findMany({
                where: { event_id },
                select: { customer_id: true },
            });
            const customerIds = [...new Set(tickets.map(t => t.customer_id))];
            const buyers = yield db_1.prisma.user.findMany({
                where: { id: { in: customerIds }, birth_date: { not: null } },
                select: { birth_date: true },
            });
            const now = new Date();
            const segments = { '18-25': 0, '26-34': 0, '35-44': 0, '45+': 0 };
            for (const b of buyers) {
                const age = Math.floor((now.getTime() - b.birth_date.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
                if (age < 26)
                    segments['18-25']++;
                else if (age < 35)
                    segments['26-34']++;
                else if (age < 45)
                    segments['35-44']++;
                else
                    segments['45+']++;
            }
            const total = Object.values(segments).reduce((a, b) => a + b, 0);
            return Object.entries(segments).map(([segment, count]) => ({
                segment,
                count,
                pct: total > 0 ? Math.round((count / total) * 100) : 0,
            }));
        });
    }
    //ORGANIZER APP 
    getOrganizerNextEvent(organizer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const now = new Date();
            // Próximo evento más cercano (APPROVED o ACTIVE), excluyendo finalizados/cancelados
            const event = yield db_1.prisma.event.findFirst({
                where: {
                    organizer_id,
                    status: { in: ['APPROVED', 'ACTIVE', 'SCHEDULED'] },
                    date_event: { gte: now },
                },
                include: {
                    localities: {
                        include: { stages: true },
                    },
                },
                orderBy: { date_event: 'asc' },
            });
            if (!event)
                return null;
            // ── Calcular total de tickets vendidos del evento ─────────────────────
            const totalSoldAgg = yield db_1.prisma.ticket.count({
                where: {
                    event_id: event.id,
                    status_ticket: { notIn: ['CANCELED', 'EXPIRED'] },
                },
            });
            const totalCapacity = (_a = event.num_max_tickets) !== null && _a !== void 0 ? _a : 0;
            const totalPct = totalCapacity > 0
                ? Math.round((totalSoldAgg / totalCapacity) * 100)
                : 0;
            // ── Tickets por localidad ─────────────────────────────────────────────
            const localitiesWithStats = yield Promise.all(event.localities.map((locality) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                // Tickets vendidos de esta localidad
                const soldInLocality = yield db_1.prisma.ticket.count({
                    where: {
                        event_id: event.id,
                        loc_id_locality: locality.id,
                        status_ticket: { notIn: ['CANCELED', 'EXPIRED'] },
                    },
                });
                let capacity;
                let sold;
                if (locality.require_num_tickets) {
                    // require_num_tickets = true → usar num_max_tickets vs num_tickets_sold de la localidad
                    capacity = (_a = locality.num_max_tickets) !== null && _a !== void 0 ? _a : 0;
                    sold = (_b = locality.num_tickets_sold) !== null && _b !== void 0 ? _b : 0;
                }
                else {
                    // require_num_tickets = false → usar num_max_tickets del evento - tickets vendidos de esa localidad
                    capacity = (_c = event.num_max_tickets) !== null && _c !== void 0 ? _c : 0;
                    sold = soldInLocality;
                }
                const pct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
                return {
                    id: locality.id,
                    name: locality.name_locality,
                    bkg_color: locality.bkg_color,
                    require_num_tickets: locality.require_num_tickets,
                    capacity,
                    sold,
                    pct,
                };
            })));
            return {
                event: {
                    id: event.id,
                    name: event.name,
                    image: event.image,
                    cover: event.cover,
                    date_event: event.date_event,
                    date_end_event: event.date_end_event,
                    place_address: event.place_address,
                    city: event.city,
                    status: event.status,
                },
                tickets: {
                    total_sold: totalSoldAgg,
                    total_capacity: totalCapacity,
                    pct: totalPct,
                },
                localities: localitiesWithStats,
            };
        });
    }
    // ── getOrganizerNextEvents() — todos los eventos vigentes excepto el próximo ─
    getOrganizerNextEvents(organizer_id, excludeEventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const events = yield db_1.prisma.event.findMany({
                where: Object.assign({ organizer_id, status: { in: ['APPROVED', 'ACTIVE', 'SCHEDULED'] }, date_event: { gte: now } }, (excludeEventId && { id: { not: excludeEventId } })),
                include: {
                    localities: {
                        select: {
                            id: true,
                            name_locality: true,
                            num_max_tickets: true,
                            num_tickets_sold: true,
                        },
                    },
                },
                orderBy: { date_event: 'asc' },
            });
            return events.map(event => {
                const capacity = event.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_max_tickets) !== null && _a !== void 0 ? _a : 0); }, 0);
                const sold = event.localities.reduce((a, l) => { var _a; return a + ((_a = l.num_tickets_sold) !== null && _a !== void 0 ? _a : 0); }, 0);
                return {
                    id: event.id,
                    name: event.name,
                    image: event.image,
                    cover: event.cover,
                    date_event: event.date_event,
                    date_end_event: event.date_end_event,
                    place_address: event.place_address,
                    city: event.city,
                    status: event.status,
                    tickets_sold: sold,
                    capacity,
                    pct: capacity > 0 ? Math.round((sold / capacity) * 100) : 0,
                };
            });
        });
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
