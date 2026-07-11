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
exports.EventPlaceSeatRepository = void 0;
const db_1 = require("../config/db");
class EventPlaceSeatRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceSeat.create({ data });
        });
    }
    // Bulk create — para cuando se genera una fila completa de sillas
    createMany(seats) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceSeat.createMany({
                data: seats.map((s) => (Object.assign(Object.assign({}, s), { status: 'ACTIVE' }))),
                skipDuplicates: true,
            });
        });
    }
    findAll(row_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceSeat.findMany({
                where: { row_id },
                orderBy: { seat_number: 'asc' },
            });
        });
    }
    findAllByPlace(place_id, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                row: { zone: { place_id } },
            };
            if (filters === null || filters === void 0 ? void 0 : filters.status)
                where.status = filters.status;
            return db_1.prisma.eventPlaceSeat.findMany({
                where,
                orderBy: { seat_number: 'asc' },
                include: {
                    row: {
                        select: {
                            id: true,
                            name: true,
                            zone: { select: { id: true, name: true } },
                        },
                    },
                },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceSeat.findUnique({
                where: { id },
                include: {
                    row: {
                        include: {
                            zone: {
                                include: {
                                    place: { select: { id: true, name_place: true } },
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
            return db_1.prisma.eventPlaceSeat.update({ where: { id }, data });
        });
    }
    // Bloquear/activar silla permanentemente (mantenimiento)
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceSeat.update({
                where: { id },
                data: { status },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventPlaceSeat.delete({ where: { id } });
        });
    }
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventPlaceSeat.count({ where: { id } });
            return count > 0;
        });
    }
    // Todos los seat_ids ACTIVE de un lugar — para inicializar EventSeatStatus
    findActiveIdsByPlace(place_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const seats = yield db_1.prisma.eventPlaceSeat.findMany({
                where: {
                    status: 'ACTIVE',
                    row: { zone: { place_id } },
                },
                select: { id: true },
            });
            return seats.map((s) => s.id);
        });
    }
}
exports.EventPlaceSeatRepository = EventPlaceSeatRepository;
