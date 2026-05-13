import { prisma } from '../prisma/client';
import { calculatePointsFromAmount, calculateExpirationDate } from '../config/constants';

export class PointsService {

  async getBalance(userId: number) {
    let balance = await prisma.userPointsBalance.findUnique({
      where: { user_id: userId },
    });

    if (!balance) {
      balance = await prisma.userPointsBalance.create({
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
  }

  async getHistory(userId: number, page = 1, limit = 20, type?: string) {
    const skip = (page - 1) * limit;
    const where: any = { user_id: userId };
    if (type) where.transaction_type = type;

    const [transactions, total] = await Promise.all([
      prisma.pointsTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pointsTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async transferPoints(fromUserId: number, toUserId: number, points: number, description?: string) {
    if (fromUserId === toUserId) throw new Error('No puedes transferir puntos a ti mismo');
    if (points <= 0) throw new Error('La cantidad de puntos debe ser mayor a 0');

    const recipientUser = await prisma.user.findUnique({ where: { id: toUserId } });
    if (!recipientUser) throw new Error('Usuario receptor no encontrado');

    const result = await prisma.$transaction(async (tx) => {
      const senderBalance = await tx.userPointsBalance.findUnique({ where: { user_id: fromUserId } });
      if (!senderBalance) throw new Error('El usuario remitente no tiene balance de puntos');
      if (senderBalance.current_balance < points) {
        throw new Error(`Saldo insuficiente. Disponible: ${senderBalance.current_balance}, Solicitado: ${points}`);
      }

      let recipientBalance = await tx.userPointsBalance.findUnique({ where: { user_id: toUserId } });
      if (!recipientBalance) {
        recipientBalance = await tx.userPointsBalance.create({
          data: { user_id: toUserId, current_balance: 0, total_earned: 0 },
        });
      }

      const sentTransaction = await tx.pointsTransaction.create({
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

      const receivedTransaction = await tx.pointsTransaction.create({
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

      await tx.pointsTransaction.update({
        where: { id: sentTransaction.id },
        data: { transfer_pair_id: receivedTransaction.id },
      });

      await tx.userPointsBalance.update({
        where: { id: senderBalance.id },
        data: { current_balance: { decrement: points } },
      });

      await tx.userPointsBalance.update({
        where: { id: recipientBalance.id },
        data: {
          current_balance: { increment: points },
          total_earned: { increment: points },
          last_earned_at: new Date(),
        },
      });

      return { sentTransaction, receivedTransaction };
    });

    await Promise.all([
      prisma.notificationQueue.create({
        data: {
          user_id: fromUserId,
          notification_type: 'POINTS_TRANSFER_SENT',
          channel: 'PUSH',
          title: 'Puntos enviados',
          body: `Has transferido ${points} puntos exitosamente`,
        },
      }),
      prisma.notificationQueue.create({
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
  }

  async getExpiringPoints(userId: number) {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const expiringTransactions = await prisma.pointsTransaction.findMany({
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
      days_remaining: Math.ceil((tx.expires_at!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return {
      expiring_soon,
      total_expiring: expiring_soon.reduce((sum, item) => sum + item.points_amount, 0),
    };
  }

  async awardPointsForPurchase(userId: number, invoiceId: number, amount: number) {
    const points = calculatePointsFromAmount(amount);
    const expiresAt = calculateExpirationDate();
    const balance = await this.getBalance(userId);

    const transaction = await prisma.pointsTransaction.create({
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

    await prisma.userPointsBalance.update({
      where: { id: balance.id },
      data: {
        current_balance: { increment: points },
        total_earned: { increment: points },
        last_earned_at: new Date(),
      },
    });

    await prisma.notificationQueue.create({
      data: {
        user_id: userId,
        notification_type: 'POINTS_EARNED',
        channel: 'PUSH',
        title: '¡Ganaste puntos!',
        body: `Has ganado ${points} puntos por tu compra`,
      },
    });

    return transaction;
  }
}
