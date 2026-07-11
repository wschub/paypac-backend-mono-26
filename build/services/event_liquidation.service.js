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
exports.EventLiquidationService = void 0;
const event_liquidation_repository_1 = require("../repositories/event_liquidation.repository");
const event_repository_1 = require("../repositories/event.repository");
const liquidationRepo = new event_liquidation_repository_1.EventLiquidationRepository();
const eventRepo = new event_repository_1.EventRepository();
class EventLiquidationService {
    createLiquidation(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede crear liquidaciones');
            const event = yield eventRepo.findById(data.event_id);
            if (!event)
                throw new Error('Evento no encontrado');
            const num_liquidation = yield liquidationRepo.generateNumLiquidation();
            const net_amount = data.gross_amount
                - data.paypac_commission
                - ((_a = data.promoter_commission) !== null && _a !== void 0 ? _a : 0)
                - ((_b = data.refunds) !== null && _b !== void 0 ? _b : 0);
            return liquidationRepo.create(Object.assign(Object.assign({}, data), { num_liquidation,
                net_amount, promoter_commission: (_c = data.promoter_commission) !== null && _c !== void 0 ? _c : 0, refunds: (_d = data.refunds) !== null && _d !== void 0 ? _d : 0 }));
        });
    }
    getLiquidations(filters, userRole, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // ORGANIZER solo ve las suyas — se aplica company_id desde el token en el controller
            return liquidationRepo.findAll(filters);
        });
    }
    getLiquidationById(id, userRole, companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const liq = yield liquidationRepo.findById(id);
            if (!liq)
                throw new Error('Liquidación no encontrada');
            if (userRole === 'ORGANIZER' && liq.company_id !== companyId)
                throw new Error('No tienes permisos para ver esta liquidación');
            return liq;
        });
    }
    updateStatus(id, status, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede actualizar el estado');
            const liq = yield liquidationRepo.findById(id);
            if (!liq)
                throw new Error('Liquidación no encontrada');
            return liquidationRepo.updateStatus(id, status);
        });
    }
    getMyBalance(companyId, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const summary = yield liquidationRepo.sumByCompany(companyId, from, to);
            const pending = yield liquidationRepo.findAll({ company_id: companyId, status: 'PENDING' });
            const overdue = yield liquidationRepo.findAll({ company_id: companyId, status: 'OVERDUE' });
            return {
                total_gross: (_a = summary._sum.gross_amount) !== null && _a !== void 0 ? _a : 0,
                total_net: (_b = summary._sum.net_amount) !== null && _b !== void 0 ? _b : 0,
                total_commission: (_c = summary._sum.paypac_commission) !== null && _c !== void 0 ? _c : 0,
                total_refunds: (_d = summary._sum.refunds) !== null && _d !== void 0 ? _d : 0,
                available: pending.reduce((a, l) => a + l.net_amount, 0),
                overdue_amount: overdue.reduce((a, l) => a + l.net_amount, 0),
                pending_count: pending.length,
                overdue_count: overdue.length,
            };
        });
    }
    deleteLiquidation(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede eliminar liquidaciones');
            const liq = yield liquidationRepo.findById(id);
            if (!liq)
                throw new Error('Liquidación no encontrada');
            return liquidationRepo.delete(id);
        });
    }
    // ─── Auto-crear liquidación al finalizar evento ───────────────────────────────
    autoCreateFromEvent(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const { prisma } = yield Promise.resolve().then(() => __importStar(require('../config/db')));
            // Verificar que no exista ya una liquidación para este evento
            const existing = yield liquidationRepo.findAll({ event_id });
            if (existing.length > 0) {
                console.log(`⚠️ Ya existe liquidación para evento ${event_id} — omitiendo`);
                return;
            }
            const event = yield eventRepo.findById(event_id);
            if (!event)
                throw new Error(`Evento ${event_id} no encontrado`);
            // Obtener company_id desde el organizador
            const organizer = yield prisma.user.findUnique({
                where: { id: event.organizer_id },
                select: { company_id: true },
            });
            if (!(organizer === null || organizer === void 0 ? void 0 : organizer.company_id)) {
                console.error(`⚠️ Organizador del evento ${event_id} no tiene empresa asignada`);
                return;
            }
            // Calcular desde Invoice
            const invoiceAgg = yield prisma.invoice.aggregate({
                where: { event_id, status: 'PAID' },
                _sum: {
                    total: true,
                    paypac_commission_amount: true,
                    promoter_commission_amount: true,
                    refunded_amount: true,
                },
            });
            const gross_amount = (_a = invoiceAgg._sum.total) !== null && _a !== void 0 ? _a : 0;
            const paypac_commission = (_b = invoiceAgg._sum.paypac_commission_amount) !== null && _b !== void 0 ? _b : 0;
            const promoter_commission = (_c = invoiceAgg._sum.promoter_commission_amount) !== null && _c !== void 0 ? _c : 0;
            const refunds = (_d = invoiceAgg._sum.refunded_amount) !== null && _d !== void 0 ? _d : 0;
            const net_amount = gross_amount - paypac_commission - promoter_commission - refunds;
            const num_liquidation = yield liquidationRepo.generateNumLiquidation();
            yield liquidationRepo.create({
                company_id: organizer.company_id,
                event_id,
                num_liquidation,
                gross_amount,
                paypac_commission,
                promoter_commission,
                refunds,
                net_amount,
                status: 'PENDING',
                liquidation_date: new Date(),
            });
            console.log(`✅ Liquidación ${num_liquidation} creada automáticamente para evento ${event_id}`);
        });
    }
}
exports.EventLiquidationService = EventLiquidationService;
