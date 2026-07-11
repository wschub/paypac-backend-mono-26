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
exports.PointsService = void 0;
const client_1 = require("../prisma/client");
const constants_1 = require("../config/constants");
class PointsService {
    getBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let balance = yield client_1.prisma.userPointsBalance.findUnique({
                where: { user_id: userId },
            });
            if (!balance) {
                balance = yield client_1.prisma.userPointsBalance.create({
                    data: {
                        user_id: userId,
                        current_balance: 0,
                        total_earned: 0,
                        total_redeemed: 0,
                        total_expired: 0,
                    },
                });
            }
            return balance;
        });
    }
    getHistory(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 20, type) {
            const skip = (page - 1) * limit;
            const where = { user_id: userId };
            if (type)
                where.transaction_type = type;
            const [transactions, total] = yield Promise.all([
                client_1.prisma.pointsTransaction.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                client_1.prisma.pointsTransaction.count({ where }),
            ]);
            return {
                transactions,
                pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
            };
        });
    }
    transferPoints(fromUserId, toUserId, points, description) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fromUserId === toUserId)
                throw new Error('No puedes transferir puntos a ti mismo');
            if (points <= 0)
                throw new Error('La cantidad de puntos debe ser mayor a 0');
            const recipientUser = yield client_1.prisma.user.findUnique({ where: { id: toUserId } });
            if (!recipientUser)
                throw new Error('Usuario receptor no encontrado');
            const result = yield client_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const senderBalance = yield tx.userPointsBalance.findUnique({ where: { user_id: fromUserId } });
                if (!senderBalance)
                    throw new Error('El usuario remitente no tiene balance de puntos');
                if (senderBalance.current_balance < points) {
                    throw new Error(`Saldo insuficiente. Disponible: ${senderBalance.current_balance}, Solicitado: ${points}`);
                }
                let recipientBalance = yield tx.userPointsBalance.findUnique({ where: { user_id: toUserId } });
                if (!recipientBalance) {
                    recipientBalance = yield tx.userPointsBalance.create({
                        data: { user_id: toUserId, current_balance: 0, total_earned: 0 },
                    });
                }
                const sentTransaction = yield tx.pointsTransaction.create({
                    data: {
                        user_id: fromUserId,
                        balance_id: senderBalance.id,
                        transaction_type: 'TRANSFER_SENT',
                        points_amount: -points,
                        balance_before: senderBalance.current_balance,
                        balance_after: senderBalance.current_balance - points,
                        transfer_to_user_id: toUserId,
                        description: description || `Transferencia de puntos a usuario ${toUserId}`,
                    },
                });
                const receivedTransaction = yield tx.pointsTransaction.create({
                    data: {
                        user_id: toUserId,
                        balance_id: recipientBalance.id,
                        transaction_type: 'TRANSFER_RECEIVED',
                        points_amount: points,
                        balance_before: recipientBalance.current_balance,
                        balance_after: recipientBalance.current_balance + points,
                        transfer_from_user_id: fromUserId,
                        transfer_pair_id: sentTransaction.id,
                        description: description || `Transferencia de puntos desde usuario ${fromUserId}`,
                    },
                });
                yield tx.pointsTransaction.update({
                    where: { id: sentTransaction.id },
                    data: { transfer_pair_id: receivedTransaction.id },
                });
                yield tx.userPointsBalance.update({
                    where: { id: senderBalance.id },
                    data: { current_balance: { decrement: points } },
                });
                yield tx.userPointsBalance.update({
                    where: { id: recipientBalance.id },
                    data: {
                        current_balance: { increment: points },
                        total_earned: { increment: points },
                        last_earned_at: new Date(),
                    },
                });
                return { sentTransaction, receivedTransaction };
            }));
            yield Promise.all([
                client_1.prisma.notificationQueue.create({
                    data: {
                        user_id: fromUserId,
                        notification_type: 'POINTS_TRANSFER_SENT',
                        channel: 'PUSH',
                        title: 'Puntos enviados',
                        body: `Has transferido ${points} puntos exitosamente`,
                    },
                }),
                client_1.prisma.notificationQueue.create({
                    data: {
                        user_id: toUserId,
                        notification_type: 'POINTS_TRANSFER_RECEIVED',
                        channel: 'PUSH',
                        title: '¡Recibiste puntos!',
                        body: `Has recibido ${points} puntos`,
                    },
                }),
            ]);
            return {
                success: true,
                message: 'Transferencia exitosa',
                sentTransaction: result.sentTransaction,
                receivedTransaction: result.receivedTransaction,
            };
        });
    }
    getExpiringPoints(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const in30Days = new Date();
            in30Days.setDate(in30Days.getDate() + 30);
            const expiringTransactions = yield client_1.prisma.pointsTransaction.findMany({
                where: {
                    user_id: userId,
                    transaction_type: 'EARNED',
                    expired: false,
                    expires_at: { gte: now, lte: in30Days },
                },
                orderBy: { expires_at: 'asc' },
            });
            const expiring_soon = expiringTransactions.map((tx) => ({
                id: tx.id,
                points_amount: tx.points_amount,
                expires_at: tx.expires_at,
                days_remaining: Math.ceil((tx.expires_at.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            }));
            return {
                expiring_soon,
                total_expiring: expiring_soon.reduce((sum, item) => sum + item.points_amount, 0),
            };
        });
    }
    redeemPointsForPurchase(userId, invoiceId, points) {
        return __awaiter(this, void 0, void 0, function* () {
            if (points <= 0)
                throw new Error('La cantidad de puntos debe ser mayor a 0');
            const balance = yield this.getBalance(userId);
            if (balance.current_balance < points) {
                throw new Error(`Saldo insuficiente. Disponible: ${balance.current_balance}, Solicitado: ${points}`);
            }
            const transaction = yield client_1.prisma.pointsTransaction.create({
                data: {
                    user_id: userId,
                    balance_id: balance.id,
                    transaction_type: 'REDEEMED',
                    points_amount: -points,
                    balance_before: balance.current_balance,
                    balance_after: balance.current_balance - points,
                    reference_type: 'INVOICE',
                    reference_id: invoiceId,
                    description: 'Puntos canjeados en compra de tickets',
                },
            });
            yield client_1.prisma.userPointsBalance.update({
                where: { id: balance.id },
                data: {
                    current_balance: { decrement: points },
                    total_redeemed: { increment: points },
                },
            });
            return transaction;
        });
    }
    awardPointsForPurchase(userId, invoiceId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const points = (0, constants_1.calculatePointsFromAmount)(amount);
            const expiresAt = (0, constants_1.calculateExpirationDate)();
            const balance = yield this.getBalance(userId);
            const transaction = yield client_1.prisma.pointsTransaction.create({
                data: {
                    user_id: userId,
                    balance_id: balance.id,
                    transaction_type: 'EARNED',
                    points_amount: points,
                    balance_before: balance.current_balance,
                    balance_after: balance.current_balance + points,
                    reference_type: 'INVOICE',
                    reference_id: invoiceId,
                    description: 'Puntos ganados por compra de tickets',
                    expires_at: expiresAt,
                },
            });
            yield client_1.prisma.userPointsBalance.update({
                where: { id: balance.id },
                data: {
                    current_balance: { increment: points },
                    total_earned: { increment: points },
                    last_earned_at: new Date(),
                },
            });
            yield client_1.prisma.notificationQueue.create({
                data: {
                    user_id: userId,
                    notification_type: 'POINTS_EARNED',
                    channel: 'PUSH',
                    title: '¡Ganaste puntos!',
                    body: `Has ganado ${points} puntos por tu compra`,
                },
            });
            return transaction;
        });
    }
}
exports.PointsService = PointsService;
