import { Request, Response } from 'express';
import { TicketAdminService } from '../services/ticket.admin.service';

const ticketAdminService = new TicketAdminService();
/**
 * GET /api/tickets/admin
 * Listar tickets con filtros
 * PAYPAC: todos | ORGANIZER: solo sus eventos
 */
export const getAdminTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { event_id, status, search, from, to, page, limit } = req.query;

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

/**
 * PATCH /api/tickets/admin/:id/status
 * Cambiar status de un ticket
 * PAYPAC only (por ahora)
 */
export const updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ticketAdminService.updateTicketStatus(
      Number(req.params.id),
      req.body.status,
      req.user!.role
    );
    res.status(200).json({
      message: `Ticket actualizado a ${result.status_ticket}`,
      ticket: result,
    });
  } catch (err: any) {
    const httpStatus = err.message.includes('permisos') ? 403
                     : err.message.includes('no encontrado') ? 404 : 400;
    res.status(httpStatus).json({ message: err.message });
  }
};

/**
 * POST /api/tickets/admin/:id/transfer
 * Transferir ticket a otro usuario
 * PAYPAC only (por ahora)
 */
export const adminTransferTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ticketAdminService.adminTransferTicket(
      Number(req.params.id),
      req.body.to_user_id,
      req.user!.role
    );
    res.status(200).json({
      message: 'Ticket transferido exitosamente',
      ticket: result,
    });
  } catch (err: any) {
    const httpStatus = err.message.includes('permisos') ? 403
                     : err.message.includes('no encontrado') ? 404 : 400;
    res.status(httpStatus).json({ message: err.message });
  }
};