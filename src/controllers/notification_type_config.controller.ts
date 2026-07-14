import { Request, Response } from 'express';
import { NotificationTypeConfigService } from '../services/notification_type_config.service';

const typeConfigService = new NotificationTypeConfigService();

/**
 * GET /api/notification-type-config
 * Listar la config de todos los tipos de notificación
 * Requiere: PAYPAC
 */
export const getNotificationTypeConfigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await typeConfigService.getAll(userRole);

    res.status(200).json({
      message: 'Configuración de tipos de notificación obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/notification-type-config/:id
 * Requiere: PAYPAC
 */
export const getNotificationTypeConfigById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { id } = req.params;

    const result = await typeConfigService.getById(Number(id), userRole);

    res.status(200).json({
      message: 'Configuración obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/notification-type-config/:id
 * Actualizar is_mandatory y/o canales de un tipo
 * Requiere: PAYPAC
 */
export const updateNotificationTypeConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_mandatory, channel_web, channel_push, channel_whatsapp, channel_email } = req.body;
    const userRole = req.user?.role || '';

    const result = await typeConfigService.update(
      Number(id),
      { is_mandatory, channel_web, channel_push, channel_whatsapp, channel_email },
      userRole
    );

    res.status(200).json({
      message: 'Configuración actualizada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
