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
exports.EventService = void 0;
const event_repository_1 = require("../repositories/event.repository");
const client_1 = require("@prisma/client");
const event_liquidation_service_1 = require("./event_liquidation.service");
const client_2 = require("../prisma/client");
const uuid_1 = require("uuid");
const slug_1 = require("../utils/slug");
const eventRepo = new event_repository_1.EventRepository();
const liquidationService = new event_liquidation_service_1.EventLiquidationService();
class EventService {
    /**
     * Crear un nuevo evento
     * Solo ORGANIZER y PAYPAC pueden crear eventos
     */
    createEvent(data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validar que el usuario tenga permiso para crear eventos
            if (!['PAYPAC', 'ORGANIZER'].includes(userRole)) {
                throw new Error('No tienes permisos para crear eventos');
            }
            const publicId = (0, uuid_1.v4)();
            const publicUrl = yield (0, slug_1.generateUniqueSlug)(data.name);
            const eventData = Object.assign(Object.assign({}, data), { organizer_id: userId, status: client_1.EVENT_STATUS.CREATED, public_id: publicId, public_url: publicUrl });
            return eventRepo.create(eventData);
        });
    }
    /**
     * Obtener eventos con filtros
     * Filtra según el rol del usuario
     */
    getEvents(filters, userRole, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let events;
            // Si es ORGANIZER, solo ve sus propios eventos
            if (userRole === 'ORGANIZER' && userId) {
                events = yield eventRepo.findByOrganizer(userId);
                // Si es CUSTOMER o PROMOTER, solo ve eventos ACTIVOS o APPROVED públicos
            }
            else if (['CUSTOMER', 'PROMOTER'].includes(userRole)) {
                const publicFilters = Object.assign(Object.assign({}, filters), { status: filters.status || [client_1.EVENT_STATUS.ACTIVE, client_1.EVENT_STATUS.APPROVED] });
                events = yield eventRepo.findAll(publicFilters);
                // PAYPAC y STAFF pueden ver todos los eventos
            }
            else {
                events = yield eventRepo.findAll(filters);
            }
            // Enriquecer cada evento con price_from
            return events.map(event => {
                var _a;
                return (Object.assign(Object.assign({}, event), { price_from: this.getPriceFrom((_a = event.localities) !== null && _a !== void 0 ? _a : []) }));
            });
        });
    }
    getPriceFrom(localities) {
        const now = new Date();
        let cheapest = null;
        for (const locality of localities) {
            for (const stage of locality.stages) {
                const inRange = new Date(stage.date_start) <= now && now <= new Date(stage.date_end);
                if (!inRange)
                    continue;
                if (!cheapest || stage.price_ticket < cheapest.price_ticket) {
                    cheapest = {
                        name_locality: locality.name_locality,
                        stage_name: stage.stage_name,
                        date_start: stage.date_start,
                        date_end: stage.date_end,
                        price_ticket: stage.price_ticket,
                    };
                }
            }
        }
        return cheapest;
    }
    /**
     * Obtener evento por ID
     */
    getEventById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(id);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            return event;
        });
    }
    /**
     * Obtener eventos del organizador autenticado
     */
    getMyEvents(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return eventRepo.findByOrganizer(userId);
        });
    }
    /**
     * Actualizar evento
     * Solo el dueño (ORGANIZER) o PAYPAC pueden actualizar
     */
    updateEvent(id, data, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(id);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar ownership
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para actualizar este evento');
            }
            // Si el evento ya fue APPROVED, solo PAYPAC puede editarlo
            if (event.status === client_1.EVENT_STATUS.APPROVED && !isPaypac) {
                throw new Error('Este evento ya fue aprobado. Solo PAYPAC puede modificarlo');
            }
            // Si cambió el nombre, regenerar public_url
            let updateData = Object.assign({}, data);
            if (data.name && data.name !== event.name) {
                updateData.public_url = yield (0, slug_1.generateUniqueSlug)(data.name, id);
            }
            return eventRepo.update(id, updateData);
        });
    }
    /**
     * Eliminar evento
     * Solo el dueño o PAYPAC pueden eliminar
     */
    deleteEvent(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(id);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para eliminar este evento');
            }
            // No se puede eliminar si hay tickets vendidos (agregar validación futura)
            // TODO: Verificar si hay invoices/tickets asociados
            return eventRepo.delete(id, userRole);
        });
    }
    /**
     * Actualizar status del evento
     * Solo PAYPAC puede cambiar el status (aprobar/rechazar/cancelar)
     */
    updateEventStatus(id, status, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede cambiar el status del evento');
            }
            const event = yield eventRepo.findById(id);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Validar transiciones de estado permitidas
            const validTransitions = {
                CREATED: [client_1.EVENT_STATUS.APPROVED, client_1.EVENT_STATUS.CANCELED],
                APPROVED: [client_1.EVENT_STATUS.SCHEDULED, client_1.EVENT_STATUS.CANCELED],
                SCHEDULED: [client_1.EVENT_STATUS.ACTIVE, client_1.EVENT_STATUS.RE_SCHEDULED, client_1.EVENT_STATUS.CANCELED],
                ACTIVE: [client_1.EVENT_STATUS.FINALIZED, client_1.EVENT_STATUS.CANCELED],
                CANCELED: [], // No se puede cambiar desde cancelado
                RE_SCHEDULED: [client_1.EVENT_STATUS.SCHEDULED, client_1.EVENT_STATUS.CANCELED],
                FINALIZED: [], // No se puede cambiar desde finalizado
            };
            const allowedStatuses = validTransitions[event.status];
            if (!allowedStatuses.includes(status)) {
                throw new Error(`No se puede cambiar de ${event.status} a ${status}`);
            }
            // ✅ AHORA
            const updatedEvent = yield eventRepo.updateStatus(id, status);
            if (status === client_1.EVENT_STATUS.FINALIZED) {
                try {
                    yield liquidationService.autoCreateFromEvent(id);
                }
                catch (liqError) {
                    console.error('⚠️ Error creando liquidación automática:', liqError.message);
                }
            }
            return updatedEvent;
        });
    }
    /**
     * Obtener estadísticas de eventos de un organizador
     */
    getOrganizerStats(organizerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield eventRepo.findByOrganizer(organizerId);
            const stats = {
                total: events.length,
                byStatus: {
                    CREATED: events.filter(e => e.status === client_1.EVENT_STATUS.CREATED).length,
                    APPROVED: events.filter(e => e.status === client_1.EVENT_STATUS.APPROVED).length,
                    SCHEDULED: events.filter(e => e.status === client_1.EVENT_STATUS.SCHEDULED).length,
                    ACTIVE: events.filter(e => e.status === client_1.EVENT_STATUS.ACTIVE).length,
                    FINALIZED: events.filter(e => e.status === client_1.EVENT_STATUS.FINALIZED).length,
                    CANCELED: events.filter(e => e.status === client_1.EVENT_STATUS.CANCELED).length,
                    RE_SCHEDULED: events.filter(e => e.status === client_1.EVENT_STATUS.RE_SCHEDULED).length,
                },
            };
            return stats;
        });
    }
    /**
   * Obtener eventos disponibles para promotores externos
   * con resumen de ventas del promotor autenticado
   */
    getEventByPublicUrl(publicUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return eventRepo.findByPublicUrl(publicUrl);
        });
    }
    getFeaturedEvents() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            return eventRepo.getFeaturedEvents(limit);
        });
    }
    getAvailableEventsForPromoter(promoter_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield eventRepo.findAvailableForPromoters(promoter_id);
            return events.map(event => {
                var _a;
                return (Object.assign(Object.assign({}, event), { price_from: this.getPriceFrom((_a = event.localities) !== null && _a !== void 0 ? _a : []) }));
            });
        });
    }
    getPublicEvents(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const page = parseInt(filters.page || '1') || 1;
            const limit = Math.min(parseInt(filters.limit || '20') || 20, 100);
            const skip = (page - 1) * limit;
            const parseIds = (v) => {
                const ids = v ? v.split(',').map(Number).filter(n => !isNaN(n)) : [];
                return ids.length > 0 ? ids : undefined;
            };
            const categoryIds = parseIds(filters.category_id);
            const subcategoryIds = parseIds(filters.subcategory_id);
            const subgenreIds = parseIds(filters.subgenre_id);
            const dateEventFilter = Object.assign(Object.assign({}, (filters.date_from && { gte: new Date(filters.date_from) })), (filters.date_to && { lte: new Date(filters.date_to) }));
            const where = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ status: { in: ['APPROVED', 'ACTIVE'] }, event_type: 'PUBLICO' }, (filters.featured === 'true' && { featured: true })), { localities: {
                    some: {
                        stages: {
                            some: {
                                date_start: { lte: now },
                                date_end: { gte: now },
                            },
                        },
                    },
                } }), (filters.search && {
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                    { short_description: { contains: filters.search, mode: 'insensitive' } },
                ],
            })), (Object.keys(dateEventFilter).length > 0 && { date_event: dateEventFilter })), (filters.city && { city: filters.city })), (categoryIds && { category_id: { in: categoryIds } })), (subcategoryIds && { subcategory_id: { in: subcategoryIds } })), (subgenreIds && { subgenre_id: { in: subgenreIds } }));
            const [events, total] = yield Promise.all([
                client_2.prisma.event.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        localities: {
                            include: {
                                stages: {
                                    where: { date_start: { lte: now }, date_end: { gte: now } },
                                    orderBy: { price_ticket: 'asc' },
                                    take: 1,
                                },
                            },
                        },
                        _count: {
                            select: {
                                tickets: { where: { status_ticket: { in: ['PAID', 'ACTIVE'] } } },
                                views: true,
                            },
                        },
                    },
                }),
                client_2.prisma.event.count({ where }),
            ]);
            let eventsFormatted = events.map((event) => {
                // Elegir la localidad con el stage activo más barato
                const localitiesWithStage = event.localities.filter((l) => l.stages.length > 0);
                localitiesWithStage.sort((a, b) => a.stages[0].price_ticket - b.stages[0].price_ticket);
                const locality = localitiesWithStage[0];
                const stage = locality === null || locality === void 0 ? void 0 : locality.stages[0];
                return {
                    id: event.id,
                    public_id: event.public_id,
                    public_url: event.public_url,
                    featured: event.featured,
                    name: event.name,
                    image: event.image,
                    short_description: event.short_description,
                    date_event: event.date_event,
                    place_address: event.place_address,
                    description: event.description,
                    cover: event.cover,
                    url_video: event.url_video,
                    organizer_id: event.organizer_id,
                    price_from: stage
                        ? {
                            name_locality: locality.name_locality,
                            stage_name: stage.stage_name,
                            date_start: stage.date_start,
                            date_end: stage.date_end,
                            price_ticket: stage.price_ticket,
                        }
                        : null,
                    popularityScore: (event._count.tickets * 0.6) + (event._count.views * 0.4),
                };
            });
            const sortBy = filters.sort_by || 'date_asc';
            if (sortBy === 'popularity') {
                eventsFormatted.sort((a, b) => b.popularityScore !== a.popularityScore
                    ? b.popularityScore - a.popularityScore
                    : new Date(a.date_event).getTime() - new Date(b.date_event).getTime());
            }
            else if (sortBy === 'price_asc') {
                eventsFormatted.sort((a, b) => {
                    var _a, _b, _c, _d;
                    const pa = (_b = (_a = a.price_from) === null || _a === void 0 ? void 0 : _a.price_ticket) !== null && _b !== void 0 ? _b : Infinity;
                    const pb = (_d = (_c = b.price_from) === null || _c === void 0 ? void 0 : _c.price_ticket) !== null && _d !== void 0 ? _d : Infinity;
                    return pa !== pb
                        ? pa - pb
                        : new Date(a.date_event).getTime() - new Date(b.date_event).getTime();
                });
            }
            else if (sortBy === 'price_desc') {
                eventsFormatted.sort((a, b) => {
                    var _a, _b, _c, _d;
                    const pa = (_b = (_a = a.price_from) === null || _a === void 0 ? void 0 : _a.price_ticket) !== null && _b !== void 0 ? _b : 0;
                    const pb = (_d = (_c = b.price_from) === null || _c === void 0 ? void 0 : _c.price_ticket) !== null && _d !== void 0 ? _d : 0;
                    return pa !== pb
                        ? pb - pa
                        : new Date(a.date_event).getTime() - new Date(b.date_event).getTime();
                });
            }
            else if (sortBy === 'name_asc') {
                eventsFormatted.sort((a, b) => a.name.localeCompare(b.name));
            }
            else {
                eventsFormatted.sort((a, b) => new Date(a.date_event).getTime() - new Date(b.date_event).getTime());
            }
            const eventsClean = eventsFormatted.map((_a) => {
                var { popularityScore } = _a, event = __rest(_a, ["popularityScore"]);
                return event;
            });
            return { data: eventsClean, total, page, limit, totalPages: Math.ceil(total / limit) };
        });
    }
    getPublicEventById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const now = new Date();
            const where = typeof id === 'number' ? { id } : { public_id: id };
            const event = yield client_2.prisma.event.findUnique({
                where,
                select: {
                    id: true,
                    public_id: true,
                    public_url: true,
                    featured: true,
                    name: true,
                    image: true,
                    short_description: true,
                    date_event: true,
                    date_end_event: true,
                    date_checkin_open: true,
                    place_address: true,
                    city: true,
                    country: true,
                    latitude: true,
                    longitude: true,
                    description: true,
                    cover: true,
                    url_video: true,
                    organizer_id: true,
                    commission_percentage: true,
                    status: true,
                    event_type: true,
                    localities: {
                        include: {
                            stages: {
                                where: { date_start: { lte: now }, date_end: { gte: now } },
                                orderBy: { price_ticket: 'asc' },
                                take: 1,
                            },
                        },
                    },
                },
            });
            const ev = event;
            if (!ev ||
                !['APPROVED', 'ACTIVE'].includes(ev.status) ||
                ev.event_type !== 'PUBLICO') {
                throw new Error('Event not found');
            }
            const locality = (_a = ev.localities) === null || _a === void 0 ? void 0 : _a[0];
            const stage = (_b = locality === null || locality === void 0 ? void 0 : locality.stages) === null || _b === void 0 ? void 0 : _b[0];
            return {
                data: {
                    id: ev.id,
                    public_id: ev.public_id,
                    public_url: ev.public_url,
                    featured: ev.featured,
                    name: ev.name,
                    image: ev.image,
                    short_description: ev.short_description,
                    date_event: ev.date_event,
                    date_end_event: ev.date_end_event,
                    date_checkin_open: ev.date_checkin_open,
                    place_address: ev.place_address,
                    city: ev.city,
                    country: ev.country,
                    latitude: ev.latitude,
                    longitude: ev.longitude,
                    description: ev.description,
                    cover: ev.cover,
                    url_video: ev.url_video,
                    organizer_id: ev.organizer_id,
                    commission_percentage: ev.commission_percentage,
                    price_from: stage
                        ? {
                            name_locality: locality.name_locality,
                            stage_name: stage.stage_name,
                            date_start: stage.date_start,
                            date_end: stage.date_end,
                            price_ticket: stage.price_ticket,
                        }
                        : null,
                },
            };
        });
    }
}
exports.EventService = EventService;
