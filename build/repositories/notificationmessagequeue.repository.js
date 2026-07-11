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
exports.NotificationMessageQueueRepository = void 0;
// src/repositories/notificationmessagequeue.repository.ts
const db_1 = require("../config/db");
class NotificationMessageQueueRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.notificationMessageQueue.create({
                data,
                include: { user: true }, // ✅ Solo incluir user
            });
        });
    }
    findPendingMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return db_1.prisma.notificationMessageQueue.findMany({
                where: {
                    status: 0,
                    OR: [
                        { send_at: null },
                        { send_at: { lte: now } },
                    ],
                },
                include: { user: true },
                orderBy: { createdAt: 'asc' },
                take: 50,
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.notificationMessageQueue.findUnique({
                where: { id },
                include: { user: true },
            });
        });
    }
    updateStatus(id, status, messageResult) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.notificationMessageQueue.update({
                where: { id },
                data: {
                    status,
                    message_result: messageResult,
                    updatedAt: new Date(),
                },
            });
        });
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.notificationMessageQueue.findMany({
                where: { user_id: userId },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    countByStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const counts = yield db_1.prisma.notificationMessageQueue.groupBy({
                by: ['status'],
                _count: true,
            });
            return counts.reduce((acc, item) => {
                acc[item.status] = item._count;
                return acc;
            }, {});
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.notificationMessageQueue.delete({
                where: { id },
            });
        });
    }
    cleanOldMessages() {
        return __awaiter(this, arguments, void 0, function* (daysOld = 30) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const result = yield db_1.prisma.notificationMessageQueue.deleteMany({
                where: {
                    status: 1,
                    createdAt: { lt: cutoffDate },
                },
            });
            return result.count;
        });
    }
}
exports.NotificationMessageQueueRepository = NotificationMessageQueueRepository;
