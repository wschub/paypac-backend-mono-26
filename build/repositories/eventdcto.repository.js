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
exports.EventDctoRepository = void 0;
const db_1 = require("../config/db");
class EventDctoRepository {
    /**
     * Crear un nuevo descuento
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventDcto.create({
                data,
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            organizer_id: true,
                            status: true,
                        },
                    },
                    locality: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Obtener todos los descuentos de un evento
     */
    findByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventDcto.findMany({
                where: { event_id: eventId },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                        },
                    },
                    locality: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Buscar descuento por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventDcto.findUnique({
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
                    locality: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Buscar descuento por nombre en un evento
     */
    findByName(eventId, codeOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventDcto.findFirst({
                where: {
                    event_id: eventId,
                    OR: [
                        { name_dcto: { equals: codeOrName, mode: 'insensitive' } },
                        { code: { equals: codeOrName, mode: 'insensitive' } },
                    ],
                },
            });
        });
    }
    incrementUses(eventId, codeOrName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.prisma.eventDcto.updateMany({
                where: {
                    event_id: eventId,
                    OR: [
                        { name_dcto: { equals: codeOrName, mode: 'insensitive' } },
                        { code: { equals: codeOrName, mode: 'insensitive' } },
                    ],
                },
                data: { uses_count: { increment: 1 } },
            });
        });
    }
    /**
     * Obtener descuentos por localidad
     */
    findByLocalityId(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventDcto.findMany({
                where: { locality_id: localityId },
                include: {
                    event: true,
                    locality: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Obtener descuentos creados por un usuario
     */
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventDcto.findMany({
                where: { user_id: userId },
                include: {
                    event: true,
                    locality: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Actualizar descuento
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventDcto.update({
                where: { id },
                data,
                include: {
                    event: true,
                    locality: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Eliminar descuento
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventDcto.delete({
                where: { id },
            });
        });
    }
    /**
     * Verificar si un descuento existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventDcto.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Contar descuentos de un evento
     */
    countByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventDcto.count({
                where: { event_id: eventId },
            });
        });
    }
    /**
     * Obtener descuentos aplicables a una cantidad de tickets
     */
    findApplicableDiscounts(eventId, quantity, localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                event_id: eventId,
                OR: [
                    // Sin restricción de cantidad
                    {
                        min_qty_tickets: null,
                        max_qty_tickets: null,
                    },
                    // Dentro del rango de cantidad
                    {
                        AND: [
                            {
                                OR: [
                                    { min_qty_tickets: null },
                                    { min_qty_tickets: { lte: quantity } },
                                ],
                            },
                            {
                                OR: [
                                    { max_qty_tickets: null },
                                    { max_qty_tickets: { gte: quantity } },
                                ],
                            },
                        ],
                    },
                ],
            };
            // Si se especifica localidad, filtrar por ella o descuentos generales
            if (localityId) {
                where.OR = [
                    { locality_id: null }, // Descuentos generales
                    { locality_id: localityId }, // Descuentos específicos de la localidad
                ];
            }
            return db_1.prisma.eventDcto.findMany({
                where,
                include: {
                    locality: true,
                },
                orderBy: { value_dcto: 'desc' }, // Mayor descuento primero
            });
        });
    }
}
exports.EventDctoRepository = EventDctoRepository;
