import { prisma } from '../config/db';
import { NotificationTypeConfig, NotificationType, Prisma } from '@prisma/client';

/**
 * Config por defecto para cada NotificationType. Se usa únicamente para
 * auto-sembrar filas nuevas (syncMissingTypes) — una vez creada la fila,
 * el valor real vive en la base de datos y se administra desde el Dashboard.
 */
const DEFAULT_CONFIG: Record<NotificationType, {
  is_mandatory: boolean;
  channel_web: boolean;
  channel_push: boolean;
  channel_whatsapp: boolean;
  channel_email: boolean;
}> = {
  FRIEND_REQUEST: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  FRIEND_ACCEPTED: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  FRIEND_ACTIVITY: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  EVENT_REMINDER: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  EVENT_NEW: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  EVENT_CANCELED: { is_mandatory: true, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  EVENT_RESCHEDULED: { is_mandatory: true, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  EVENT_PRICE_DROP: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  EVENT_PRICE_INCREASE: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  EVENT_SOLD_OUT: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  EVENT_TICKET_AVAILABLE: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  EVENT_WAITING_LIST: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  TICKET_PURCHASE_CONFIRMATION: { is_mandatory: true, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  TICKET_PURCHASE_FAILED: { is_mandatory: true, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  TICKET_TRANSFER: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  TICKET_USED: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  POINTS_EARNED: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  POINTS_EXPIRING: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  POINTS_TRANSFER_SENT: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  POINTS_TRANSFER_RECEIVED: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  PROMOTIONAL: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: true, channel_email: true },
  SYSTEM: { is_mandatory: true, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  RESALE_TICKET_SOLD: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: true },
  RESALE_OFFER_RECEIVED: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  RESALE_OFFER_ACCEPTED: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  RESALE_OFFER_REJECTED: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
  RESALE_OUTBID: { is_mandatory: false, channel_web: true, channel_push: true, channel_whatsapp: false, channel_email: false },
};

export class NotificationTypeConfigRepository {
  async findAll(): Promise<NotificationTypeConfig[]> {
    return prisma.notificationTypeConfig.findMany({ orderBy: { notification_type: 'asc' } });
  }

  async findById(id: number): Promise<NotificationTypeConfig | null> {
    return prisma.notificationTypeConfig.findUnique({ where: { id } });
  }

  async findByType(notification_type: NotificationType): Promise<NotificationTypeConfig | null> {
    return prisma.notificationTypeConfig.findUnique({ where: { notification_type } });
  }

  async update(id: number, data: Prisma.NotificationTypeConfigUpdateInput): Promise<NotificationTypeConfig> {
    return prisma.notificationTypeConfig.update({ where: { id }, data });
  }

  /**
   * Crea la fila de config para cualquier valor de NotificationType que aún
   * no exista en la tabla (ej: al agregar tipos nuevos al enum). Idempotente.
   */
  async syncMissingTypes(): Promise<void> {
    const existing = await prisma.notificationTypeConfig.findMany({ select: { notification_type: true } });
    const existingTypes = new Set(existing.map((e) => e.notification_type));

    const missing = (Object.keys(DEFAULT_CONFIG) as NotificationType[]).filter((t) => !existingTypes.has(t));
    if (missing.length === 0) return;

    await prisma.notificationTypeConfig.createMany({
      data: missing.map((notification_type) => ({
        notification_type,
        ...DEFAULT_CONFIG[notification_type],
      })),
      skipDuplicates: true,
    });
  }
}
