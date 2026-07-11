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
exports.PromoterCodeRepository = void 0;
const db_1 = require("../config/db");
class PromoterCodeRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.promoterCode.create({
                data,
                include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
            });
        });
    }
    findByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.promoterCode.findUnique({
                where: { code },
                include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.promoterCode.findUnique({
                where: { id },
                include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
            });
        });
    }
    findByPromoter(promoter_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.promoterCode.findFirst({
                where: { promoter_id },
                include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
            });
        });
    }
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.promoterCode.findMany({
                where: Object.assign(Object.assign({}, ((filters === null || filters === void 0 ? void 0 : filters.is_active) !== undefined && { is_active: filters.is_active })), ((filters === null || filters === void 0 ? void 0 : filters.promoter_id) && { promoter_id: filters.promoter_id })),
                include: {
                    promoter: { select: { id: true, name: true, last_name: true, email: true } },
                    _count: { select: { invoices: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.promoterCode.update({
                where: { id },
                data,
                include: { promoter: { select: { id: true, name: true, last_name: true, email: true } } },
            });
        });
    }
    incrementUses(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.promoterCode.update({
                where: { code },
                data: { uses_count: { increment: 1 } },
            });
        });
    }
    codeExists(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.promoterCode.count({ where: { code } });
            return count > 0;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.promoterCode.delete({ where: { id } });
        });
    }
    // Stats de un promotor — total ventas y comisiones acumuladas
    getPromoterStats(promoter_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const code = yield this.findByPromoter(promoter_id);
            if (!code)
                return null;
            const invoiceAgg = yield db_1.prisma.invoice.aggregate({
                where: { promoter_code_id: code.id, status: 'PAID' },
                _sum: { total: true, promoter_commission_amount: true },
                _count: { id: true },
            });
            return {
                code: code.code,
                uses_count: code.uses_count,
                total_sales: (_a = invoiceAgg._sum.total) !== null && _a !== void 0 ? _a : 0,
                total_commission: (_b = invoiceAgg._sum.promoter_commission_amount) !== null && _b !== void 0 ? _b : 0,
                total_invoices: (_c = invoiceAgg._count.id) !== null && _c !== void 0 ? _c : 0,
            };
        });
    }
}
exports.PromoterCodeRepository = PromoterCodeRepository;
