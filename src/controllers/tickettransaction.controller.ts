import { Request, Response } from 'express';
import { TicketTransactionService } from '../services/tickettransaction.service';
import { paramToInt } from '../utils/utils';
const transactionService = new TicketTransactionService();

/**
 * GET /api/ticket-transactions/pending
 * Obtener transferencias pendientes para el usuario autenticado
 */
export const getPendingTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const transactions = await transactionService.getPendingTransactions(userId);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/ticket-transactions/history
 * Obtener historial completo de transacciones del usuario
 */
export const getUserHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const transactions = await transactionService.getUserHistory(userId);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/ticket-transactions/sent
 * Obtener transacciones enviadas por el usuario
 */
export const getSentTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const transactions = await transactionService.getSentTransactions(userId);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/ticket-transactions/received
 * Obtener transacciones recibidas por el usuario
 */
export const getReceivedTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const transactions = await transactionService.getReceivedTransactions(userId);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/ticket-transactions/ticket/:ticketId/history
 * Obtener historial de un ticket específico
 */
export const getTicketHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = paramToInt(req.params.ticketId);
    const userId = req.user!.id;

    const transactions = await transactionService.getTicketHistory(ticketId, userId);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/ticket-transactions/:id
 * Obtener detalles de una transacción específica
 */
export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionId = paramToInt(req.params.id);
    const userId = req.user!.id;

    const transaction = await transactionService.getTransactionById(transactionId, userId);

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/ticket-transactions/:id/accept
 * Aceptar transferencia de ticket
 */
export const acceptTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionId = paramToInt(req.params.id);
    const userId = req.user!.id;

    const result = await transactionService.acceptTransfer(transactionId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
      transaction: result.transaction,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/ticket-transactions/:id/reject
 * Rechazar transferencia de ticket
 */
export const rejectTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionId = paramToInt(req.params.id);
    const userId = req.user!.id;

    const result = await transactionService.rejectTransfer(transactionId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
      transaction: result.transaction,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * POST /api/ticket-transactions/:id/cancel
 * Cancelar transferencia pendiente (solo el remitente)
 */
export const cancelTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionId = paramToInt(req.params.id);
    const userId = req.user!.id;

    const result = await transactionService.cancelTransaction(transactionId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
      transaction: result.transaction,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET /api/ticket-transactions/count/pending
 * Contar transacciones pendientes (para notificaciones)
 */
export const countPendingTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const count = await transactionService.countPendingTransactions(userId);

    res.status(200).json({
      success: true,
      count,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. tickettransaction.controller.ts — agregar 2 métodos nuevos
// ═══════════════════════════════════════════════════════════════════════════
 
export const sendTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await transactionService.sendTransfer(req.user!.id, req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err: any) {
    const httpStatus = err.message.includes('no te pertenece') ? 403
                     : err.message.includes('no encontrado')   ? 404 : 400;
    res.status(httpStatus).json({ success: false, message: err.message });
  }
};
 
export const acceptByContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contact } = req.body;
    const result = await transactionService.acceptByContact(req.user!.id, contact);
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};