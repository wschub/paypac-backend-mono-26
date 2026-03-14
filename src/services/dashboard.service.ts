import { AnalyticsRepository, resolveDateRange } from '../repositories/analytics.repository';

const analyticsRepo = new AnalyticsRepository();

export class DashboardService {

  async getPaypacDashboard() {
    const { from, to } = resolveDateRange('month');

    const [
      revenue,
      revenueByMonth,
      tickets,
      ticketsByDay,
      occupancy,
      eventsByStatus,
      usersByRole,
      topEvents,
      alerts,
      refunds,
    ] = await Promise.all([
      analyticsRepo.getRevenueStats(from, to),
      analyticsRepo.getRevenueByMonth(resolveDateRange('year').from, to),
      analyticsRepo.getTicketStats(from, to),
      analyticsRepo.getTicketsByDay(
        (() => { const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0,0,0,0); return d; })(),
        new Date()
      ),
      analyticsRepo.getOccupancyRate(),
      analyticsRepo.getEventsByStatus(),
      analyticsRepo.getUsersByRole(),
      analyticsRepo.getTopEventsByOccupancy(5, from, to),
      analyticsRepo.getOperationalAlerts(),
      analyticsRepo.getRefundStats(from, to),
    ]);

    return {
      period:          { from, to },
      financial:       { ...revenue, ...refunds },
      tickets:         { ...tickets, by_day: ticketsByDay },
      occupancy,
      events_by_status: eventsByStatus,
      users_by_role:    usersByRole,
      top_events:       topEvents,
      alerts,
      revenue_by_month: revenueByMonth,
    };
  }

  async getOrganizerDashboard(organizer_id: number, company_id: number) {
    const { from, to } = resolveDateRange('month');

    const [
      revenue,
      revenueByMonth,
      tickets,
      occupancy,
      eventsProgress,
      upcomingCount,
      statusSummary,
    ] = await Promise.all([
      analyticsRepo.getRevenueStats(from, to, organizer_id),
      analyticsRepo.getRevenueByMonth(
        resolveDateRange('year').from, to, organizer_id
      ),
      analyticsRepo.getTicketStats(from, to, organizer_id),
      analyticsRepo.getOccupancyRate(organizer_id),
      analyticsRepo.getMyEventsProgress(organizer_id),
      analyticsRepo.getUpcomingEvents(organizer_id),
      analyticsRepo.getEventStatusSummary(organizer_id),
    ]);

    return {
      period:          { from, to },
      financial:       revenue,
      tickets,
      occupancy,
      upcoming_events: upcomingCount,
      events_progress: eventsProgress,
      status_summary:  statusSummary,
      revenue_by_month: revenueByMonth,
    };
  }
}