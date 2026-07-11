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
exports.EventPlaceZoneRepository = void 0;
const db_1 = require("../config/db");
class EventPlaceZoneRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceZone.create({ data });
        });
    }
    findAll(place_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceZone.findMany({
                where: { place_id },
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { rows: true } },
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceZone.findUnique({
                where: { id },
                include: {
                    place: { select: { id: true, name_place: true, type_place: true } },
                    rows: {
                        orderBy: { name: 'asc' },
                        include: {
                            _count: { select: { seats: true } },
                        },
                    },
                    _count: { select: { rows: true } },
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceZone.update({
                where: { id },
                data,
                include: {
                    _count: { select: { rows: true } },
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceZone.delete({ where: { id } });
        });
    }
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventPlaceZone.count({ where: { id } });
            return count > 0;
        });
    }
    findByNameAndPlace(name, place_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceZone.findFirst({
                where: {
                    name: { equals: name, mode: 'insensitive' },
                    place_id,
                },
            });
        });
    }
}
exports.EventPlaceZoneRepository = EventPlaceZoneRepository;
