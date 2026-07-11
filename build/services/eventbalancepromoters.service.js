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
exports.EventBalancePromotersService = void 0;
const eventbalancepromoters_repository_1 = require("../repositories/eventbalancepromoters.repository");
const event_repository_1 = require("../repositories/event.repository");
const user_repository_1 = require("../repositories/user.repository");
const balanceRepo = new eventbalancepromoters_repository_1.EventBalancePromotersRepository();
const eventRepo = new event_repository_1.EventRepository();
const userRepo = new user_repository_1.UserRepository();
class EventBalancePromotersService {
    /**
     * Crear un nuevo balance
     * Este método será llamado automáticamente desde transaction.service
     * cuando una compra se confirme como PAID
     */
    createBalance(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que el evento existe
            const event = yield eventRepo.findById(data.event_id);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar que el promotor existe
            const promoter = yield userRepo.findById(data.promoter_id);
            if (!promoter) {
                throw new Error('Promotor no encontrado');
            }
            // Verificar que el promotor tenga rol de PROMOTER o STAFF_PROMOTER
            if (!['PROMOTER', 'STAFF_PROMOTER'].includes(promoter.role)) {
                throw new Error('El usuario no es un promotor válido');
            }
            // Crear el balance
            const balanceData = {
                event_id: data.event_id,
                promoter_id: data.promoter_id,
                reward_rule_id: data.reward_rule_id || null,
                reward_amount: data.reward_amount,
                reward_description: data.reward_description,
                status: 0, // PENDING
                expiration_date: null, // Se asignará cuando el evento se FINALIZE
            };
            return balanceRepo.create(balanceData);
        });
    }
    /**
     * Obtener balances de un evento
     * Solo ORGANIZER (dueño) o PAYPAC pueden ver todos los balances
     */
    getBalancesByEventId(eventId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar permisos
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para ver los balances de este evento');
            }
            return balanceRepo.findByEventId(eventId);
        });
    }
    /**
     * Obtener extracto completo de un promotor
     * El promotor solo puede ver su propio extracto
     * ORGANIZER/PAYPAC pueden ver el de cualquiera
     */
    getPromoterBalance(promoterId, requestingUserId, requestingUserRole) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar permisos
            const isOwnBalance = promoterId === requestingUserId;
            const canViewAll = ['PAYPAC', 'ORGANIZER'].includes(requestingUserRole);
            if (!isOwnBalance && !canViewAll) {
                throw new Error('No tienes permisos para ver este extracto');
            }
            const balances = yield balanceRepo.findByPromoterId(promoterId);
            const totals = yield balanceRepo.calculateTotalsByPromoter(promoterId);
            return Object.assign(Object.assign({ promoter_id: promoterId }, totals), { balances });
        });
    }
    /**
     * Obtener estadísticas del promotor autenticado
     */
    getMyBalanceStats(promoterId) {
        return __awaiter(this, void 0, void 0, function* () {
            return balanceRepo.calculateTotalsByPromoter(promoterId);
        });
    }
    /**
     * Marcar balance como pagado
     * Solo ORGANIZER (dueño del evento) o PAYPAC
     */
    markAsPaid(id, userId, userRole, paymentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield balanceRepo.findById(id);
            if (!balance) {
                throw new Error('Balance no encontrado');
            }
            const event = yield eventRepo.findById(balance.event_id);
            if (!event) {
                throw new Error('Evento asociado no encontrado');
            }
            // Verificar permisos
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para marcar este balance como pagado');
            }
            // Verificar que el balance esté PENDING
            if (balance.status !== 0) {
                throw new Error('Solo se pueden marcar como pagados los balances pendientes');
            }
            // Actualizar a PAID
            const description = balance.reward_description || '';
            const paymentInfo = paymentDetails
                ? `\nPagado: ${paymentDetails.payment_method || 'N/A'} - Ref: ${paymentDetails.payment_reference || 'N/A'}`
                : '';
            return balanceRepo.update(id, {
                status: 1, // PAID
                reward_description: description + paymentInfo,
                updatedAt: new Date(),
            });
        });
    }
    /**
     * Marcar múltiples balances como pagados en lote
     */
    bulkMarkAsPaid(balanceIds, userId, userRole, paymentDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que todos los balances existen y son del mismo evento
            const balances = yield Promise.all(balanceIds.map(id => balanceRepo.findById(id)));
            const notFound = balances.filter(b => !b);
            if (notFound.length > 0) {
                throw new Error('Algunos balances no fueron encontrados');
            }
            // Verificar que todos son del mismo evento
            const eventIds = [...new Set(balances.map(b => b.event_id))];
            if (eventIds.length > 1) {
                throw new Error('Todos los balances deben ser del mismo evento');
            }
            const event = yield eventRepo.findById(eventIds[0]);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar permisos
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para marcar estos balances como pagados');
            }
            // Actualizar en lote
            const updated = yield balanceRepo.updateMany(balanceIds, {
                status: 1, // PAID
                updatedAt: new Date(),
            });
            return {
                message: `${updated} balances marcados como pagados`,
                updated_count: updated,
            };
        });
    }
    /**
     * Cancelar balance (por reembolso)
     * Crea un balance negativo para compensar
     */
    createRefundBalance(originalBalanceId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalBalance = yield balanceRepo.findById(originalBalanceId);
            if (!originalBalance) {
                throw new Error('Balance original no encontrado');
            }
            const event = yield eventRepo.findById(originalBalance.event_id);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar permisos
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para crear balance de reembolso');
            }
            // Crear balance negativo
            const refundData = {
                event_id: originalBalance.event_id,
                promoter_id: originalBalance.promoter_id,
                reward_rule_id: originalBalance.reward_rule_id,
                reward_amount: -(originalBalance.reward_amount || 0), // Negativo
                reward_description: `Reembolso de: ${originalBalance.reward_description}`,
                status: 0, // PENDING (se compensará en el siguiente pago)
                expiration_date: originalBalance.expiration_date,
            };
            return balanceRepo.create(refundData);
        });
    }
    /**
     * Asignar fecha de corte automáticamente cuando evento se FINALIZE
     * Este método será llamado automáticamente desde event.service
     */
    assignCutoffDateForEvent(eventId_1) {
        return __awaiter(this, arguments, void 0, function* (eventId, daysAfterEvent = 15) {
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Calcular fecha de corte
            const expirationDate = new Date(event.date_event);
            expirationDate.setDate(expirationDate.getDate() + daysAfterEvent);
            // Actualizar balances pendientes
            const updated = yield balanceRepo.assignCutoffDate(eventId, expirationDate);
            return {
                message: `Fecha de corte asignada a ${updated} balances`,
                expiration_date: expirationDate,
                updated_count: updated,
            };
        });
    }
    /**
     * Obtener estadísticas de balances de un evento
     */
    getEventBalanceStats(eventId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar permisos
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para ver estas estadísticas');
            }
            return balanceRepo.getEventBalanceStats(eventId);
        });
    }
    /**
     * Obtener todos los balances pendientes de pago
     * Solo PAYPAC
     */
    getAllPendingBalances(userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver todos los balances pendientes');
            }
            return balanceRepo.findByStatus(0); // PENDING
        });
    }
}
exports.EventBalancePromotersService = EventBalancePromotersService;
