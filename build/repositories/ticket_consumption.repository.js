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
exports.TicketConsumptionRepository = void 0;
const client_1 = require("../prisma/client");
class TicketConsumptionRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketConsumption.create({ data });
        });
    }
    findByTicketId(ticket_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.ticketConsumption.findMany({
                where: { ticket_id },
                orderBy: { consumed_at: 'desc' },
                include: {
                    consumed_by: { select: { id: true, name: true, last_name: true } },
                },
            });
        });
    }
    sumByTicketId(ticket_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield client_1.prisma.ticketConsumption.aggregate({
                where: { ticket_id },
                _sum: { amount: true },
            });
            return (_a = result._sum.amount) !== null && _a !== void 0 ? _a : 0;
        });
    }
}
exports.TicketConsumptionRepository = TicketConsumptionRepository;
