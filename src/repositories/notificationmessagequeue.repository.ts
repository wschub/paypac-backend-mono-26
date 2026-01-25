import { prisma } from '../config/db';
import { NotificationMessageQueue, Prisma } from '@prisma/client';

export class NotificationMessageQueueRepository {
  /**
   * Crear un nuevo mensaje en la cola
   */
  async create(data: Prisma.NotificationMessageQueueUncheckedCreateInput): Promise<NotificationMessageQueue> {
    return prisma.notificationMessageQueue.create({
      data,
      include: {
        user: true,
        template: true,
      },
    });
  }

  /**
   * Obtener todos los mensajes de la cola
   */
  async findAll(filters?: { 
    status?: number; 
    user_id?: number;
    template_id?: number;
  }): Promise<NotificationMessageQueue[]> {
    const where: Prisma.NotificationMessageQueueWhereInput = {};

    if (filters?.status !== undefined) {
      where.status = filters.status;
    }

    if (filters?.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters?.template_id) {
      where.template_id = filters.template_id;
    }

    return prisma.notificationMessageQueue.findMany({
      where,
      include: {
        user: true,
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener mensajes pendientes de envío
   * status = 0 (Pendiente) y send_at <= NOW()
   */
  async findPendingMessages(): Promise<NotificationMessageQueue[]> {
    const now = new Date();

    return prisma.notificationMessageQueue.findMany({
      where: {
        status: 0, // Pendiente
        OR: [
          { send_at: null }, // Envío inmediato
          { send_at: { lte: now } }, // Programados que ya deben enviarse
        ],
      },
      include: {
        user: true,
        template: true,
      },
      orderBy: { createdAt: 'asc' }, // Más antiguos primero
      take: 50, // Procesar máximo 50 por lote
    });
  }

  /**
   * Buscar mensaje por ID
   */
  async findById(id: number): Promise<NotificationMessageQueue | null> {
    return prisma.notificationMessageQueue.findUnique({
      where: { id },
      include: {
        user: true,
        template: true,
      },
    });
  }

  /**
   * Actualizar mensaje
   */
  async update(id: number, data: Prisma.NotificationMessageQueueUpdateInput): Promise<NotificationMessageQueue> {
    return prisma.notificationMessageQueue.update({
      where: { id },
      data,
      include: {
        user: true,
        template: true,
      },
    });
  }

  /**
   * Actualizar status del mensaje
   */
  async updateStatus(
    id: number,
    status: number,
    messageResult?: string
  ): Promise<NotificationMessageQueue> {
    return prisma.notificationMessageQueue.update({
      where: { id },
      data: {
        status,
        message_result: messageResult,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Eliminar mensaje
   */
  async delete(id: number): Promise<NotificationMessageQueue> {
    return prisma.notificationMessageQueue.delete({
      where: { id },
    });
  }

  /**
   * Obtener historial de mensajes de un usuario
   */
  async findByUserId(userId: number): Promise<NotificationMessageQueue[]> {
    return prisma.notificationMessageQueue.findMany({
      where: { user_id: userId },
      include: {
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Contar mensajes por status
   */
  async countByStatus(): Promise<Record<number, number>> {
    const counts = await prisma.notificationMessageQueue.groupBy({
      by: ['status'],
      _count: true,
    });

    return counts.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<number, number>);
  }

  /**
   * Limpiar mensajes antiguos exitosos (más de 30 días)
   */
  async cleanOldMessages(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notificationMessageQueue.deleteMany({
      where: {
        status: 1, // Solo mensajes enviados exitosamente
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}