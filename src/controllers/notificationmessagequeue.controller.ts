import { Request, Response } from 'express';
import { NotificationMessageQueueService } from '../services/notificationmessagequeue.service';

const queueService = new NotificationMessageQueueService();

/**
 * POST /api/email-queue
 */
export const queueEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, email, templateCode, variables, sendAt } = req.body;

    const result = await queueService.queueEmail({
      userId,
      email,
      templateCode,
      variables,
      sendAt: sendAt ? new Date(sendAt) : undefined,
    });

    res.status(201).json({
      message: 'Email encolado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/email-queue/process
 */
export const processPendingMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    if (userRole !== 'PAYPAC') {
      res.status(403).json({ message: 'Solo PAYPAC puede procesar la cola' });
      return;
    }

    const result = await queueService.processPendingMessages();
    res.status(200).json({ message: 'Procesamiento completado', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-queue/my-messages
 */
export const getMyMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const result = await queueService.getUserMessages(userId);
    res.status(200).json({ message: 'Mensajes obtenidos', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-queue/stats
 */
export const getQueueStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await queueService.getQueueStats(userRole);
    res.status(200).json({ message: 'Estadísticas obtenidas', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-queue/:id
 */
export const getMessageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';
    const currentUserId = req.user?.id;

    const message = await queueService.getMessageById(Number(id));

    if (userRole !== 'PAYPAC' && message.user_id !== currentUserId) {
      res.status(403).json({ message: 'Sin permiso' });
      return;
    }

    res.status(200).json({ message: 'Mensaje obtenido', data: message });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * POST /api/email-queue/:id/retry
 */
export const retryMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';
    const result = await queueService.retryMessage(Number(id), userRole);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/email-queue/:id
 */
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';
    const result = await queueService.deleteMessage(Number(id), userRole);
    res.status(200).json({ message: 'Eliminado', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/email-queue/clean-old
 */
export const cleanOldMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days_old } = req.body;
    const userRole = req.user?.role || '';
    const result = await queueService.cleanOldMessages(days_old || 30, userRole);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};