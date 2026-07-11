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
exports.EventSeatStatusRepository = void 0;
const db_1 = require("../config/db");
class EventSeatStatusRepository {
    // Inicializar todos los asientos ACTIVE de un lugar para un evento
    initializeForEvent(seat_ids, event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventSeatStatus.createMany({
                data: seat_ids.map((seat_id) => ({
                    seat_id,
                    event_id,
                    status: 'AVAILABLE',
                })),
                skipDuplicates: true,
            });
        });
    }
    // Query principal del mapa interactivo — filtra expirados de HELD automáticamente
    findByEvent(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventSeatStatus.findMany({
                where: { event_id },
                include: {
                    seat: {
                        include: {
                            row: {
                                include: {
                                    zone: { select: { id: true, name: true } },
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    // Mapa simplificado para el frontend — solo { seat_id, status }
    findSeatMapByEvent(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const statuses = yield db_1.prisma.eventSeatStatus.findMany({
                where: { event_id },
                select: { seat_id: true, status: true, held_until: true },
            });
            // Si held_until expiró, se trata como AVAILABLE en la respuesta
            return statuses.reduce((map, s) => {
                const isExpiredHold = s.status === 'HELD' && s.held_until !== null && s.held_until < now;
                map[s.seat_id] = isExpiredHold ? 'AVAILABLE' : s.status;
                return map;
            }, {});
        });
    }
    findBySeatAndEvent(seat_id, event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventSeatStatus.findUnique({
                where: { seat_id_event_id: { seat_id, event_id } },
            });
        });
    }
    updateStatus(seat_id, event_id, status, held_until) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventSeatStatus.update({
                where: { seat_id_event_id: { seat_id, event_id } },
                data: {
                    status,
                    held_until: held_until !== null && held_until !== void 0 ? held_until : null,
                },
            });
        });
    }
    // Liberar todos los HELD expirados de un evento (útil para job o cleanup)
    releaseExpiredHolds(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return db_1.prisma.eventSeatStatus.updateMany({
                where: {
                    event_id,
                    status: 'HELD',
                    held_until: { lt: now },
                },
                data: { status: 'AVAILABLE', held_until: null },
            });
        });
    }
    // Contar disponibles para un evento
    countByStatus(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield db_1.prisma.eventSeatStatus.groupBy({
                by: ['status'],
                where: { event_id },
                _count: true,
            });
            return results.reduce((acc, r) => (Object.assign(Object.assign({}, acc), { [r.status]: r._count })), {});
        });
    }
}
exports.EventSeatStatusRepository = EventSeatStatusRepository;
