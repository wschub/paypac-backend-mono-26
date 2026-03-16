import { Request, Response } from 'express';
import { TicketAdminService } from '../services/ticket.admin.service';

const ticketAdminService = new TicketAdminService();

export const getAdminTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const {
      event_id, status, search,
      from, to, page, limit,
    } = req.query;

    const result = await ticketAdminService.getTickets(
      {
        event_id: event_id ? Number(event_id) : undefined,
        status:   status   as string | undefined,
        search:   search   as string | undefined,
        from:     from     as string | undefined,
        to:       to       as string | undefined,
        page:     page     ? Number(page)  : 1,
        limit:    limit    ? Number(limit) : 50,
      },
      user.role,
      user.id
    );

    res.status(200).json(result);
  } catch (err: any) {
    const httpStatus = err.message.includes('permisos') ? 403 : 500;
    res.status(httpStatus).json({ message: err.message });
  }
};