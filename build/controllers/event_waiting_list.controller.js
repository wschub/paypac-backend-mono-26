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
exports.removeFromWaitingList = exports.getWaitingListByLocality = exports.getWaitingListByEvent = exports.registerWaitingListAuthenticated = void 0;
const event_waiting_list_service_1 = require("../services/event_waiting_list.service");
const service = new event_waiting_list_service_1.EventWaitingListService();
/**
 * POST /api/waiting-list — registro desde la app (usuario autenticado).
 * Los datos personales salen del usuario del token; dispara el mismo
 * email de confirmación que el registro público de la web.
 */
const registerWaitingListAuthenticated = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = req.user;
        const { event_id, locality_id, qty_requested } = req.body;
        const entry = yield service.register({
            event_id,
            locality_id: locality_id !== null && locality_id !== void 0 ? locality_id : null,
            name: user.name,
            last_name: user.last_name,
            email: user.email,
            phone_number: (_a = user.phone_number) !== null && _a !== void 0 ? _a : '',
            qty_requested,
        });
        res.status(201).json({ entry });
    }
    catch (error) {
        console.error('Error in registerWaitingListAuthenticated:', error);
        if (error.message.includes('ya está registrado')) {
            return res.status(409).json({ error: 'Conflict', message: error.message });
        }
        if (error.message.includes('no encontrad')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Error al registrar en lista de espera' });
    }
});
exports.registerWaitingListAuthenticated = registerWaitingListAuthenticated;
const getWaitingListByEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = parseInt(req.params.eventId);
        const list = yield service.getByEvent(eventId, req.user.id, req.user.role);
        res.status(200).json({ list });
    }
    catch (error) {
        console.error('Error in getWaitingListByEvent:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        if (error.message.includes('permiso')) {
            return res.status(403).json({ error: 'Forbidden', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Error al obtener lista de espera' });
    }
});
exports.getWaitingListByEvent = getWaitingListByEvent;
const getWaitingListByLocality = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const localityId = parseInt(req.params.localityId);
        const list = yield service.getByLocality(localityId);
        res.status(200).json({ list });
    }
    catch (error) {
        console.error('Error in getWaitingListByLocality:', error);
        if (error.message.includes('no encontrad')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Error al obtener lista de espera' });
    }
});
exports.getWaitingListByLocality = getWaitingListByLocality;
const removeFromWaitingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        yield service.remove(id);
        res.status(200).json({ message: 'Registro eliminado de la lista de espera' });
    }
    catch (error) {
        console.error('Error in removeFromWaitingList:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ error: 'Not found', message: error.message });
        }
        res.status(500).json({ error: 'Internal server error', message: 'Error al eliminar de lista de espera' });
    }
});
exports.removeFromWaitingList = removeFromWaitingList;
