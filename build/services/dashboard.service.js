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
exports.DashboardService = void 0;
const analytics_repository_1 = require("../repositories/analytics.repository");
const analyticsRepo = new analytics_repository_1.AnalyticsRepository();
class DashboardService {
    getPaypacDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to } = (0, analytics_repository_1.resolveDateRange)('month');
            const [revenue, revenueByMonth, tickets, ticketsByDay, occupancy, eventsByStatus, usersByRole, topEvents, alerts, refunds,] = yield Promise.all([
                analyticsRepo.getRevenueStats(from, to),
                analyticsRepo.getRevenueByMonth((0, analytics_repository_1.resolveDateRange)('year').from, to),
                analyticsRepo.getTicketStats(from, to),
                analyticsRepo.getTicketsByDay((() => { const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d; })(), new Date()),
                analyticsRepo.getOccupancyRate(),
                analyticsRepo.getEventsByStatus(),
                analyticsRepo.getUsersByRole(),
                analyticsRepo.getTopEventsByOccupancy(5, from, to),
                analyticsRepo.getOperationalAlerts(),
                analyticsRepo.getRefundStats(from, to),
            ]);
            return {
                period: { from, to },
                financial: Object.assign(Object.assign({}, revenue), refunds),
                tickets: Object.assign(Object.assign({}, tickets), { by_day: ticketsByDay }),
                occupancy,
                events_by_status: eventsByStatus,
                users_by_role: usersByRole,
                top_events: topEvents,
                alerts,
                revenue_by_month: revenueByMonth,
            };
        });
    }
    getOrganizerDashboard(organizer_id, company_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, to } = (0, analytics_repository_1.resolveDateRange)('month');
            const [revenue, revenueByMonth, tickets, occupancy, eventsProgress, upcomingCount, statusSummary,] = yield Promise.all([
                analyticsRepo.getRevenueStats(from, to, organizer_id),
                analyticsRepo.getRevenueByMonth((0, analytics_repository_1.resolveDateRange)('year').from, to, organizer_id),
                analyticsRepo.getTicketStats(from, to, organizer_id),
                analyticsRepo.getOccupancyRate(organizer_id),
                analyticsRepo.getMyEventsProgress(organizer_id),
                analyticsRepo.getUpcomingEvents(organizer_id),
                analyticsRepo.getEventStatusSummary(organizer_id),
            ]);
            return {
                period: { from, to },
                financial: revenue,
                tickets,
                occupancy,
                upcoming_events: upcomingCount,
                events_progress: eventsProgress,
                status_summary: statusSummary,
                revenue_by_month: revenueByMonth,
            };
        });
    }
    //agregar getOrganizerAppDashboard()
    getOrganizerAppDashboard(organizer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Próximo evento con stats
            const nextEvent = yield analyticsRepo.getOrganizerNextEvent(organizer_id);
            // Todos los demás eventos vigentes (excluyendo el próximo)
            const upcomingEvents = yield analyticsRepo.getOrganizerNextEvents(organizer_id, nextEvent === null || nextEvent === void 0 ? void 0 : nextEvent.event.id);
            return {
                next_event: nextEvent,
                upcoming_events: upcomingEvents,
            };
        });
    }
}
exports.DashboardService = DashboardService;
