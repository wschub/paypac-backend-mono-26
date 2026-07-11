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
exports.PaymentMethodCardRepository = void 0;
const db_1 = require("../config/db");
class PaymentMethodCardRepository {
    /**
     * Crear una nueva tarjeta tokenizada
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodCard.create({
                data,
            });
        });
    }
    /**
     * Obtener todas las tarjetas de un usuario
     */
    findByUserId(userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodCard.findMany({
                where: {
                    user_id: userId,
                    user_uid: userUid,
                },
                orderBy: { id: 'desc' }, // Más recientes primero
            });
        });
    }
    /**
     * Obtener tarjetas activas (no expiradas) de un usuario
     */
    findActiveByUserId(userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date().toISOString();
            return db_1.prisma.paymentMethodCard.findMany({
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
        });
    }
    /**
     * Buscar tarjeta por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodCard.findUnique({
                where: { id },
            });
        });
    }
    /**
     * Buscar tarjeta por token (id_token)
     * Útil para validar si ya existe
     */
    findByToken(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodCard.findFirst({
                where: { id_token: idToken },
            });
        });
    }
    /**
     * Buscar tarjeta por últimos 4 dígitos y usuario
     * Útil para evitar duplicados
     */
    findByLastFourAndUser(lastFour, userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodCard.findFirst({
                where: {
                    last_four: lastFour,
                    user_id: userId,
                    user_uid: userUid,
                },
            });
        });
    }
    /**
     * Eliminar tarjeta
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodCard.delete({
                where: { id },
            });
        });
    }
    /**
     * Verificar si una tarjeta existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.paymentMethodCard.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Contar tarjetas de un usuario
     */
    countByUserId(userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.paymentMethodCard.count({
                where: {
                    user_id: userId,
                    user_uid: userUid,
                },
            });
        });
    }
    /**
     * Eliminar todas las tarjetas expiradas de un usuario
     * Útil para limpieza periódica
     */
    deleteExpiredCards(userId, userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date().toISOString();
            const result = yield db_1.prisma.paymentMethodCard.deleteMany({
                where: {
                    user_id: userId,
                    user_uid: userUid,
                    validity_ends_at: {
                        lt: now, // Menor que now = expiradas
                    },
                },
            });
            return result.count;
        });
    }
}
exports.PaymentMethodCardRepository = PaymentMethodCardRepository;
