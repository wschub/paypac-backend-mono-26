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
exports.PromoterCodeService = void 0;
const promoter_code_repository_1 = require("../repositories/promoter_code.repository");
const promoCodeRepo = new promoter_code_repository_1.PromoterCodeRepository();
// Genera código único: NOMBRE + número random 4 dígitos
function generateCode(name) {
    const base = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${base}${suffix}`;
}
class PromoterCodeService {
    createCode(promoter_id, userRole, userId, customCode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Solo el propio promotor o PAYPAC pueden crear el código
            if (userRole !== 'PAYPAC' && userId !== promoter_id) {
                throw new Error('No tienes permisos para crear este código');
            }
            if (userRole !== 'PROMOTER' && userRole !== 'PAYPAC') {
                throw new Error('Solo usuarios con rol PROMOTER pueden tener código de promotor');
            }
            // Un promotor solo puede tener un código activo
            const existing = yield promoCodeRepo.findByPromoter(promoter_id);
            if (existing)
                throw new Error('Este promotor ya tiene un código asignado');
            // Generar o validar código personalizado
            let code = customCode === null || customCode === void 0 ? void 0 : customCode.toUpperCase().trim();
            if (code) {
                if (yield promoCodeRepo.codeExists(code))
                    throw new Error(`El código "${code}" ya está en uso`);
            }
            else {
                // Auto-generar único
                const user = yield Promise.resolve().then(() => __importStar(require('../config/db'))).then(m => m.prisma.user.findUnique({ where: { id: promoter_id }, select: { name: true } }));
                do {
                    code = generateCode((_a = user === null || user === void 0 ? void 0 : user.name) !== null && _a !== void 0 ? _a : 'PROMO');
                } while (yield promoCodeRepo.codeExists(code));
            }
            return promoCodeRepo.create({ promoter_id, code });
        });
    }
    getMyCode(promoter_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const code = yield promoCodeRepo.findByPromoter(promoter_id);
            if (!code)
                throw new Error('No tienes código de promotor aún');
            return code;
        });
    }
    getMyStats(promoter_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield promoCodeRepo.getPromoterStats(promoter_id);
            if (!stats)
                throw new Error('No tienes código de promotor aún');
            return stats;
        });
    }
    validateCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const promo = yield promoCodeRepo.findByCode(code.toUpperCase().trim());
            if (!promo)
                throw new Error('Código de promotor no encontrado');
            if (!promo.is_active)
                throw new Error('Este código de promotor no está activo');
            return {
                valid: true,
                promoter_id: promo.promoter_id,
                promoter: promo.promoter,
                code: promo.code,
            };
        });
    }
    toggleActive(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede activar/desactivar códigos');
            const code = yield promoCodeRepo.findById(id);
            if (!code)
                throw new Error('Código no encontrado');
            return promoCodeRepo.update(id, { is_active: !code.is_active });
        });
    }
    getAllCodes(filters, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede ver todos los códigos');
            return promoCodeRepo.findAll(filters);
        });
    }
    deleteCode(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede eliminar códigos');
            const code = yield promoCodeRepo.findById(id);
            if (!code)
                throw new Error('Código no encontrado');
            return promoCodeRepo.delete(id);
        });
    }
    // Llamado desde Invoice service al crear la compra
    applyCodeToInvoice(code, event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const promo = yield promoCodeRepo.findByCode(code.toUpperCase().trim());
            if (!promo || !promo.is_active)
                return null;
            // Verificar que el evento permite promotores externos
            const { prisma } = yield Promise.resolve().then(() => __importStar(require('../config/db')));
            const event = yield prisma.event.findUnique({
                where: { id: event_id },
                select: { allow_external_promoters: true, commission_percentage: true },
            });
            if (!(event === null || event === void 0 ? void 0 : event.allow_external_promoters))
                return null;
            // Buscar regla de recompensa para este evento
            const rewardRule = yield prisma.eventRewardRules.findFirst({
                where: { event_id },
            });
            return {
                promoter_code_id: promo.id,
                promoter_id: promo.promoter_id,
                reward_rule: rewardRule,
            };
        });
    }
    // Calcula comisión del promotor según la regla del evento
    calculatePromoterCommission(invoiceTotal, numTickets, rewardRule) {
        var _a;
        if (!rewardRule)
            return 0;
        switch (rewardRule.reward_type) {
            case 'PERCENTAGE':
                return rewardRule.reward_percentage
                    ? Math.round(invoiceTotal * rewardRule.reward_percentage / 100)
                    : 0;
            case 'FIXED_AMOUNT':
                // Verificar mínimos si aplican
                if (rewardRule.min_qty_tickets && numTickets < rewardRule.min_qty_tickets)
                    return 0;
                if (rewardRule.min_amount_tickets && invoiceTotal < rewardRule.min_amount_tickets)
                    return 0;
                return (_a = rewardRule.reward_amount) !== null && _a !== void 0 ? _a : 0;
            default:
                return 0;
        }
    }
}
exports.PromoterCodeService = PromoterCodeService;
