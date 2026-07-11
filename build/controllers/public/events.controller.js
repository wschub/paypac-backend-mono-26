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
exports.getFeaturedEvents = exports.getPublicEventBySlug = exports.getPublicEventById = exports.getPublicEvents = void 0;
const event_service_1 = require("../../services/event.service");
const eventService = new event_service_1.EventService();
const getPublicEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = req.query;
        const result = yield eventService.getPublicEvents(filters);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in getPublicEvents:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch events' });
    }
});
exports.getPublicEvents = getPublicEvents;
const getPublicEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const isNumeric = /^\d+$/.test(id);
        const result = yield eventService.getPublicEventById(isNumeric ? Number(id) : id);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in getPublicEventById:', error);
        res.status(404).json({ error: 'Not Found', message: 'Event not found' });
    }
});
exports.getPublicEventById = getPublicEventById;
const getPublicEventBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const publicUrl = req.params.publicUrl;
        const event = yield eventService.getEventByPublicUrl(publicUrl);
        if (!event ||
            !['APPROVED', 'ACTIVE'].includes(event.status) ||
            event.event_type !== 'PUBLICO') {
            return res.status(404).json({ error: 'Not found', message: 'Evento no encontrado' });
        }
        res.status(200).json({ event });
    }
    catch (error) {
        console.error('Error in getPublicEventBySlug:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch event' });
    }
});
exports.getPublicEventBySlug = getPublicEventBySlug;
const getFeaturedEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 50) : 10;
        const events = yield eventService.getFeaturedEvents(limit);
        res.status(200).json({ events });
    }
    catch (error) {
        console.error('Error in getFeaturedEvents:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch featured events' });
    }
});
exports.getFeaturedEvents = getFeaturedEvents;
