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
exports.EventStagesRepository = void 0;
const db_1 = require("../config/db");
class EventStagesRepository {
    /**
     * Crear una nueva etapa (stage) para una localidad
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStages.create({
                data,
                include: {
                    locality: {
                        include: {
                            event: {
                                select: {
                                    id: true,
                                    name: true,
                                    organizer_id: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    /**
     * Obtener todas las etapas de una localidad específica
     */
    findByLocalityId(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStages.findMany({
                where: { locality_id: localityId },
                include: {
                    locality: {
                        include: {
                            event: {
                                select: {
                                    id: true,
                                    name: true,
                                    date_event: true,
                                    status: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { date_start: 'asc' },
            });
        });
    }
    /**
     * Buscar etapa por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStages.findUnique({
                where: { id },
                include: {
                    locality: {
                        include: {
                            event: {
                                select: {
                                    id: true,
                                    name: true,
                                    organizer_id: true,
                                    status: true,
                                    date_event: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    /**
     * Actualizar etapa
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStages.update({
                where: { id },
                data,
                include: {
                    locality: {
                        include: {
                            event: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Eliminar etapa
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStages.delete({
                where: { id },
            });
        });
    }
    /**
     * Verificar si una etapa existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventStages.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Contar etapas de una localidad
     */
    countByLocalityId(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStages.count({
                where: { locality_id: localityId },
            });
        });
    }
    /**
     * Verificar solapamiento de fechas en una localidad
     * Retorna las etapas que se solapan con el rango dado
     */
    findOverlappingStages(localityId, dateStart, dateEnd, excludeStageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                locality_id: localityId,
                AND: [
                    {
                        OR: [
                            // Caso 1: date_start está dentro del rango
                            {
                                date_start: {
                                    gte: dateStart,
                                    lte: dateEnd,
                                },
                            },
                            // Caso 2: date_end está dentro del rango
                            {
                                date_end: {
                                    gte: dateStart,
                                    lte: dateEnd,
                                },
                            },
                            // Caso 3: el rango está completamente dentro de la etapa existente
                            {
                                AND: [
                                    { date_start: { lte: dateStart } },
                                    { date_end: { gte: dateEnd } },
                                ],
                            },
                        ],
                    },
                ],
            };
            // Excluir la etapa actual si estamos actualizando
            if (excludeStageId) {
                where.id = { not: excludeStageId };
            }
            return db_1.prisma.eventStages.findMany({
                where,
                include: {
                    locality: true,
                },
            });
        });
    }
    /**
     * Obtener la etapa activa actual (si existe) para una localidad
     */
    findActiveStage(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return db_1.prisma.eventStages.findFirst({
                where: {
                    locality_id: localityId,
                    date_start: { lte: now },
                    date_end: { gte: now },
                },
                include: {
                    locality: true,
                },
            });
        });
    }
    /**
     * Obtener próximas etapas de una localidad
     */
    findUpcomingStages(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return db_1.prisma.eventStages.findMany({
                where: {
                    locality_id: localityId,
                    date_start: { gt: now },
                },
                orderBy: { date_start: 'asc' },
                take: 5, // Limitar a las próximas 5 etapas
            });
        });
    }
    /**
     * Obtener estadísticas de precios de una localidad
     */
    getPriceStatsByLocalityId(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stages = yield this.findByLocalityId(localityId);
            if (stages.length === 0) {
                return {
                    min_price: 0,
                    max_price: 0,
                    avg_price: 0,
                    total_stages: 0,
                };
            }
            const prices = stages.map(s => s.price_ticket);
            return {
                min_price: Math.min(...prices),
                max_price: Math.max(...prices),
                avg_price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
                total_stages: stages.length,
            };
        });
    }
}
exports.EventStagesRepository = EventStagesRepository;
