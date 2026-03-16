import { TicketAdminRepository, TicketAdminFilters } from '../repositories/ticket.admin.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { TicketStatus } from '@prisma/client';
import { prisma } from '../config/db';
import crypto from 'crypto';

const ticketAdminRepo = new TicketAdminRepository();
const ticketRepo      = new TicketRepository();

const VALID_STATUSES: TicketStatus[] = [
  'PENDING', 'PAID', 'ACTIVE', 'USED',
  'FROZEN', 'TRANSFERRED', 'CANCELED', 'EXPIRED', 'ON_SALE',
];

export class TicketAdminService {

  async getTickets(
    filters: {
      event_id?:  number;
      status?:    string;
      search?:    string;
      from?:      string;
      to?:        string;
      page?:      number;
      limit?:     number;
    },
    userRole: string,
    userId: number
  ) {
    if (!['PAYPAC', 'ORGANIZER'].includes(userRole))
      throw new Error('No tienes permisos para ver esta información');

    const parsed: TicketAdminFilters = {
      event_id:     filters.event_id,
      status:       filters.status as TicketStatus | undefined,
      search:       filters.search,
      from:         filters.from ? new Date(filters.from) : undefined,
      to:           filters.to   ? new Date(filters.to)   : undefined,
      page:         filters.page  ?? 1,
      limit:        Math.min(filters.limit ?? 50, 100),
      organizer_id: userRole === 'ORGANIZER' ? userId : undefined,
    };

    return ticketAdminRepo.findAll(parsed);
  }

  async updateTicketStatus(id: number, status: string, userRole: string) {
    if (userRole !== 'PAYPAC')
      throw new Error('Solo PAYPAC puede cambiar el status de un ticket');

    if (!VALID_STATUSES.includes(status as TicketStatus))
      throw new Error(`Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`);

    const ticket = await ticketRepo.findById(id);
    if (!ticket) throw new Error('Ticket no encontrado');

    return ticketRepo.updateStatus(id, status as TicketStatus);
  }

  async adminTransferTicket(id: number, toUserId: number, userRole: string) {
    if (userRole !== 'PAYPAC')
      throw new Error('Solo PAYPAC puede transferir tickets administrativamente');

    const ticket = await ticketRepo.findById(id);
    if (!ticket) throw new Error('Ticket no encontrado');

    // Verificar que el receptor existe
    const toUser = await prisma.user.findUnique({
      where: { id: toUserId },
      select: {
        id:           true,
        name:         true,
        last_name:    true,
        email:        true,
        phone_number: true,
        firebase_uid: true,
      },
    });
    if (!toUser) throw new Error('Usuario receptor no encontrado');

    // Generar nuevo token para el ticket
    const newToken = crypto.randomBytes(32).toString('hex');

    return ticketRepo.transferOwnership(
      id,
      toUser.id,
      toUser.firebase_uid ?? '',
      toUser.phone_number ?? '',
      newToken
    );
  }
}