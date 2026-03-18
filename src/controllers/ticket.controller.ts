import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { TicketTransactionService } from '../services/tickettransaction.service';
import { paramToInt } from '../utils/utils';
import { TicketStatus } from '@prisma/client';
const ticketService = new TicketService();
const ticketTransactionService = new TicketTransactionService();



/**
 * GET /api/tickets/my-tickets
 * Obtener mis tickets (Wallet)
 */
export const getMyTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const rawStatus = req.query.status as string | undefined;
    const status = rawStatus
      ? rawStatus.includes(',')
        ? (rawStatus.split(',') as TicketStatus[])
        : (rawStatus as TicketStatus)
      : undefined;

    const tickets = await ticketService.getMyTickets(userId, status);

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/tickets/:id
 * Obtener un ticket específico
 */
export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = paramToInt(req.params.id);
    const userId = req.user!.id;

    const ticket = await ticketService.getTicketById(ticketId, userId);

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/tickets/:id/transfer
 * Transferir/regalar/vender ticket
 */
export const transferTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = paramToInt(req.params.id);
    const fromUser = req.user!;
    const {
      to_user_id,
      to_user_uid,
      to_user_id_phone,
      transaction_type,
      description,
    } = req.body;

    // Transferir el ticket
    const result = await ticketService.transferTicket(
      ticketId,
      fromUser.id,
      fromUser.firebase_uid!,
      req.body.from_user_id_phone || 'UNKNOWN', // TODO: Obtener del perfil
      to_user_id,
      to_user_uid,
      to_user_id_phone,
      transaction_type,
      description
    );

    // Crear registro de auditoría
    await ticketTransactionService.createTransaction({
      ticket_id: ticketId,
      from_customer_id: fromUser.id,
      from_customer_token: result.ticket.token_ticket, // Token anterior
      from_customer_uid: fromUser.firebase_uid!,
      from_customer_UUID_phone: req.body.from_user_id_phone || 'UNKNOWN',
      reference_ticket: result.ticket.reference_ticket,
      booking_ticket: result.ticket.booking_ticket,
      to_customer_id: to_user_id,
      to_customer_token: result.ticket.token_ticket, // Nuevo token
      to_customer_uid: to_user_uid,
      to_customer_UUID_phone: to_user_id_phone,
      type_transaction: transaction_type,
      ev_name: result.ticket.ev_name,
      transaction_description: description || `Transferencia de ticket`,
      status_ticket: transaction_type === 'sale' ? 'PENDING' : 'COMPLETED',
    });

    res.status(200).json({
      success: true,
      message: result.message,
      ticket: result.ticket,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * 🆕 POST /api/tickets/:id/validate
 * Validar ticket en la entrada del evento
 * ACTUALIZADO: Ahora requiere event_id en el body
 */
export const validateTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qr_token, event_id } = req.body;
    const scannerUser = req.user!;

    const result = await ticketService.validateTicket(
      qr_token,
      scannerUser.id,
      scannerUser.role,
      event_id // 🆕 Pasar event_id
    );

    res.status(200).json({
      success: true,
      message: result.message,
      ticket: result.ticket,
      scanner_id: result.scanner_id,
      scanner_role: result.scanner_role,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/tickets/upcoming
 * Obtener tickets próximos (para notificaciones)
 */
export const getUpcomingTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const daysAhead = parseInt(req.query.days as string) || 7;

    const tickets = await ticketService.getUpcomingTickets(userId, daysAhead);

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * DELETE /api/tickets/:id
 * Cancelar ticket
 */
export const cancelTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = paramToInt(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const ticket = await ticketService.cancelTicket(ticketId, userId, userRole);

    res.status(200).json({
      success: true,
      message: 'Ticket cancelado exitosamente',
      ticket,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/tickets/event/:eventId/stats
 * Obtener estadísticas de tickets por evento
 */
export const getEventTicketStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = paramToInt(req.params.eventId);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const stats = await ticketService.getEventTicketStats(eventId, userId, userRole);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};