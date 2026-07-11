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
exports.EventRewardRulesRepository = void 0;
const db_1 = require("../config/db");
class EventRewardRulesRepository {
    /**
     * Crear una nueva regla de recompensa
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventRewardRules.create({
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
                },
            });
        });
    }
    /**
     * Obtener todas las reglas de un evento
     */
    findByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventRewardRules.findMany({
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
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Buscar regla por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventRewardRules.findUnique({
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
                    balances: true,
                },
            });
        });
    }
    /**
     * Obtener reglas por tipo de recompensa
     */
    findByRewardType(eventId, rewardType) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventRewardRules.findMany({
                where: {
                    event_id: eventId,
                    reward_type: rewardType,
                },
                include: {
                    locality: true,
                },
            });
        });
    }
    /**
     * Obtener reglas por localidad
     */
    findByLocalityId(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventRewardRules.findMany({
                where: { locality_id: localityId },
                include: {
                    event: true,
                    locality: true,
                },
            });
        });
    }
    /**
     * Actualizar regla
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventRewardRules.update({
                where: { id },
                data,
                include: {
                    event: true,
                    locality: true,
                },
            });
        });
    }
    /**
     * Eliminar regla
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventRewardRules.delete({
                where: { id },
            });
        });
    }
    /**
     * Verificar si una regla existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventRewardRules.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Contar reglas de un evento
     */
    countByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventRewardRules.count({
                where: { event_id: eventId },
            });
        });
    }
    /**
     * Buscar regla aplicable según cantidad y monto
     * Para calcular recompensa en el momento de la venta
     */
    findApplicableRule(eventId, quantity, amount, localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                event_id: eventId,
                AND: [
                    // Validar cantidad mínima
                    {
                        OR: [
                            { min_qty_tickets: null },
                            { min_qty_tickets: { lte: quantity } },
                        ],
                    },
                    // Validar monto mínimo
                    {
                        OR: [
                            { min_amount_tickets: null },
                            { min_amount_tickets: { lte: amount } },
                        ],
                    },
                ],
            };
            // Filtrar por localidad si se especifica
            if (localityId) {
                where.OR = [
                    { locality_id: null }, // Reglas generales
                    { locality_id: localityId }, // Reglas específicas de localidad
                ];
            }
            else {
                where.locality_id = null; // Solo reglas generales
            }
            // Retornar la primera regla que coincida
            // Ordenar por reward_percentage/reward_amount DESC para dar la mejor recompensa
            return db_1.prisma.eventRewardRules.findFirst({
                where,
                orderBy: [
                    { reward_percentage: 'desc' },
                    { reward_amount: 'desc' },
                ],
                include: {
                    locality: true,
                },
            });
        });
    }
    /**
     * Obtener todas las reglas aplicables (puede haber múltiples)
     */
    findAllApplicableRules(eventId, quantity, amount, localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                event_id: eventId,
                AND: [
                    {
                        OR: [
                            { min_qty_tickets: null },
                            { min_qty_tickets: { lte: quantity } },
                        ],
                    },
                    {
                        OR: [
                            { min_amount_tickets: null },
                            { min_amount_tickets: { lte: amount } },
                        ],
                    },
                ],
            };
            if (localityId) {
                where.OR = [
                    { locality_id: null },
                    { locality_id: localityId },
                ];
            }
            return db_1.prisma.eventRewardRules.findMany({
                where,
                orderBy: [
                    { reward_percentage: 'desc' },
                    { reward_amount: 'desc' },
                ],
                include: {
                    locality: true,
                },
            });
        });
    }
}
exports.EventRewardRulesRepository = EventRewardRulesRepository;
