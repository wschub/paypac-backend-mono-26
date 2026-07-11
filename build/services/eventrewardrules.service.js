"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.EventRewardRulesService = void 0;
const eventrewardrules_repository_1 = require("../repositories/eventrewardrules.repository");
const event_repository_1 = require("../repositories/event.repository");
const eventlocalities_repository_1 = require("../repositories/eventlocalities.repository");
const client_1 = require("@prisma/client");
const rewardRulesRepo = new eventrewardrules_repository_1.EventRewardRulesRepository();
const eventRepo = new event_repository_1.EventRepository();
const localitiesRepo = new eventlocalities_repository_1.EventLocalitiesRepository();
class EventRewardRulesService {
    createRewardRule(eventId, data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event)
                throw new Error('Evento no encontrado');
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para crear reglas de recompensa en este evento');
            }
            if (!event.allow_external_promoters && !event.allow_paypac_promotion) {
                throw new Error('Este evento no permite promotores externos');
            }
            if ([client_1.EVENT_STATUS.FINALIZED, client_1.EVENT_STATUS.CANCELED].includes(event.status)) {
                throw new Error(`No se pueden crear reglas en estado ${event.status}`);
            }
            if (!data.reward_type) {
                throw new Error('El tipo de recompensa es obligatorio');
            }
            const validRewardTypes = Object.values(client_1.EventRewardPromoters);
            if (!validRewardTypes.includes(data.reward_type)) {
                throw new Error('Tipo de recompensa inválido');
            }
            this.validateRewardData(data.reward_type, data);
            if (data.locality_id) {
                const locality = yield localitiesRepo.findById(data.locality_id);
                if (!locality || locality.event_id !== eventId) {
                    throw new Error('Localidad no encontrada o no pertenece a este evento');
                }
            }
            const ruleData = Object.assign(Object.assign({}, data), { event_id: eventId });
            return rewardRulesRepo.create(ruleData);
        });
    }
    getRewardRulesByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event)
                throw new Error('Evento no encontrado');
            return rewardRulesRepo.findByEventId(eventId);
        });
    }
    getRewardRuleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const rule = yield rewardRulesRepo.findById(id);
            if (!rule)
                throw new Error('Regla de recompensa no encontrada');
            return rule;
        });
    }
    updateRewardRule(id, data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const rule = yield rewardRulesRepo.findById(id);
            if (!rule)
                throw new Error('Regla de recompensa no encontrada');
            const event = yield eventRepo.findById(rule.event_id);
            if (!event)
                throw new Error('Evento asociado no encontrado');
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para actualizar esta regla');
            }
            if (event.status === client_1.EVENT_STATUS.FINALIZED) {
                throw new Error(`No se pueden actualizar reglas en estado ${event.status}`);
            }
            if (data.reward_type) {
                this.validateRewardData(data.reward_type, data);
            }
            return rewardRulesRepo.update(id, data);
        });
    }
    deleteRewardRule(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const rule = (yield rewardRulesRepo.findById(id));
            if (!rule)
                throw new Error('Regla de recompensa no encontrada');
            const event = yield eventRepo.findById(rule.event_id);
            if (!event)
                throw new Error('Evento asociado no encontrado');
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para eliminar esta regla');
            }
            if (rule.balances.length > 0) {
                throw new Error('No se puede eliminar una regla que ya tiene balances asociados');
            }
            return rewardRulesRepo.delete(id);
        });
    }
    calculateReward(eventId, quantity, totalAmount, localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const rule = (yield rewardRulesRepo.findApplicableRule(eventId, quantity, totalAmount, localityId));
            if (!rule)
                return null;
            let rewardAmount = 0;
            let description = '';
            switch (rule.reward_type) {
                case client_1.EventRewardPromoters.PERCENTAGE:
                    rewardAmount = Math.round((totalAmount * (rule.reward_percentage || 0)) / 100);
                    description = `${quantity} tickets × ${rule.reward_percentage}% = $${rewardAmount.toLocaleString()}`;
                    break;
                case client_1.EventRewardPromoters.FIXED_AMOUNT:
                    rewardAmount = rule.reward_amount || 0;
                    description = `Monto fijo: $${rewardAmount.toLocaleString()}`;
                    break;
                case client_1.EventRewardPromoters.TICKET_REWARD:
                    description = `${rule.reward_amount || 0} tickets gratis`;
                    break;
                case client_1.EventRewardPromoters.CASH_REWARD:
                    rewardAmount = rule.reward_amount || 0;
                    description = `Bono en efectivo: $${rewardAmount.toLocaleString()}`;
                    break;
                default:
                    description = 'Recompensa especial';
            }
            return {
                rule: {
                    id: rule.id,
                    type: rule.reward_type,
                    locality: ((_a = rule.locality) === null || _a === void 0 ? void 0 : _a.name_locality) || 'General',
                },
                rewardAmount,
                description,
            };
        });
    }
    validateRewardData(rewardType, data) {
        switch (rewardType) {
            case client_1.EventRewardPromoters.PERCENTAGE:
                if (!data.reward_percentage || data.reward_percentage <= 0 || data.reward_percentage > 100) {
                    throw new Error('El porcentaje debe estar entre 1 y 100');
                }
                break;
            case client_1.EventRewardPromoters.FIXED_AMOUNT:
            case client_1.EventRewardPromoters.CASH_REWARD:
                if (!data.reward_amount || data.reward_amount <= 0) {
                    throw new Error('El monto de recompensa debe ser mayor a 0');
                }
                break;
            case client_1.EventRewardPromoters.TICKET_REWARD:
                if (!data.reward_amount || data.reward_amount <= 0) {
                    throw new Error('La cantidad de tickets debe ser mayor a 0');
                }
                break;
            default:
                break;
        }
    }
    /**
   * Validar código al momento del checkout
   * Detecta si es descuento del organizador o código de promotor
   * GET /api/discounts/validate/:code?event_id=123
   */
    validateCode(code, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const { prisma } = yield Promise.resolve().then(() => __importStar(require('../config/db')));
            // ── 1. Buscar como código de descuento del organizador ──────────────
            const dcto = yield prisma.eventDcto.findFirst({
                where: {
                    //code: { equals: code, mode: 'insensitive' },
                    name_dcto: { equals: code, mode: 'insensitive' },
                    event_id: eventId,
                    is_active: true,
                },
            });
            if (dcto) {
                // Validar max_uses
                if (dcto.max_uses && dcto.uses_count >= dcto.max_uses) {
                    return { valid: false, reason: 'Este código ha alcanzado el límite de usos' };
                }
                return {
                    valid: true,
                    type: 'discount',
                    code: dcto.code,
                    discount_type: dcto.type_dcto,
                    discount_value: dcto.value_dcto,
                    min_qty_tickets: (_a = dcto.min_qty_tickets) !== null && _a !== void 0 ? _a : null,
                    max_qty_tickets: (_b = dcto.max_qty_tickets) !== null && _b !== void 0 ? _b : null,
                };
            }
            // ── 2. Buscar como código de promotor ───────────────────────────
            const promoCode = yield prisma.promoterCode.findFirst({
                where: {
                    code: { equals: code, mode: 'insensitive' }, // ← case-insensitive
                    is_active: true,
                },
                select: { id: true, is_active: true, promoter_id: true },
            });
            if (!promoCode) {
                return { valid: false, reason: 'Código no encontrado' };
            }
            if (!promoCode.is_active) {
                return { valid: false, reason: 'Este código no está activo' };
            }
            // Verificar que el evento permite promotores externos
            const event = yield prisma.event.findUnique({
                where: { id: eventId },
                select: { allow_external_promoters: true },
            });
            if (!(event === null || event === void 0 ? void 0 : event.allow_external_promoters)) {
                return { valid: false, reason: 'Este evento no acepta códigos de promotor' };
            }
            // Buscar regla de recompensa para saber si aplica dcto al cliente
            const rewardRule = yield prisma.eventRewardRules.findFirst({
                where: { event_id: eventId },
                select: {
                    apply_customer_discount: true,
                    customer_discount_type: true,
                    customer_discount_value: true,
                    commission_base: true,
                    reward_type: true,
                    reward_percentage: true,
                    reward_amount: true,
                },
            });
            return {
                valid: true,
                type: 'promoter',
                code,
                apply_customer_discount: (_c = rewardRule === null || rewardRule === void 0 ? void 0 : rewardRule.apply_customer_discount) !== null && _c !== void 0 ? _c : false,
                customer_discount_type: (_d = rewardRule === null || rewardRule === void 0 ? void 0 : rewardRule.customer_discount_type) !== null && _d !== void 0 ? _d : null,
                customer_discount_value: (_e = rewardRule === null || rewardRule === void 0 ? void 0 : rewardRule.customer_discount_value) !== null && _e !== void 0 ? _e : null,
                commission_base: (_f = rewardRule === null || rewardRule === void 0 ? void 0 : rewardRule.commission_base) !== null && _f !== void 0 ? _f : 'ON_DISCOUNTED',
            };
        });
    }
}
exports.EventRewardRulesService = EventRewardRulesService;
