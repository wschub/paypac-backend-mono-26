import { prisma } from '../prisma/client';
import { NotificationTypeConfigRepository } from '../repositories/notification_type_config.repository';

const typeConfigRepo = new NotificationTypeConfigRepository();

export class NotificationsService {

  /**
   * Preferencias del usuario, fusionadas con la config por tipo:
   * - is_mandatory: true -> el toggle se muestra bloqueado/activado, ignorando
   *   lo que el usuario tenga guardado (siempre se entrega por los canales del tipo).
   * - available_channels: canales que este tipo realmente soporta, para que el
   *   frontend oculte los toggles que no aplican (ej: WhatsApp en FRIEND_REQUEST).
   */
  async getPreferences(userId: number): Promise<any[]> {
    await typeConfigRepo.syncMissingTypes();
    const configs = await typeConfigRepo.findAll();

    const preferences = await prisma.notificationPreference.findMany({
      where: { user_id: userId },
    });
    const preferenceByType = new Map(preferences.map((p) => [p.notification_type, p]));

    const missing = configs.filter((c) => !preferenceByType.has(c.notification_type));
    if (missing.length > 0) {
      await prisma.$transaction(
        missing.map((c) =>
          prisma.notificationPreference.create({
            data: {
              user_id: userId,
              notification_type: c.notification_type,
              channel_web: c.channel_web,
              channel_push: c.channel_push,
              channel_whatsapp: c.channel_whatsapp,
              channel_email: c.channel_email,
            },
          })
        )
      );
      return this.getPreferences(userId);
    }

    return configs.map((config) => {
      const pref = preferenceByType.get(config.notification_type)!;
      return {
        id: pref.id,
        notification_type: pref.notification_type,
        is_mandatory: config.is_mandatory,
        available_channels: {
          web: config.channel_web,
          push: config.channel_push,
          whatsapp: config.channel_whatsapp,
          email: config.channel_email,
        },
        channel_web: config.is_mandatory ? config.channel_web : pref.channel_web,
        channel_push: config.is_mandatory ? config.channel_push : pref.channel_push,
        channel_whatsapp: config.is_mandatory ? config.channel_whatsapp : pref.channel_whatsapp,
        channel_email: config.is_mandatory ? config.channel_email : pref.channel_email,
      };
    });
  }

  async updatePreference(
    userId: number,
    notificationType: string,
    channelWeb: boolean,
    channelPush: boolean,
    channelWhatsapp: boolean,
    channelEmail: boolean
  ) {
    const config = await typeConfigRepo.findByType(notificationType as any);
    if (config?.is_mandatory) {
      throw new Error('Este tipo de notificación es obligatorio y no se puede desactivar');
    }

    // Defensivo: un canal no soportado por el tipo nunca queda en true,
    // aunque el frontend lo haya enviado así.
    const clamp = (value: boolean, supported: boolean) => value && supported;

    return prisma.notificationPreference.upsert({
      where: {
        user_id_notification_type: {
          user_id: userId,
          notification_type: notificationType as any,
        },
      },
      update: {
        channel_web: clamp(channelWeb, config?.channel_web ?? true),
        channel_push: clamp(channelPush, config?.channel_push ?? true),
        channel_whatsapp: clamp(channelWhatsapp, config?.channel_whatsapp ?? false),
        channel_email: clamp(channelEmail, config?.channel_email ?? true),
      },
      create: {
        user_id: userId,
        notification_type: notificationType as any,
        channel_web: clamp(channelWeb, config?.channel_web ?? true),
        channel_push: clamp(channelPush, config?.channel_push ?? true),
        channel_whatsapp: clamp(channelWhatsapp, config?.channel_whatsapp ?? false),
        channel_email: clamp(channelEmail, config?.channel_email ?? true),
      },
    });
  }

  async getNotifications(userId: number, page = 1, limit = 20, unreadOnly = false) {
    const skip = (page - 1) * limit;
    const where: any = { user_id: userId };
    if (unreadOnly) where.read_at = null;

    const [notifications, total, unread_count] = await Promise.all([
      prisma.notificationQueue.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          notification_type: true,
          channel: true,
          title: true,
          body: true,
          status: true,
          read_at: true,
          createdAt: true,
        },
      }),
      prisma.notificationQueue.count({ where }),
      prisma.notificationQueue.count({ where: { user_id: userId, read_at: null } }),
    ]);

    return {
      notifications,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
      unread_count,
    };
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await prisma.notificationQueue.findFirst({
      where: { id: notificationId, user_id: userId },
    });
    if (!notification) throw new Error('Notificación no encontrada');

    return prisma.notificationQueue.update({
      where: { id: notificationId },
      data: { status: 'READ', read_at: new Date() },
    });
  }

  async markAllAsRead(userId: number) {
    const result = await prisma.notificationQueue.updateMany({
      where: { user_id: userId, read_at: null },
      data: { status: 'READ', read_at: new Date() },
    });
    return result.count;
  }
}
