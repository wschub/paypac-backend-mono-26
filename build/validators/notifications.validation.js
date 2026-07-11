"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsSchema = exports.updatePreferenceSchema = void 0;
const zod_1 = require("zod");
exports.updatePreferenceSchema = zod_1.z.object({
    body: zod_1.z.object({
        notification_type: zod_1.z.enum([
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
        channel_web: zod_1.z.boolean(),
        channel_push: zod_1.z.boolean(),
        channel_whatsapp: zod_1.z.boolean(),
        channel_email: zod_1.z.boolean(),
    }),
});
exports.getNotificationsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        unread_only: zod_1.z
            .enum(['true', 'false'])
            .transform((val) => val === 'true')
            .optional(),
    }),
});
