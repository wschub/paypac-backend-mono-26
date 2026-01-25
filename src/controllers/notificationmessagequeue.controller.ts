import { Request, Response } from 'express';
import { NotificationMessageQueueService } from '../services/notificationmessagequeue.service';
import { renderTemplate, validateTemplateVariables, wrapEmailHtml } from '../utils/template-renderer';

const queueService = new NotificationMessageQueueService();

/**
 * POST /api/email-queue
 * Encolar un nuevo email para envío
 * Acceso: Todos los roles autenticados
 */
export const queueEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, email_delivery, template_code, variables, send_at } = req.body;

    const result = await queueService.queueEmail({
      user_id,
      email_delivery,
      template_code,
      variables,
      send_at: send_at ? new Date(send_at) : undefined,
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
 * Procesar mensajes pendientes manualmente
 * Requiere: PAYPAC
 * NOTA: Normalmente esto lo hace el CRON job automáticamente
 */
export const processPendingMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';

    if (userRole !== 'PAYPAC') {
      res.status(403).json({ message: 'Solo PAYPAC puede procesar la cola manualmente' });
      return;
    }

    const result = await queueService.processPendingMessages();

    res.status(200).json({
      message: 'Procesamiento completado',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-queue
 * Listar mensajes de la cola
 * Acceso: PAYPAC (todos), usuarios (solo sus propios mensajes)
 */
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, user_id, template_id } = req.query;
    const userRole = req.user?.role || '';
    const currentUserId = req.user?.id;

    const filters: any = {};

    if (status !== undefined) {
      filters.status = Number(status);
    }

    if (template_id) {
      filters.template_id = Number(template_id);
    }

    // Si no es PAYPAC, solo puede ver sus propios mensajes
    if (userRole !== 'PAYPAC') {
      filters.user_id = currentUserId;
    } else if (user_id) {
      filters.user_id = Number(user_id);
    }

    const result = await queueService.getMessages(filters);

    res.status(200).json({
      message: 'Mensajes obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-queue/stats
 * Obtener estadísticas de la cola
 * Requiere: PAYPAC
 */
export const getQueueStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await queueService.getQueueStats(userRole);

    res.status(200).json({
      message: 'Estadísticas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-queue/my-messages
 * Obtener mensajes del usuario autenticado
 * Acceso: Todos los roles
 */
export const getMyMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await queueService.getUserMessages(userId);

    res.status(200).json({
      message: 'Mensajes obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/email-queue/:id
 * Obtener mensaje por ID
 * Acceso: PAYPAC (cualquier mensaje), usuarios (solo sus mensajes)
 */
export const getMessageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';
    const currentUserId = req.user?.id;

    const message = await queueService.getMessageById(Number(id));

    // Validar ownership si no es PAYPAC
    if (userRole !== 'PAYPAC' && message.user_id !== currentUserId) {
      res.status(403).json({ message: 'No tienes permiso para ver este mensaje' });
      return;
    }

    res.status(200).json({
      message: 'Mensaje obtenido exitosamente',
      data: message,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * POST /api/email-queue/:id/retry
 * Reintentar envío de mensaje fallido
 * Requiere: PAYPAC
 */
export const retryMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await queueService.retryMessage(Number(id), userRole);

    res.status(200).json({
      message: 'Mensaje marcado para reintento',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/email-queue/:id
 * Eliminar mensaje
 * Requiere: PAYPAC
 */
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await queueService.deleteMessage(Number(id), userRole);

    res.status(200).json({
      message: 'Mensaje eliminado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/email-queue/clean-old
 * Limpiar mensajes antiguos
 * Requiere: PAYPAC
 */
export const cleanOldMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days_old } = req.body;
    const userRole = req.user?.role || '';

    const result = await queueService.cleanOldMessages(days_old || 30, userRole);

    res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};