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
exports.PaymentMethodCardService = void 0;
const paymentmethodcard_repository_1 = require("../repositories/paymentmethodcard.repository");
const cardRepo = new paymentmethodcard_repository_1.PaymentMethodCardRepository();
class PaymentMethodCardService {
    /**
     * Guardar una nueva tarjeta tokenizada
     * Solo el usuario puede guardar sus propias tarjetas
     */
    createCard(data, userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validar que el user_id y user_uid coincidan con el usuario autenticado
            if (data.user_id !== userId || data.user_uid !== userUid) {
                throw new Error('No puedes guardar tarjetas para otro usuario');
            }
            // Validar que el token no exista ya (prevenir duplicados)
            const existingCard = yield cardRepo.findByToken(data.id_token);
            if (existingCard) {
                throw new Error('Esta tarjeta ya está registrada');
            }
            // Opcional: Validar que el usuario no tenga ya una tarjeta con los mismos últimos 4 dígitos
            // Esto es por UX, para evitar confusión
            const duplicateLastFour = yield cardRepo.findByLastFourAndUser(data.last_four, userId, userUid);
            if (duplicateLastFour) {
                // Permitir múltiples tarjetas con los mismos últimos 4 dígitos
                // pero advertir al usuario (esto se maneja en el frontend)
                console.warn(`Usuario ${userId} ya tiene una tarjeta terminada en ${data.last_four}`);
            }
            return cardRepo.create(data);
        });
    }
    /**
     * Obtener todas las tarjetas del usuario autenticado
     */
    getMyCards(userId_1, userUid_1) {
        return __awaiter(this, arguments, void 0, function* (userId, userUid, activeOnly = false) {
            if (activeOnly) {
                return cardRepo.findActiveByUserId(userId, userUid);
            }
            return cardRepo.findByUserId(userId, userUid);
        });
    }
    /**
     * Obtener una tarjeta por ID
     * Validar ownership: solo el dueño puede verla
     */
    getCardById(id, userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            const card = yield cardRepo.findById(id);
            if (!card) {
                throw new Error('Tarjeta no encontrada');
            }
            // Validar ownership
            if (card.user_id !== userId || card.user_uid !== userUid) {
                throw new Error('No tienes permiso para acceder a esta tarjeta');
            }
            return card;
        });
    }
    /**
     * Eliminar una tarjeta
     * Solo el dueño puede eliminarla
     */
    deleteCard(id, userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            const card = yield cardRepo.findById(id);
            if (!card) {
                throw new Error('Tarjeta no encontrada');
            }
            // Validar ownership
            if (card.user_id !== userId || card.user_uid !== userUid) {
                throw new Error('No tienes permiso para eliminar esta tarjeta');
            }
            return cardRepo.delete(id);
        });
    }
    /**
     * Limpiar tarjetas expiradas del usuario
     * Útil para mantener la BD limpia
     */
    cleanExpiredCards(userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedCount = yield cardRepo.deleteExpiredCards(userId, userUid);
            return {
                message: `Se eliminaron ${deletedCount} tarjeta(s) expirada(s)`,
                deleted: deletedCount,
            };
        });
    }
    /**
     * Obtener estadísticas de tarjetas del usuario
     */
    getCardStats(userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            const allCards = yield cardRepo.findByUserId(userId, userUid);
            const activeCards = yield cardRepo.findActiveByUserId(userId, userUid);
            const now = new Date();
            // Agrupar por marca
            const byBrand = allCards.reduce((acc, card) => {
                acc[card.brand] = (acc[card.brand] || 0) + 1;
                return acc;
            }, {});
            return {
                total: allCards.length,
                active: activeCards.length,
                expired: allCards.length - activeCards.length,
                by_brand: byBrand,
            };
        });
    }
    /**
     * Validar si una tarjeta es válida para usar en pago
     * Verifica que no esté expirada
     */
    validateCardForPayment(id, userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            const card = yield this.getCardById(id, userId, userUid);
            const now = new Date();
            const expiresAt = new Date(card.expires_at);
            if (now > expiresAt) {
                throw new Error('Esta tarjeta ha expirado. Por favor, agrega una nueva.');
            }
            return {
                valid: true,
                card,
            };
        });
    }
}
exports.PaymentMethodCardService = PaymentMethodCardService;
