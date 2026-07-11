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
exports.EventPlaceRowRepository = void 0;
const db_1 = require("../config/db");
class EventPlaceRowRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceRow.create({ data });
        });
    }
    findAll(zone_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceRow.findMany({
                where: { zone_id },
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { seats: true } },
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceRow.findUnique({
                where: { id },
                include: {
                    zone: {
                        select: {
                            id: true,
                            name: true,
                            place: { select: { id: true, name_place: true } },
                        },
                    },
                    seats: {
                        orderBy: { seat_number: 'asc' },
                    },
                    _count: { select: { seats: true } },
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceRow.update({
                where: { id },
                data,
                include: {
                    _count: { select: { seats: true } },
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceRow.delete({ where: { id } });
        });
    }
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventPlaceRow.count({ where: { id } });
            return count > 0;
        });
    }
    findByNameAndZone(name, zone_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceRow.findFirst({
                where: {
                    name: { equals: name, mode: 'insensitive' },
                    zone_id,
                },
            });
        });
    }
}
exports.EventPlaceRowRepository = EventPlaceRowRepository;
