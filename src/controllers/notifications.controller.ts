import { Request, Response } from 'express';
import { NotificationsService } from '../services/notifications.service';

const notificationsService = new NotificationsService();

export class NotificationsController {

  async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const preferences = await notificationsService.getPreferences(userId);
      res.status(200).json({ preferences });
    } catch (error: any) {
      console.error('Error in getPreferences:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch preferences' });
    }
  }

  async updatePreference(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { notification_type, channel_web, channel_push, channel_whatsapp, channel_email } = req.body;

      const preference = await notificationsService.updatePreference(
        userId, notification_type, channel_web, channel_push, channel_whatsapp, channel_email
      );
      res.status(200).json({ preference });
    } catch (error: any) {
      console.error('Error in updatePreference:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to update preference' });
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20;
      const unreadOnly = req.query.unread_only === 'true';

      const result = await notificationsService.getNotifications(userId, page, limit, unreadOnly);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch notifications' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const notificationId = parseInt(req.params.id as string);

      const notification = await notificationsService.markAsRead(userId, notificationId);
      res.status(200).json({ notification });
    } catch (error: any) {
      console.error('Error in markAsRead:', error);

      if (error.message.includes('no encontrada')) {
        return res.status(404).json({ error: 'Not found', message: error.message });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to mark notification as read' });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const count = await notificationsService.markAllAsRead(userId);
      res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas', updated_count: count });
    } catch (error: any) {
      console.error('Error in markAllAsRead:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to mark all as read' });
    }
  }
}
