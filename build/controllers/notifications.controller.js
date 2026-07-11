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
exports.NotificationsController = void 0;
const notifications_service_1 = require("../services/notifications.service");
const notificationsService = new notifications_service_1.NotificationsService();
class NotificationsController {
    getPreferences(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const preferences = yield notificationsService.getPreferences(userId);
                res.status(200).json({ preferences });
            }
            catch (error) {
                console.error('Error in getPreferences:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch preferences' });
            }
        });
    }
    updatePreference(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { notification_type, channel_web, channel_push, channel_whatsapp, channel_email } = req.body;
                const preference = yield notificationsService.updatePreference(userId, notification_type, channel_web, channel_push, channel_whatsapp, channel_email);
                res.status(200).json({ preference });
            }
            catch (error) {
                console.error('Error in updatePreference:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to update preference' });
            }
        });
    }
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const page = req.query.page ? parseInt(req.query.page) : 1;
                const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 20;
                const unreadOnly = req.query.unread_only === 'true';
                const result = yield notificationsService.getNotifications(userId, page, limit, unreadOnly);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error in getNotifications:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch notifications' });
            }
        });
    }
    markAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const notificationId = parseInt(req.params.id);
                const notification = yield notificationsService.markAsRead(userId, notificationId);
                res.status(200).json({ notification });
            }
            catch (error) {
                console.error('Error in markAsRead:', error);
                if (error.message.includes('no encontrada')) {
                    return res.status(404).json({ error: 'Not found', message: error.message });
                }
                res.status(500).json({ error: 'Internal server error', message: 'Failed to mark notification as read' });
            }
        });
    }
    markAllAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const count = yield notificationsService.markAllAsRead(userId);
                res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas', updated_count: count });
            }
            catch (error) {
                console.error('Error in markAllAsRead:', error);
                res.status(500).json({ error: 'Internal server error', message: 'Failed to mark all as read' });
            }
        });
    }
}
exports.NotificationsController = NotificationsController;
