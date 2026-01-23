import { PaymentMethodCardRepository } from '../repositories/paymentmethodcard.repository';
import { Prisma } from '@prisma/client';

const cardRepo = new PaymentMethodCardRepository();

export class PaymentMethodCardService {
  /**
   * Guardar una nueva tarjeta tokenizada
   * Solo el usuario puede guardar sus propias tarjetas
   */
  async createCard(
    data: Prisma.PaymentMethodCardUncheckedCreateInput,
    userId: number,
    userUid: string
  ) {
    // Validar que el user_id y user_uid coincidan con el usuario autenticado
    if (data.user_id !== userId || data.user_uid !== userUid) {
      throw new Error('No puedes guardar tarjetas para otro usuario');
    }

    // Validar que el token no exista ya (prevenir duplicados)
    const existingCard = await cardRepo.findByToken(data.id_token);
    if (existingCard) {
      throw new Error('Esta tarjeta ya está registrada');
    }

    // Opcional: Validar que el usuario no tenga ya una tarjeta con los mismos últimos 4 dígitos
    // Esto es por UX, para evitar confusión
    const duplicateLastFour = await cardRepo.findByLastFourAndUser(
      data.last_four,
      userId,
      userUid
    );
    if (duplicateLastFour) {
      // Permitir múltiples tarjetas con los mismos últimos 4 dígitos
      // pero advertir al usuario (esto se maneja en el frontend)
      console.warn(
        `Usuario ${userId} ya tiene una tarjeta terminada en ${data.last_four}`
      );
    }

    return cardRepo.create(data);
  }

  /**
   * Obtener todas las tarjetas del usuario autenticado
   */
  async getMyCards(userId: number, userUid: string, activeOnly: boolean = false) {
    if (activeOnly) {
      return cardRepo.findActiveByUserId(userId, userUid);
    }
    return cardRepo.findByUserId(userId, userUid);
  }

  /**
   * Obtener una tarjeta por ID
   * Validar ownership: solo el dueño puede verla
   */
  async getCardById(id: number, userId: number, userUid: string) {
    const card = await cardRepo.findById(id);
    
    if (!card) {
      throw new Error('Tarjeta no encontrada');
    }

    // Validar ownership
    if (card.user_id !== userId || card.user_uid !== userUid) {
      throw new Error('No tienes permiso para acceder a esta tarjeta');
    }

    return card;
  }

  /**
   * Eliminar una tarjeta
   * Solo el dueño puede eliminarla
   */
  async deleteCard(id: number, userId: number, userUid: string) {
    const card = await cardRepo.findById(id);
    
    if (!card) {
      throw new Error('Tarjeta no encontrada');
    }

    // Validar ownership
    if (card.user_id !== userId || card.user_uid !== userUid) {
      throw new Error('No tienes permiso para eliminar esta tarjeta');
    }

    return cardRepo.delete(id);
  }

  /**
   * Limpiar tarjetas expiradas del usuario
   * Útil para mantener la BD limpia
   */
  async cleanExpiredCards(userId: number, userUid: string) {
    const deletedCount = await cardRepo.deleteExpiredCards(userId, userUid);
    
    return {
      message: `Se eliminaron ${deletedCount} tarjeta(s) expirada(s)`,
      deleted: deletedCount,
    };
  }

  /**
   * Obtener estadísticas de tarjetas del usuario
   */
  async getCardStats(userId: number, userUid: string) {
    const allCards = await cardRepo.findByUserId(userId, userUid);
    const activeCards = await cardRepo.findActiveByUserId(userId, userUid);
    
    const now = new Date();
    
    // Agrupar por marca
    const byBrand = allCards.reduce((acc, card) => {
      acc[card.brand] = (acc[card.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: allCards.length,
      active: activeCards.length,
      expired: allCards.length - activeCards.length,
      by_brand: byBrand,
    };
  }

  /**
   * Validar si una tarjeta es válida para usar en pago
   * Verifica que no esté expirada
   */
  async validateCardForPayment(id: number, userId: number, userUid: string) {
    const card = await this.getCardById(id, userId, userUid);
    
    const now = new Date();
    const expiresAt = new Date(card.expires_at);
    
    if (now > expiresAt) {
      throw new Error('Esta tarjeta ha expirado. Por favor, agrega una nueva.');
    }

    return {
      valid: true,
      card,
    };
  }
}