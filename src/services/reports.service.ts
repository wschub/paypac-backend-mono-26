import { AnalyticsRepository, resolveDateRange, DateRangeKey } from '../repositories/analytics.repository';

const analyticsRepo = new AnalyticsRepository();

export class ReportsService {

  private range(rangeKey: DateRangeKey, from?: string, to?: string) {
    return resolveDateRange(rangeKey, from, to);
  }

  // ── PAYPAC Reports ────────────────────────────────────────────────────────

  async getFinancialReport(rangeKey: DateRangeKey, from?: string, to?: string) {
    const { from: f, to: t } = this.range(rangeKey, from, to);
    const [revenue, refunds, byMonth] = await Promise.all([
      analyticsRepo.getRevenueStats(f, t),
      analyticsRepo.getRefundStats(f, t),
      analyticsRepo.getRevenueByMonth(f, t),
    ]);
    return { period: { from: f, to: t }, revenue, refunds, by_month: byMonth };
  }

  async getOrganizersReport(rangeKey: DateRangeKey, from?: string, to?: string) {
    const { from: f, to: t } = this.range(rangeKey, from, to);
    const health = await analyticsRepo.getOrganizerHealth();
    return { period: { from: f, to: t }, organizers: health };
  }

  async getEventsPortfolioReport(rangeKey: DateRangeKey, from?: string, to?: string) {
    const { from: f, to: t } = this.range(rangeKey, from, to);
    const [byStatus, byCategory, topEvents, risk] = await Promise.all([
      analyticsRepo.getEventsByStatus(),
      analyticsRepo.getGMVByCategory(f, t),
      analyticsRepo.getTopEventsByOccupancy(10, f, t),
      analyticsRepo.getRiskIndicators(f, t),
    ]);
    return {
      period:       { from: f, to: t },
      by_status:    byStatus,
      by_category:  byCategory,
      top_events:   topEvents,
      at_risk:      risk.low_occupancy_events,
    };
  }

  async getExpansionReport() {
    const geographic = await analyticsRepo.getGeographicAnalysis();
    return { geographic };
  }

  async getRiskReport(rangeKey: DateRangeKey, from?: string, to?: string) {
    const { from: f, to: t } = this.range(rangeKey, from, to);
    const risk = await analyticsRepo.getRiskIndicators(f, t);
    return { period: { from: f, to: t }, ...risk };
  }

  // ── ORGANIZER Reports ────────────────────────────────────────────────────

  async getLiquidationReport(
    organizer_id: number,
    event_id: number,
    rangeKey: DateRangeKey,
    from?: string,
    to?: string
  ) {
    const { from: f, to: t } = this.range(rangeKey, from, to);
    const [revenue, tickets, salesByChannel] = await Promise.all([
      analyticsRepo.getRevenueStats(f, t, organizer_id),
      analyticsRepo.getTicketStats(f, t, organizer_id),
      analyticsRepo.getSalesByChannel(event_id, f, t),
    ]);
    return { period: { from: f, to: t }, revenue, tickets, sales_by_channel: salesByChannel };
  }

  async getSalesReport(
    organizer_id: number,
    event_id: number,
    rangeKey: DateRangeKey,
    granularity: 'hour' | 'day',
    from?: string,
    to?: string,
    date?: string
  ) {
    const { from: f, to: t } = this.range(rangeKey, from, to);

    const [byDay, byHour, origin, demographics] = await Promise.all([
      granularity === 'day' ? analyticsRepo.getTicketsByDay(f, t, organizer_id) : Promise.resolve([]),
      granularity === 'hour' && date ? analyticsRepo.getTicketsByHour(event_id, new Date(date)) : Promise.resolve([]),
      analyticsRepo.getBuyerOrigin(event_id),
      analyticsRepo.getBuyerDemographics(event_id),
    ]);

    return {
      period:       { from: f, to: t },
      by_day:       byDay,
      by_hour:      byHour,
      buyer_origin: origin,
      demographics,
    };
  }

  async getIntelligenceReport(event_id: number) {
    // Base real data
    const [origin, demographics] = await Promise.all([
      analyticsRepo.getBuyerOrigin(event_id),
      analyticsRepo.getBuyerDemographics(event_id),
    ]);
    return {
      buyer_origin: origin,
      demographics,
      // Competencia y señales de demanda → mock hasta integración externa
      competition:   null,
      demand_signals: null,
      note: 'Competencia y señales de demanda requieren integración externa — próxima fase',
    };
  }
}