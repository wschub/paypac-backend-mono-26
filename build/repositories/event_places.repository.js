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
exports.EventPlacesRepository = void 0;
const db_1 = require("../config/db");
class EventPlacesRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaces.create({ data });
        });
    }
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.name_place = { contains: filters.search, mode: 'insensitive' };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.type_place)
                where.type_place = filters.type_place;
            if (filters === null || filters === void 0 ? void 0 : filters.place_type)
                where.place_type = filters.place_type;
            return db_1.prisma.eventPlaces.findMany({
                where,
                orderBy: { name_place: 'asc' },
                include: {
                    _count: { select: { zones: true, events: true } },
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaces.findUnique({
                where: { id },
                include: {
                    zones: {
                        orderBy: { name: 'asc' },
                        include: {
                            _count: { select: { rows: true } },
                        },
                    },
                    _count: { select: { zones: true, events: true } },
                },
            });
        });
    }
    findByIdWithFullLayout(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaces.findUnique({
                where: { id },
                include: {
                    zones: {
                        orderBy: { name: 'asc' },
                        include: {
                            rows: {
                                orderBy: { name: 'asc' },
                                include: {
                                    seats: {
                                        orderBy: { seat_number: 'asc' },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaces.update({
                where: { id },
                data,
                include: {
                    _count: { select: { zones: true, events: true } },
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaces.delete({ where: { id } });
        });
    }
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventPlaces.count({ where: { id } });
            return count > 0;
        });
    }
    findByName(name_place) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaces.findFirst({
                where: { name_place: { equals: name_place, mode: 'insensitive' } },
            });
        });
    }
}
exports.EventPlacesRepository = EventPlacesRepository;
