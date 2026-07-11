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
exports.PromoterRequestRepository = void 0;
const client_1 = require("../prisma/client");
const include = {
    user: { select: { id: true, name: true, last_name: true, email: true, phone_number: true } },
    reviewed_by: { select: { id: true, name: true, last_name: true } },
};
class PromoterRequestRepository {
    create(user_id, motivation) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.promoterRequest.create({ data: { user_id, motivation }, include });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.promoterRequest.findUnique({ where: { id }, include });
        });
    }
    findByUserId(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.promoterRequest.findFirst({
                where: { user_id },
                orderBy: { createdAt: 'desc' },
                include,
            });
        });
    }
    findPendingByUserId(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.promoterRequest.findFirst({
                where: { user_id, status: 'PENDING' },
            });
        });
    }
    findAll(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.promoterRequest.findMany({
                where: status ? { status } : undefined,
                include,
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    updateStatus(id, status, reviewedById, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.promoterRequest.update({
                where: { id },
                data: {
                    status,
                    reviewed_by_id: reviewedById,
                    reviewed_at: new Date(),
                    rejection_reason: rejectionReason !== null && rejectionReason !== void 0 ? rejectionReason : null,
                },
                include,
            });
        });
    }
}
exports.PromoterRequestRepository = PromoterRequestRepository;
