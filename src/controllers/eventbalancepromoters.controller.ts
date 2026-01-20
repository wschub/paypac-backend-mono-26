import { Request, Response } from 'express';
import { EventBalancePromotersService } from '../services/eventBalancePromoters.service';

const balanceService = new EventBalancePromotersService();

/**
 * GET /api/events/:eventId/balances
 * Obtener todos los balances de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
export const getBalancesByEventId = async (
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
    const balances = await balanceService.getBalancesByEventId(
      eventId,
      user.id,
      user.role
    );

    res.status(200).json({
      total: balances.length,
      balances,
    });
  } catch (err: any) {
    console.error('❌ Error en getBalancesByEventId:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/balances/promoter/:promoterId
 * Obtener extracto de un promotor
 * Acceso: El mismo promotor, ORGANIZER o PAYPAC
 */
export const getPromoterBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const promoterId = Number(req.params.promoterId);
    const balance = await balanceService.getPromoterBalance(
      promoterId,
      user.id,
      user.role
    );

    res.status(200).json(balance);
  } catch (err: any) {
    console.error('❌ Error en getPromoterBalance:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/promoters/my-balance
 * Obtener extracto del promotor autenticado
 */
export const getMyBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const balance = await balanceService.getPromoterBalance(
      user.id,
      user.id,
      user.role
    );

    res.status(200).json(balance);
  } catch (err: any) {
    console.error('❌ Error en getMyBalance:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/promoters/my-balance/stats
 * Obtener estadísticas del promotor autenticado
 */
export const getMyBalanceStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const stats = await balanceService.getMyBalanceStats(user.id);

    res.status(200).json(stats);
  } catch (err: any) {
    console.error('❌ Error en getMyBalanceStats:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH /api/balances/:id/mark-paid
 * Marcar un balance como pagado
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
export const markAsPaid = async (
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
    const { payment_method, payment_reference } = req.body;

    const updatedBalance = await balanceService.markAsPaid(
      id,
      user.id,
      user.role,
      { payment_method, payment_reference }
    );

    res.status(200).json({
      message: 'Balance marcado como pagado exitosamente',
      balance: updatedBalance,
    });
  } catch (err: any) {
    console.error('❌ Error en markAsPaid:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * PATCH /api/balances/bulk-pay
 * Marcar múltiples balances como pagados
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
export const bulkMarkAsPaid = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { balance_ids, payment_date, payment_method, payment_reference } = req.body;

    const result = await balanceService.bulkMarkAsPaid(
      balance_ids,
      user.id,
      user.role,
      { payment_date, payment_method, payment_reference }
    );

    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Error en bulkMarkAsPaid:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * POST /api/balances/:id/refund
 * Crear balance de reembolso (negativo)
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
export const createRefundBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const originalBalanceId = Number(req.params.id);

    const refundBalance = await balanceService.createRefundBalance(
      originalBalanceId,
      user.id,
      user.role
    );

    res.status(201).json({
      message: 'Balance de reembolso creado exitosamente',
      balance: refundBalance,
    });
  } catch (err: any) {
    console.error('❌ Error en createRefundBalance:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/balances/stats
 * Obtener estadísticas de balances del evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
export const getEventBalanceStats = async (
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
    const stats = await balanceService.getEventBalanceStats(
      eventId,
      user.id,
      user.role
    );

    res.status(200).json(stats);
  } catch (err: any) {
    console.error('❌ Error en getEventBalanceStats:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/balances/pending
 * Obtener todos los balances pendientes
 * Requiere: PAYPAC
 */
export const getAllPendingBalances = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const balances = await balanceService.getAllPendingBalances(user.role);

    res.status(200).json({
      total: balances.length,
      balances,
    });
  } catch (err: any) {
    console.error('❌ Error en getAllPendingBalances:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * POST /api/events/:eventId/balances/assign-cutoff
 * Asignar fecha de corte a balances pendientes
 * Requiere: ORGANIZER (dueño) o PAYPAC
 * Normalmente se ejecuta automáticamente al FINALIZED
 */
export const assignCutoffDate = async (
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
    const { days_after_event } = req.body;

    const result = await balanceService.assignCutoffDateForEvent(
      eventId,
      days_after_event || 15
    );

    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Error en assignCutoffDate:', err);
    res.status(400).json({ error: err.message });
  }
};