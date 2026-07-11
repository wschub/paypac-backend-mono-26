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
exports.EventPrivateGuestRepository = void 0;
const client_1 = require("../prisma/client");
class EventPrivateGuestRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventPrivateGuestList.create({ data });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventPrivateGuestList.findUnique({ where: { id } });
        });
    }
    findByEventAndEmail(event_id, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventPrivateGuestList.findUnique({
                where: { event_id_email: { event_id, email } },
            });
        });
    }
    findByEventId(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventPrivateGuestList.findMany({
                where: { event_id },
                orderBy: { invited_at: 'desc' },
            });
        });
    }
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventPrivateGuestList.update({
                where: { id },
                data: {
                    status,
                    confirmed_at: status === 'CONFIRMED' ? new Date() : null,
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventPrivateGuestList.delete({ where: { id } });
        });
    }
}
exports.EventPrivateGuestRepository = EventPrivateGuestRepository;
