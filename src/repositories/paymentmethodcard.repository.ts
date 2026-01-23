import { prisma } from '../config/db';
import { PaymentMethodCard, Prisma } from '@prisma/client';

export class PaymentMethodCardRepository {
  /**
   * Crear una nueva tarjeta tokenizada
   */
  async create(data: Prisma.PaymentMethodCardUncheckedCreateInput): Promise<PaymentMethodCard> {
    return prisma.paymentMethodCard.create({
      data,
    });
  }

  /**
   * Obtener todas las tarjetas de un usuario
   */
  async findByUserId(userId: number, userUid: string): Promise<PaymentMethodCard[]> {
    return prisma.paymentMethodCard.findMany({
      where: {
        user_id: userId,
        user_uid: userUid,
      },
      orderBy: { id: 'desc' }, // Más recientes primero
    });
  }

  /**
   * Obtener tarjetas activas (no expiradas) de un usuario
   */
  async findActiveByUserId(userId: number, userUid: string): Promise<PaymentMethodCard[]> {
    const now = new Date().toISOString();
    
    return prisma.paymentMethodCard.findMany({
      where: {
        user_id: userId,
        user_uid: userUid,
        // Filtrar solo tarjetas que no hayan expirado
        expires_at: {
          gte: now,
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Buscar tarjeta por ID
   */
  async findById(id: number): Promise<PaymentMethodCard | null> {
    return prisma.paymentMethodCard.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar tarjeta por token (id_token)
   * Útil para validar si ya existe
   */
  async findByToken(idToken: string): Promise<PaymentMethodCard | null> {
    return prisma.paymentMethodCard.findFirst({
      where: { id_token: idToken },
    });
  }

  /**
   * Buscar tarjeta por últimos 4 dígitos y usuario
   * Útil para evitar duplicados
   */
  async findByLastFourAndUser(
    lastFour: string,
    userId: number,
    userUid: string
  ): Promise<PaymentMethodCard | null> {
    return prisma.paymentMethodCard.findFirst({
      where: {
        last_four: lastFour,
        user_id: userId,
        user_uid: userUid,
      },
    });
  }

  /**
   * Eliminar tarjeta
   */
  async delete(id: number): Promise<PaymentMethodCard> {
    return prisma.paymentMethodCard.delete({
      where: { id },
    });
  }

  /**
   * Verificar si una tarjeta existe
   */
  async exists(id: number): Promise<boolean> {
    const count = await prisma.paymentMethodCard.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Contar tarjetas de un usuario
   */
  async countByUserId(userId: number, userUid: string): Promise<number> {
    return prisma.paymentMethodCard.count({
      where: {
        user_id: userId,
        user_uid: userUid,
      },
    });
  }

  /**
   * Eliminar todas las tarjetas expiradas de un usuario
   * Útil para limpieza periódica
   */
  async deleteExpiredCards(userId: number, userUid: string): Promise<number> {
    const now = new Date().toISOString();
    
    const result = await prisma.paymentMethodCard.deleteMany({
      where: {
        user_id: userId,
        user_uid: userUid,
        validity_ends_at: {
          lt: now, // Menor que now = expiradas
        },
      },
    });
    
    return result.count;
  }
}