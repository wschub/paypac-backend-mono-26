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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRepository = void 0;
const db_1 = require("../config/db");
class EventRepository {
    /**
     * Crear un nuevo evento
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.event.create({
                data,
                include: {
                    category: true, // ✅ 1:N singular
                    subcategory: true, // ✅ 1:N singular
                    subgenre: true, // ✅ 1:N singular
                },
            });
        });
    }
    /**
     * Obtener todos los eventos con filtros opcionales
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            // ✅ Filtro where — maneja ambos casos
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
                where.status = Array.isArray(filters.status)
                    ? { in: filters.status }
                    : filters.status;
            }
            if (filters === null || filters === void 0 ? void 0 : filters.event_type) {
                where.event_type = filters.event_type;
            }
            if (filters === null || filters === void 0 ? void 0 : filters.organizer_id) {
                where.organizer_id = filters.organizer_id;
            }
            if (filters === null || filters === void 0 ? void 0 : filters.country) {
                where.country = filters.country;
            }
            if (filters === null || filters === void 0 ? void 0 : filters.city) {
                where.city = filters.city;
            }
            // ✅ Filtro por category_id usando FK directa (1:N)
            if (filters === null || filters === void 0 ? void 0 : filters.category_id) {
                where.category_id = filters.category_id;
            }
            if (filters === null || filters === void 0 ? void 0 : filters.subcategory_id) {
                where.subcategory_id = filters.subcategory_id;
            }
            if (filters === null || filters === void 0 ? void 0 : filters.subgenre_id) {
                where.subgenre_id = filters.subgenre_id;
            }
            if ((filters === null || filters === void 0 ? void 0 : filters.allow_external_promoters) !== undefined) {
                where.allow_external_promoters = filters.allow_external_promoters;
            }
            if ((filters === null || filters === void 0 ? void 0 : filters.date_from) || (filters === null || filters === void 0 ? void 0 : filters.date_to)) {
                where.date_event = Object.assign(Object.assign({}, (filters.date_from && { gte: new Date(filters.date_from) })), (filters.date_to && { lte: new Date(filters.date_to) }));
            }
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                    { short_description: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            return db_1.prisma.event.findMany({
                where,
                include: {
                    category: true,
                    subcategory: true,
                    subgenre: true,
                    localities: {
                        include: {
                            stages: true,
                        },
                    },
                },
                orderBy: { date_event: 'asc' },
            });
        });
    }
    /**
     * Buscar evento por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.event.findUnique({
                where: { id },
                include: {
                    category: true,
                    subcategory: true,
                    subgenre: true,
                    localities: {
                        include: {
                            stages: true,
                        },
                    },
                    rewardRules: true,
                    discounts: true,
                },
            });
        });
    }
    /**
     * Buscar eventos de un organizador específico
     */
    findByOrganizer(organizerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.event.findMany({
                where: { organizer_id: organizerId },
                include: {
                    category: true,
                    subcategory: true,
                    subgenre: true,
                    localities: {
                        include: {
                            stages: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    /**
     * Actualizar evento
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.event.update({
                where: { id },
                data,
                include: {
                    category: true,
                    subcategory: true,
                    subgenre: true,
                    localities: {
                        include: {
                            stages: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Eliminar evento
     */
    delete(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield db_1.prisma.event.findUnique({
                where: { id },
                select: { status: true }
            });
            if (!event)
                throw new Error('Evento no encontrado');
            // 1. Aplicar reglas de negocio para el borrado
            if (event.status === 'CREATED') {
                if (userRole !== 'PAYPAC' && userRole !== 'ORGANIZER') {
                    throw new Error('Solo usuarios con rol PAYPAC u ORGANIZER pueden eliminar eventos en estado CREATED');
                }
            }
            else if (event.status === 'CANCELED') {
                if (userRole !== 'PAYPAC') {
                    throw new Error(`Solo usuarios con rol PAYPAC pueden eliminar eventos en estado CANCELED`);
                }
            }
            else {
                throw new Error(`No se permite eliminar un evento en estado ${event.status}.`);
            }
            // 2. Ejecutar borrado en cascada manual para relaciones sin 'onDelete: Cascade' en el schema
            return db_1.prisma.$transaction([
                // Eliminar etapas vinculadas a las localidades
                db_1.prisma.eventStages.deleteMany({
                    where: { locality: { event_id: id } }
                }),
                db_1.prisma.eventLocalities.deleteMany({ where: { event_id: id } }),
                db_1.prisma.eventRewardRules.deleteMany({ where: { event_id: id } }),
                db_1.prisma.eventBalancePromoters.deleteMany({ where: { event_id: id } }),
                db_1.prisma.eventDcto.deleteMany({ where: { event_id: id } }),
                db_1.prisma.eventSeatStatus.deleteMany({ where: { event_id: id } }),
                // Limpieza de ventas (Tickets e Invoices)
                db_1.prisma.ticket.deleteMany({ where: { event_id: id } }),
                db_1.prisma.invoiceTickets.deleteMany({ where: { invoice: { event_id: id } } }),
                db_1.prisma.invoice.deleteMany({ where: { event_id: id } }),
                db_1.prisma.eventLiquidation.deleteMany({ where: { event_id: id } }),
                // Listas auxiliares
                db_1.prisma.eventWaitingList.deleteMany({ where: { event_id: id } }),
                db_1.prisma.eventPrivateGuestList.deleteMany({ where: { event_id: id } }),
                // Se eliminan manualmente estas tablas para evitar violaciones de FK si el Cascade no está activo en la DB
                db_1.prisma.eventFavorites.deleteMany({ where: { event_id: id } }),
                db_1.prisma.eventStaffAssignment.deleteMany({ where: { event_id: id } }),
                db_1.prisma.eventView.deleteMany({ where: { event_id: id } }),
                db_1.prisma.event.delete({ where: { id } }),
            ]);
        });
    }
    /**
     * Actualizar solo el status del evento
     */
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.event.update({
                where: { id },
                data: { status },
                include: {
                    category: true,
                    subcategory: true,
                },
            });
        });
    }
    /**
     * Verificar si un evento existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.event.count({ where: { id } });
            return count > 0;
        });
    }
    /**
     * Contar eventos por organizador
     */
    countByOrganizer(organizerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.event.count({ where: { organizer_id: organizerId } });
        });
    }
    /**
   * Obtener eventos disponibles para promotores externos
   * Incluye resumen de ventas del promotor en cada evento
   */
    findAvailableForPromoters(promoter_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield db_1.prisma.event.findMany({
                where: {
                    allow_external_promoters: true,
                    status: { in: ['APPROVED', 'ACTIVE'] },
                },
                include: {
                    category: true,
                    subcategory: true,
                    subgenre: true,
                    localities: {
                        include: { stages: true },
                    },
                    promoterBalances: {
                        where: { promoter_id },
                        select: {
                            tickets_sold: true,
                            reward_amount: true,
                            status: true,
                        },
                    },
                },
                orderBy: { date_event: 'asc' },
            });
            return events.map((_a) => {
                var { promoterBalances } = _a, event = __rest(_a, ["promoterBalances"]);
                const tickets_sold = promoterBalances.reduce((acc, b) => acc + b.tickets_sold, 0);
                const total_earned = promoterBalances.reduce((acc, b) => { var _a; return acc + ((_a = b.reward_amount) !== null && _a !== void 0 ? _a : 0); }, 0);
                const pending_amount = promoterBalances
                    .filter(b => b.status === 0)
                    .reduce((acc, b) => { var _a; return acc + ((_a = b.reward_amount) !== null && _a !== void 0 ? _a : 0); }, 0);
                return Object.assign(Object.assign({}, event), { promoter_summary: {
                        has_sales: tickets_sold > 0,
                        tickets_sold,
                        total_earned,
                        pending_amount,
                    } });
            });
        });
    }
    findByPublicId(publicId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.event.findUnique({
                where: { public_id: publicId },
                include: {
                    category: true,
                    subcategory: true,
                    subgenre: true,
                    localities: { include: { stages: true } },
                },
            });
        });
    }
    findByPublicUrl(publicUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.event.findUnique({
                where: { public_url: publicUrl },
                include: {
                    category: true,
                    subcategory: true,
                    subgenre: true,
                    localities: { include: { stages: true } },
                },
            });
        });
    }
    getFeaturedEvents() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            return db_1.prisma.event.findMany({
                where: {
                    featured: true,
                    status: { in: ['APPROVED', 'ACTIVE'] },
                },
                orderBy: { date_event: 'asc' },
                take: limit,
                include: {
                    category: true,
                    subcategory: true,
                    subgenre: true,
                    localities: { include: { stages: true } },
                },
            });
        });
    }
}
exports.EventRepository = EventRepository;
