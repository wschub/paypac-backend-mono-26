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
exports.EventLocalitiesRepository = void 0;
const db_1 = require("../config/db");
class EventLocalitiesRepository {
    /**
     * Crear una nueva localidad para un evento
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLocalities.create({
                data,
                include: {
                    event: true,
                    stages: true,
                },
            });
        });
    }
    /**
     * Obtener todas las localidades de un evento específico
     */
    findByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLocalities.findMany({
                where: { event_id: eventId },
                include: {
                    stages: {
                        orderBy: { date_start: 'asc' },
                    },
                },
                orderBy: { createdAt: 'asc' },
            });
        });
    }
    /**
     * Buscar localidad por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLocalities.findUnique({
                where: { id },
                include: {
                    event: true,
                    stages: {
                        orderBy: { date_start: 'asc' },
                    },
                    rewardRules: true,
                    discounts: true,
                },
            });
        });
    }
    /**
     * Actualizar localidad
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLocalities.update({
                where: { id },
                data,
                include: {
                    event: true,
                    stages: true,
                },
            });
        });
    }
    /**
     * Eliminar localidad
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLocalities.delete({
                where: { id },
            });
        });
    }
    incrementTicketsSold(id, qty) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.eventLocalities.update({
                where: { id },
                data: { num_tickets_sold: { increment: qty } },
            });
        });
    }
    /**
     * Verificar si una localidad existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventLocalities.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Contar localidades de un evento
     */
    countByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLocalities.count({
                where: { event_id: eventId },
            });
        });
    }
    /**
     * Verificar si un evento tiene localidades
     */
    eventHasLocalities(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.countByEventId(eventId);
            return count > 0;
        });
    }
    /**
     * Obtener localidad con información completa de stages
     */
    findByIdWithDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventLocalities.findUnique({
                where: { id },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            organizer_id: true,
                            status: true,
                        },
                    },
                    stages: {
                        orderBy: { date_start: 'asc' },
                    },
                    rewardRules: true,
                    discounts: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
}
exports.EventLocalitiesRepository = EventLocalitiesRepository;
