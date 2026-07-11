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
exports.getAvailableEventsForPromoter = exports.getOrganizerStats = exports.updateEventStatus = exports.deleteEvent = exports.updateEvent = exports.getMyEvents = exports.getEventById = exports.getEvents = exports.createEvent = void 0;
const event_service_1 = require("../services/event.service");
const eventService = new event_service_1.EventService();
/**
 * POST /api/events
 * Crear un nuevo evento (ORGANIZER, PAYPAC)
 */
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const data = req.body;
        const event = yield eventService.createEvent(data, user.id, user.role);
        res.status(201).json({
            message: 'Evento creado exitosamente',
            event,
        });
    }
    catch (err) {
        console.error('❌ Error en createEvent:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.createEvent = createEvent;
/**
 * GET /api/events
 * Listar eventos con filtros opcionales
 */
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const rawStatus = req.query.status;
        const filters = {
            status: rawStatus
                ? rawStatus.includes(',')
                    ? rawStatus.split(',')
                    : rawStatus
                : undefined,
            event_type: req.query.event_type,
            category_id: req.query.category_id
                ? Number(req.query.category_id)
                : undefined,
            country: req.query.country,
            city: req.query.city,
            search: req.query.search,
            allow_external_promoters: req.query.allow_external_promoters !== undefined // ← agregar
                ? req.query.allow_external_promoters === 'true'
                : undefined,
        };
        const events = yield eventService.getEvents(filters, user.role, user.id);
        res.status(200).json({
            total: events.length,
            events,
        });
    }
    catch (err) {
        console.error('❌ Error en getEvents:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getEvents = getEvents;
/**
 * GET /api/events/:id
 * Obtener un evento por ID
 */
const getEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawId = req.params.id;
        // public_id (UUID) — usado por deep links de la app
        if (!/^\d+$/.test(rawId)) {
            const result = yield eventService.getPublicEventById(rawId);
            res.status(200).json(result.data);
            return;
        }
        const event = yield eventService.getEventById(Number(rawId));
        res.status(200).json(event);
    }
    catch (err) {
        console.error('❌ Error en getEventById:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getEventById = getEventById;
/**
 * GET /api/events/my-events
 * Obtener eventos del organizador autenticado
 */
const getMyEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const events = yield eventService.getMyEvents(user.id);
        res.status(200).json({
            total: events.length,
            events,
        });
    }
    catch (err) {
        console.error('❌ Error en getMyEvents:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getMyEvents = getMyEvents;
/**
 * PUT /api/events/:id
 * Actualizar un evento (solo dueño o PAYPAC)
 */
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const data = req.body;
        const updatedEvent = yield eventService.updateEvent(id, data, user.id, user.role);
        res.status(200).json({
            message: 'Evento actualizado exitosamente',
            event: updatedEvent,
        });
    }
    catch (err) {
        console.error('❌ Error en updateEvent:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.updateEvent = updateEvent;
/**
 * DELETE /api/events/:id
 * Eliminar un evento (solo dueño o PAYPAC)
 */
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        yield eventService.deleteEvent(id, user.id, user.role);
        res.status(200).json({
            message: 'Evento eliminado exitosamente',
        });
    }
    catch (err) {
        console.error('❌ Error en deleteEvent:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.deleteEvent = deleteEvent;
/**
 * PATCH /api/events/:id/status
 * Actualizar el status de un evento (solo PAYPAC)
 */
const updateEventStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const { status } = req.body;
        const updatedEvent = yield eventService.updateEventStatus(id, status, user.role);
        res.status(200).json({
            message: `Status del evento actualizado a ${status}`,
            event: updatedEvent,
        });
    }
    catch (err) {
        console.error('❌ Error en updateEventStatus:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.updateEventStatus = updateEventStatus;
/**
 * GET /api/events/organizer/stats
 * Obtener estadísticas de eventos del organizador
 */
const getOrganizerStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const stats = yield eventService.getOrganizerStats(user.id);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('❌ Error en getOrganizerStats:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getOrganizerStats = getOrganizerStats;
/**
 * GET /api/events/promoter-available
 * Eventos disponibles para promotores externos
 * con resumen de ventas del promotor autenticado
 */
const getAvailableEventsForPromoter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const events = yield eventService.getAvailableEventsForPromoter(user.id);
        res.status(200).json({
            total: events.length,
            events,
        });
    }
    catch (err) {
        console.error('❌ Error en getAvailableEventsForPromoter:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getAvailableEventsForPromoter = getAvailableEventsForPromoter;
