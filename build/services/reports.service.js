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
exports.ReportsService = void 0;
const analytics_repository_1 = require("../repositories/analytics.repository");
const analyticsRepo = new analytics_repository_1.AnalyticsRepository();
class ReportsService {
    range(rangeKey, from, to) {
        return (0, analytics_repository_1.resolveDateRange)(rangeKey, from, to);
    }
    // ── PAYPAC Reports ────────────────────────────────────────────────────────
    getFinancialReport(rangeKey, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from: f, to: t } = this.range(rangeKey, from, to);
            const [revenue, refunds, byMonth] = yield Promise.all([
                analyticsRepo.getRevenueStats(f, t),
                analyticsRepo.getRefundStats(f, t),
                analyticsRepo.getRevenueByMonth(f, t),
            ]);
            return { period: { from: f, to: t }, revenue, refunds, by_month: byMonth };
        });
    }
    getOrganizersReport(rangeKey, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from: f, to: t } = this.range(rangeKey, from, to);
            const health = yield analyticsRepo.getOrganizerHealth();
            return { period: { from: f, to: t }, organizers: health };
        });
    }
    getEventsPortfolioReport(rangeKey, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from: f, to: t } = this.range(rangeKey, from, to);
            const [byStatus, byCategory, topEvents, risk] = yield Promise.all([
                analyticsRepo.getEventsByStatus(),
                analyticsRepo.getGMVByCategory(f, t),
                analyticsRepo.getTopEventsByOccupancy(10, f, t),
                analyticsRepo.getRiskIndicators(f, t),
            ]);
            return {
                period: { from: f, to: t },
                by_status: byStatus,
                by_category: byCategory,
                top_events: topEvents,
                at_risk: risk.low_occupancy_events,
            };
        });
    }
    getExpansionReport() {
        return __awaiter(this, void 0, void 0, function* () {
            const geographic = yield analyticsRepo.getGeographicAnalysis();
            return { geographic };
        });
    }
    getRiskReport(rangeKey, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from: f, to: t } = this.range(rangeKey, from, to);
            const risk = yield analyticsRepo.getRiskIndicators(f, t);
            return Object.assign({ period: { from: f, to: t } }, risk);
        });
    }
    // ── ORGANIZER Reports ────────────────────────────────────────────────────
    getLiquidationReport(organizer_id, event_id, rangeKey, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from: f, to: t } = this.range(rangeKey, from, to);
            const [revenue, tickets, salesByChannel] = yield Promise.all([
                analyticsRepo.getRevenueStats(f, t, organizer_id),
                analyticsRepo.getTicketStats(f, t, organizer_id),
                analyticsRepo.getSalesByChannel(event_id, f, t),
            ]);
            return { period: { from: f, to: t }, revenue, tickets, sales_by_channel: salesByChannel };
        });
    }
    getSalesReport(organizer_id, event_id, rangeKey, granularity, from, to, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from: f, to: t } = this.range(rangeKey, from, to);
            const [byDay, byHour, origin, demographics] = yield Promise.all([
                granularity === 'day' ? analyticsRepo.getTicketsByDay(f, t, organizer_id) : Promise.resolve([]),
                granularity === 'hour' && date ? analyticsRepo.getTicketsByHour(event_id, new Date(date)) : Promise.resolve([]),
                analyticsRepo.getBuyerOrigin(event_id),
                analyticsRepo.getBuyerDemographics(event_id),
            ]);
            return {
                period: { from: f, to: t },
                by_day: byDay,
                by_hour: byHour,
                buyer_origin: origin,
                demographics,
            };
        });
    }
    getIntelligenceReport(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Base real data
            const [origin, demographics] = yield Promise.all([
                analyticsRepo.getBuyerOrigin(event_id),
                analyticsRepo.getBuyerDemographics(event_id),
            ]);
            return {
                buyer_origin: origin,
                demographics,
                // Competencia y señales de demanda → mock hasta integración externa
                competition: null,
                demand_signals: null,
                note: 'Competencia y señales de demanda requieren integración externa — próxima fase',
            };
        });
    }
}
exports.ReportsService = ReportsService;
