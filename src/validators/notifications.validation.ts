import { z } from 'zod';

export const updatePreferenceSchema = z.object({
  body: z.object({
    notification_type: z.enum([
      'FRIEND_REQUEST',
      'FRIEND_ACCEPTED',
      'FRIEND_ACTIVITY',
      'EVENT_REMINDER',
      'EVENT_NEW',
      'EVENT_PRICE_DROP',
      'EVENT_SOLD_OUT',
      'TICKET_TRANSFER',
      'TICKET_USED',
      'POINTS_EARNED',
      'POINTS_EXPIRING',
      'POINTS_TRANSFER_SENT',
      'POINTS_TRANSFER_RECEIVED',
      'PROMOTIONAL',
      'SYSTEM',
    ]),
    channel_web: z.boolean(),
    channel_push: z.boolean(),
    channel_whatsapp: z.boolean(),
    channel_email: z.boolean(),
  }),
});

export const getNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    unread_only: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true')
      .optional(),
  }),
});
