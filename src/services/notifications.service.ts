import { prisma } from '../prisma/client';

const ALL_NOTIFICATION_TYPES = [
  'FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_ACTIVITY',
  'EVENT_REMINDER', 'EVENT_NEW', 'EVENT_PRICE_DROP', 'EVENT_SOLD_OUT',
  'TICKET_TRANSFER', 'TICKET_USED',
  'POINTS_EARNED', 'POINTS_EXPIRING', 'POINTS_TRANSFER_SENT', 'POINTS_TRANSFER_RECEIVED',
  'PROMOTIONAL', 'SYSTEM',
] as const;

export class NotificationsService {

  async getPreferences(userId: number): Promise<any[]> {
    const preferences = await prisma.notificationPreference.findMany({
      where: { user_id: userId },
    });

    if (preferences.length === 0) {
      await Promise.all(
        ALL_NOTIFICATION_TYPES.map((type) =>
          prisma.notificationPreference.create({
            data: {
              user_id: userId,
              notification_type: type as any,
              channel_web: true,
              channel_push: true,
              channel_whatsapp: false,
              channel_email: true,
            },
          })
        )
      );
      return this.getPreferences(userId);
    }

    return preferences;
  }

  async updatePreference(
    userId: number,
    notificationType: string,
    channelWeb: boolean,
    channelPush: boolean,
    channelWhatsapp: boolean,
    channelEmail: boolean
  ) {
    return prisma.notificationPreference.upsert({
      where: {
        user_id_notification_type: {
          user_id: userId,
          notification_type: notificationType as any,
        },
      },
      update: {
        channel_web: channelWeb,
        channel_push: channelPush,
        channel_whatsapp: channelWhatsapp,
        channel_email: channelEmail,
      },
      create: {
        user_id: userId,
        notification_type: notificationType as any,
        channel_web: channelWeb,
        channel_push: channelPush,
        channel_whatsapp: channelWhatsapp,
        channel_email: channelEmail,
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
