import { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { TicketTransactionService } from '../services/tickettransaction.service';
import { paramToInt } from '../utils/utils';

const ticketService = new TicketService();
const ticketTransactionService = new TicketTransactionService();


/**
 * 🧪 POST /api/tickets/create-test
 * Crear tickets de prueba (SOLO DESARROLLO)
 */
export const createTestTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { event_id, qty_tickets = 1 } = req.body;

    // Obtener evento
    const event = await prisma.event.findUnique({
      where: { id: event_id },
      include: {
        localities: {
          include: {
            stages: true,
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ message: 'Evento no encontrado' });
      return;
    }

    // Obtener primera localidad y stage
    const locality = event.localities[0];
    const stage = locality?.stages[0];

    if (!locality || !stage) {
      res.status(400).json({ message: 'Evento sin localidades o stages' });
      return;
    }

    // Crear transacción de prueba
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        user_uid: req.user!.firebase_uid || '',
        invoice_id: `TEST-INV-${Date.now()}`,
        created_at: new Date(),
        finalized_at: new Date(),
        amount_in_cents: stage.price_ticket * qty_tickets * 100,
        reference: `TEST-REF-${Date.now()}`,
        customer_email: req.user!.email || 'test@test.com',
        currency: 'COP',
        payment_method_type: 'CARD',
        payment_method: { type: 'CARD', brand: 'TEST' },
        status: 'APPROVED',
        status_message: 'Test transaction',
        billing_data: '{}',
        shipping_address: '',
        redirect_url: '',
        payment_source_id: '',
        payment_link_id: '',
        customer_data: '{}',
        bill_id: '',
        taxes: [],
        tip_in_cents: '0',
        meta: { test: true },
      },
    });

    // Crear tickets usando el servicio
    const ticketsResult = await ticketService.createTicketsFromInvoice(
      transaction.id,
      {
        user_id: userId,
        user_uid: req.user!.firebase_uid || '',
        event_id: event_id,
        items: [
          {
            stage_id: stage.id,
            stage_name: stage.stage_name,
            locality_id: locality.id,
            locality_name: locality.name_locality,
            qty_tickets: qty_tickets,
            price_ticket: stage.price_ticket,
            locality_colors: {
              bkg_color: locality.bkg_color,
              title_color: locality.title_color,
              text_color: locality.text_color,
              title_color_location: locality.title_color_location,
            },
          },
        ],
      },
      {
        name: event.name,
        short_description: event.short_description,
        cover: event.cover,
        date_event: event.date_event,
        place_address: event.place_address,
        event_type: event.event_type,
        type_venue: event.type_venue,
        organizer_id: event.organizer_id,
        status: event.status,
      },
      req.body.customer_ID_phone || '+573001234567'
    );

    res.status(201).json({
      success: true,
      message: 'Tickets de prueba creados',
      ...ticketsResult,
      transaction_id: transaction.id,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};



/**
 * GET /api/tickets/my-tickets
 * Obtener mis tickets (Wallet)
 */
export const getMyTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const tickets = await ticketService.getMyTickets(userId);

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