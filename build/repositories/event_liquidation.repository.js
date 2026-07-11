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
exports.EventLiquidationRepository = void 0;
const db_1 = require("../config/db");
class EventLiquidationRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLiquidation.create({
                data,
                include: { company: true, event: true },
            });
        });
    }
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.company_id)
                where.company_id = filters.company_id;
            if (filters === null || filters === void 0 ? void 0 : filters.event_id)
                where.event_id = filters.event_id;
            if (filters === null || filters === void 0 ? void 0 : filters.status)
                where.status = filters.status;
            if ((filters === null || filters === void 0 ? void 0 : filters.from) || (filters === null || filters === void 0 ? void 0 : filters.to)) {
                where.liquidation_date = Object.assign(Object.assign({}, (filters.from && { gte: filters.from })), (filters.to && { lte: filters.to }));
            }
            return db_1.prisma.eventLiquidation.findMany({
                where,
                include: { company: true, event: { select: { id: true, name: true, date_event: true } } },
                orderBy: { liquidation_date: 'desc' },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLiquidation.findUnique({
                where: { id },
                include: { company: true, event: true },
            });
        });
    }
    findByNumLiquidation(num_liquidation) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLiquidation.findUnique({
                where: { num_liquidation },
                include: { company: true, event: true },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLiquidation.update({
                where: { id },
                data,
                include: { company: true, event: true },
            });
        });
    }
    updateStatus(id, status, paid_at) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLiquidation.update({
                where: { id },
                data: Object.assign({ status }, (status === 'PAID' && { paid_at: paid_at !== null && paid_at !== void 0 ? paid_at : new Date() })),
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLiquidation.delete({ where: { id } });
        });
    }
    generateNumLiquidation() {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventLiquidation.count();
            return `LIQ-${String(count + 1).padStart(4, '0')}`;
        });
    }
    sumByCompany(company_id, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { company_id };
            if (from || to) {
                where.liquidation_date = Object.assign(Object.assign({}, (from && { gte: from })), (to && { lte: to }));
            }
            return db_1.prisma.eventLiquidation.aggregate({
                where,
                _sum: { gross_amount: true, net_amount: true, paypac_commission: true, refunds: true },
            });
        });
    }
}
exports.EventLiquidationRepository = EventLiquidationRepository;
