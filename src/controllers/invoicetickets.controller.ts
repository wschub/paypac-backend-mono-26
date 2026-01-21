import { Request, Response } from 'express';
import { InvoiceTicketsService } from '../services/invoicetickets.service';

const invoiceTicketsService = new InvoiceTicketsService();

/**
 * GET /api/invoices/:invoiceId/items
 * Obtener items de una factura
 */
export const getInvoiceItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const invoiceId = Number(req.params.invoiceId);
    const items = await invoiceTicketsService.getInvoiceItems(
      invoiceId,
      user.id,
      user.role
    );

    res.status(200).json({
      total: items.length,
      items,
    });
  } catch (err: any) {
    console.error('❌ Error en getInvoiceItems:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/invoice-items/:id
 * Obtener item por ID
 */
export const getItemById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const id = Number(req.params.id);
    const item = await invoiceTicketsService.getItemById(id, user.id, user.role);

    res.status(200).json(item);
  } catch (err: any) {
    console.error('❌ Error en getItemById:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/stages/:stageId/tickets-sold
 * Obtener tickets vendidos por stage
 */
export const getTicketsSoldByStage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stageId = Number(req.params.stageId);
    const count = await invoiceTicketsService.getTicketsSoldByStage(stageId);

    res.status(200).json({
      stage_id: stageId,
      tickets_sold: count,
    });
  } catch (err: any) {
    console.error('❌ Error en getTicketsSoldByStage:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/localities/:localityId/tickets-sold
 * Obtener tickets vendidos por localidad
 */
export const getTicketsSoldByLocality = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const localityId = Number(req.params.localityId);
    const count = await invoiceTicketsService.getTicketsSoldByLocality(localityId);

    res.status(200).json({
      locality_id: localityId,
      tickets_sold: count,
    });
  } catch (err: any) {
    console.error('❌ Error en getTicketsSoldByLocality:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/stages/:stageId/revenue
 * Obtener ingresos por stage
 */
export const getRevenueByStage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const stageId = Number(req.params.stageId);
    const revenue = await invoiceTicketsService.getRevenueByStage(
      stageId,
      user.id,
      user.role
    );

    res.status(200).json({
      stage_id: stageId,
      total_revenue: revenue,
    });
  } catch (err: any) {
    console.error('❌ Error en getRevenueByStage:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/sales-summary
 * Obtener resumen de ventas por evento
 */
export const getSalesSummaryByEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const eventId = Number(req.params.eventId);
    const summary = await invoiceTicketsService.getSalesSummaryByEvent(
      eventId,
      user.id,
      user.role
    );

    res.status(200).json({
      event_id: eventId,
      by_locality: summary,
    });
  } catch (err: any) {
    console.error('❌ Error en getSalesSummaryByEvent:', err);
    res.status(403).json({ error: err.message });
  }
};