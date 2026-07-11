"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const client_1 = require("../prisma/client");
const ALL_NOTIFICATION_TYPES = [
    'FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_ACTIVITY',
    'EVENT_REMINDER', 'EVENT_NEW', 'EVENT_PRICE_DROP', 'EVENT_SOLD_OUT',
    'TICKET_TRANSFER', 'TICKET_USED',
    'POINTS_EARNED', 'POINTS_EXPIRING', 'POINTS_TRANSFER_SENT', 'POINTS_TRANSFER_RECEIVED',
    'PROMOTIONAL', 'SYSTEM',
];
class NotificationsService {
    getPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const preferences = yield client_1.prisma.notificationPreference.findMany({
                where: { user_id: userId },
            });
            if (preferences.length === 0) {
                yield Promise.all(ALL_NOTIFICATION_TYPES.map((type) => client_1.prisma.notificationPreference.create({
                    data: {
                        user_id: userId,
                        notification_type: type,
                        channel_web: true,
                        channel_push: true,
                        channel_whatsapp: false,
                        channel_email: true,
                    },
                })));
                return this.getPreferences(userId);
            }
            return preferences;
        });
    }
    updatePreference(userId, notificationType, channelWeb, channelPush, channelWhatsapp, channelEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.notificationPreference.upsert({
                where: {
                    user_id_notification_type: {
                        user_id: userId,
                        notification_type: notificationType,
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
                    notification_type: notificationType,
                    channel_web: channelWeb,
                    channel_push: channelPush,
                    channel_whatsapp: channelWhatsapp,
                    channel_email: channelEmail,
                },
            });
        });
    }
    getNotifications(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 20, unreadOnly = false) {
            const skip = (page - 1) * limit;
            const where = { user_id: userId };
            if (unreadOnly)
                where.read_at = null;
            const [notifications, total, unread_count] = yield Promise.all([
                client_1.prisma.notificationQueue.findMany({
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
                client_1.prisma.notificationQueue.count({ where }),
                client_1.prisma.notificationQueue.count({ where: { user_id: userId, read_at: null } }),
            ]);
            return {
                notifications,
                pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
                unread_count,
            };
        });
    }
    markAsRead(userId, notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield client_1.prisma.notificationQueue.findFirst({
                where: { id: notificationId, user_id: userId },
            });
            if (!notification)
                throw new Error('Notificación no encontrada');
            return client_1.prisma.notificationQueue.update({
                where: { id: notificationId },
                data: { status: 'READ', read_at: new Date() },
            });
        });
    }
    markAllAsRead(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield client_1.prisma.notificationQueue.updateMany({
                where: { user_id: userId, read_at: null },
                data: { status: 'READ', read_at: new Date() },
            });
            return result.count;
        });
    }
}
exports.NotificationsService = NotificationsService;
