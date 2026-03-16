import { TicketAdminRepository, TicketAdminFilters } from '../repositories/ticket.admin.repository';
import { TicketTransactionService } from './tickettransaction.service';
import { TicketStatus } from '@prisma/client';

const ticketAdminRepo  = new TicketAdminRepository();
const ticketTxService  = new TicketTransactionService();

export class TicketAdminService {

  async getTickets(
    filters: {
      event_id?:   number;
      status?:     string;
      search?:     string;
      from?:       string;
      to?:         string;
      page?:       number;
      limit?:      number;
    },
    userRole: string,
    userId: number
  ) {
    if (!['PAYPAC', 'ORGANIZER'].includes(userRole))
      throw new Error('No tienes permisos para ver esta información');

    const parsed: TicketAdminFilters = {
      event_id:      filters.event_id,
      status:        filters.status as TicketStatus | undefined,
      search:        filters.search,
      from:          filters.from ? new Date(filters.from) : undefined,
      to:            filters.to   ? new Date(filters.to)   : undefined,
      page:          filters.page  ?? 1,
      limit:         Math.min(filters.limit ?? 50, 100), // max 100
      organizer_id:  userRole === 'ORGANIZER' ? userId : undefined,
    };

    return ticketAdminRepo.findAll(parsed);
  }
}