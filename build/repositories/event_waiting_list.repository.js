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
exports.EventWaitingListRepository = void 0;
const client_1 = require("../prisma/client");
class EventWaitingListRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventWaitingList.create({ data });
        });
    }
    findByEventAndEmail(eventId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventWaitingList.findUnique({
                where: { email_event_id: { email, event_id: eventId } },
            });
        });
    }
    findByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventWaitingList.findMany({
                where: { event_id: eventId },
                include: { locality: { select: { name_locality: true } } },
                orderBy: { createdAt: 'asc' },
            });
        });
    }
    findByLocalityId(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventWaitingList.findMany({
                where: { locality_id: localityId },
                orderBy: { createdAt: 'asc' },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventWaitingList.delete({ where: { id } });
        });
    }
    countByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return client_1.prisma.eventWaitingList.count({ where: { event_id: eventId } });
        });
    }
}
exports.EventWaitingListRepository = EventWaitingListRepository;
