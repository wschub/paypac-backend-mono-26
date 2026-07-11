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
exports.EventBalancePromotersRepository = void 0;
const db_1 = require("../config/db");
class EventBalancePromotersRepository {
    /**
     * Crear un nuevo balance
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventBalancePromoters.create({
                data,
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            date_event: true,
                            status: true,
                        },
                    },
                    promoter: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                        },
                    },
                    rewardRule: true,
                },
            });
        });
    }
    /**
     * Obtener todos los balances de un evento
     */
    findByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventBalancePromoters.findMany({
                where: { event_id: eventId },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            date_event: true,
                        },
                    },
                    promoter: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                    rewardRule: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Obtener todos los balances de un promotor
     */
    findByPromoterId(promoterId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventBalancePromoters.findMany({
                where: { promoter_id: promoterId },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            date_event: true,
                            status: true,
                        },
                    },
                    rewardRule: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Buscar balance por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventBalancePromoters.findUnique({
                where: { id },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            organizer_id: true,
                            date_event: true,
                            status: true,
                        },
                    },
                    promoter: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                        },
                    },
                    rewardRule: true,
                },
            });
        });
    }
    /**
     * Obtener balances por estado
     */
    findByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventBalancePromoters.findMany({
                where: { status },
                include: {
                    event: true,
                    promoter: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Obtener balances pendientes de un evento
     */
    findPendingByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventBalancePromoters.findMany({
                where: {
                    event_id: eventId,
                    status: 0, // PENDING
                },
                include: {
                    promoter: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                    rewardRule: true,
                },
            });
        });
    }
    /**
     * Actualizar balance
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventBalancePromoters.update({
                where: { id },
                data,
                include: {
                    event: true,
                    promoter: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    rewardRule: true,
                },
            });
        });
    }
    /**
     * Actualizar múltiples balances (para marcar como pagado en lote)
     */
    updateMany(ids, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.eventBalancePromoters.updateMany({
                where: {
                    id: { in: ids },
                },
                data,
            });
            return result.count;
        });
    }
    /**
     * Eliminar balance
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventBalancePromoters.delete({
                where: { id },
            });
        });
    }
    /**
     * Calcular total de balances por promotor y estado
     */
    calculateTotalsByPromoter(promoterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = yield this.findByPromoterId(promoterId);
            const pending = balances
                .filter(b => b.status === 0)
                .reduce((sum, b) => sum + (b.reward_amount || 0), 0);
            const paid = balances
                .filter(b => b.status === 1)
                .reduce((sum, b) => sum + (b.reward_amount || 0), 0);
            const canceled = balances
                .filter(b => b.status === 2)
                .reduce((sum, b) => sum + (b.reward_amount || 0), 0);
            return {
                total_pending: pending,
                total_paid: paid,
                total_canceled: canceled,
                total_all: pending + paid,
            };
        });
    }
    /**
     * Asignar fecha de corte a balances pendientes de un evento
     */
    assignCutoffDate(eventId, expirationDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.eventBalancePromoters.updateMany({
                where: {
                    event_id: eventId,
                    status: 0, // Solo PENDING
                    expiration_date: null, // Solo si aún no tiene fecha asignada
                },
                data: {
                    expiration_date: expirationDate,
                    updatedAt: new Date(),
                },
            });
            return result.count;
        });
    }
    /**
     * Obtener estadísticas de balances por evento
     */
    getEventBalanceStats(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = yield this.findByEventId(eventId);
            // Agrupar por promotor
            const byPromoter = balances.reduce((acc, balance) => {
                const promoterId = balance.promoter_id;
                if (!acc[promoterId]) {
                    acc[promoterId] = {
                        promoter: balance.promoter,
                        total_pending: 0,
                        total_paid: 0,
                        count: 0,
                    };
                }
                if (balance.status === 0) {
                    acc[promoterId].total_pending += balance.reward_amount || 0;
                }
                else if (balance.status === 1) {
                    acc[promoterId].total_paid += balance.reward_amount || 0;
                }
                acc[promoterId].count += 1;
                return acc;
            }, {});
            return {
                total_balances: balances.length,
                total_pending: balances
                    .filter(b => b.status === 0)
                    .reduce((sum, b) => sum + (b.reward_amount || 0), 0),
                total_paid: balances
                    .filter(b => b.status === 1)
                    .reduce((sum, b) => sum + (b.reward_amount || 0), 0),
                by_promoter: Object.values(byPromoter),
            };
        });
    }
    /**
     * Verificar si existe balance
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventBalancePromoters.count({
                where: { id },
            });
            return count > 0;
        });
    }
}
exports.EventBalancePromotersRepository = EventBalancePromotersRepository;
