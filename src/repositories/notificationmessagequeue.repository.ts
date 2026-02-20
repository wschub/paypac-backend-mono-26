// src/repositories/notificationmessagequeue.repository.ts
import { prisma } from '../config/db';
import { NotificationMessageQueue, Prisma } from '@prisma/client';

export class NotificationMessageQueueRepository {
  async create(data: Prisma.NotificationMessageQueueUncheckedCreateInput) {
    return prisma.notificationMessageQueue.create({
      data,
      include: { user: true }, // ✅ Solo incluir user
    });
  }

  async findPendingMessages() {
    const now = new Date();
    return prisma.notificationMessageQueue.findMany({
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
  }

  async findById(id: number) {
    return prisma.notificationMessageQueue.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updateStatus(id: number, status: number, messageResult?: string) {
    return prisma.notificationMessageQueue.update({
      where: { id },
      data: {
        status,
        message_result: messageResult,
        updatedAt: new Date(),
      },
    });
  }

  async findByUserId(userId: number) {
    return prisma.notificationMessageQueue.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByStatus() {
    const counts = await prisma.notificationMessageQueue.groupBy({
      by: ['status'],
      _count: true,
    });
    return counts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<number, number>);
  }

  async delete(id: number) {
    return prisma.notificationMessageQueue.delete({
      where: { id },
    });
  }

  async cleanOldMessages(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const result = await prisma.notificationMessageQueue.deleteMany({
      where: {
        status: 1,
        createdAt: { lt: cutoffDate },
      },
    });
    return result.count;
  }
}