import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { InvoiceStatus } from '@prisma/client';

const invoiceService = new InvoiceService();

/**
 * POST /api/invoices
 * Crear una nueva factura
 */
export const createInvoice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const data = req.body;

    const result = await invoiceService.createInvoice(user.id, data);

    res.status(201).json({
      message: 'Factura creada exitosamente',
      ...result,
    });
  } catch (err: any) {
    console.error('❌ Error en createInvoice:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/invoices/:id
 * Obtener factura por ID
 */
export const getInvoiceById = async (
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
    const result = await invoiceService.getInvoiceById(id, user.id, user.role);

    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Error en getInvoiceById:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/invoices/my-invoices
 * Obtener facturas del usuario autenticado
 */
export const getMyInvoices = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const invoices = await invoiceService.getMyInvoices(user.id);

    res.status(200).json({
      total: invoices.length,
      invoices,
    });
  } catch (err: any) {
    console.error('❌ Error en getMyInvoices:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/invoices
 * Obtener facturas de un evento
 */
export const getEventInvoices = async (
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
    const invoices = await invoiceService.getEventInvoices(
      eventId,
      user.id,
      user.role
    );

    res.status(200).json({
      total: invoices.length,
      invoices,
    });
  } catch (err: any) {
    console.error('❌ Error en getEventInvoices:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * PATCH /api/invoices/:id/status
 * Actualizar estado de factura
 * (Usado internamente por webhook de pago)
 */
export const updateInvoiceStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const invoice = await invoiceService.updateInvoiceStatus(
      id,
      status as InvoiceStatus
    );

    res.status(200).json({
      message: 'Estado de factura actualizado',
      invoice,
    });
  } catch (err: any) {
    console.error('❌ Error en updateInvoiceStatus:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * PATCH /api/invoices/:id/cancel
 * Cancelar factura
 */
export const cancelInvoice = async (
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

    const invoice = await invoiceService.cancelInvoice(id, user.id, user.role);

    res.status(200).json({
      message: 'Factura cancelada exitosamente',
      invoice,
    });
  } catch (err: any) {
    console.error('❌ Error en cancelInvoice:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/invoices/stats
 * Obtener estadísticas de facturas de un evento
 */
export const getEventInvoiceStats = async (
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
    const stats = await invoiceService.getEventInvoiceStats(
      eventId,
      user.id,
      user.role
    );

    res.status(200).json(stats);
  } catch (err: any) {
    console.error('❌ Error en getEventInvoiceStats:', err);
    res.status(403).json({ error: err.message });
  }
};