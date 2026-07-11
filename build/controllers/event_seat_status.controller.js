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
exports.releaseExpiredHolds = exports.blockSeat = exports.releaseSeat = exports.holdSeat = exports.getSeatCountsByStatus = exports.getSeatMap = exports.initializeSeatMap = void 0;
const event_seat_status_service_1 = require("../services/event_seat_status.service");
const seatStatusService = new event_seat_status_service_1.EventSeatStatusService();
/**
 * POST /api/venues/seat-status/initialize
 * Inicializar todos los estados de sillas al aprobar un evento numerado
 * Acceso: PAYPAC y ORGANIZER
 */
const initializeSeatMap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { place_id, event_id } = req.body;
        const result = yield seatStatusService.initializeForEvent(place_id, event_id, userRole);
        res.status(201).json({ message: 'Mapa de sillas inicializado exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.initializeSeatMap = initializeSeatMap;
/**
 * GET /api/venues/seat-status/:event_id/map
 * Mapa { seat_id: status } para el mapa interactivo
 * Acceso: todos los roles
 */
const getSeatMap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield seatStatusService.getSeatMap(Number(req.params.event_id));
        res.status(200).json({ message: 'Mapa de sillas obtenido', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSeatMap = getSeatMap;
/**
 * GET /api/venues/seat-status/:event_id/counts
 * Conteo de sillas por estado — PAYPAC y ORGANIZER
 */
const getSeatCountsByStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield seatStatusService.getSeatCountsByStatus(Number(req.params.event_id));
        res.status(200).json({ message: 'Conteos por estado obtenidos', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getSeatCountsByStatus = getSeatCountsByStatus;
/**
 * POST /api/venues/seat-status/hold
 * Reservar silla en carrito por 10 minutos
 * Acceso: todos los roles
 */
const holdSeat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seat_id, event_id } = req.body;
        const result = yield seatStatusService.holdSeat(seat_id, event_id);
        res.status(200).json({ message: 'Silla reservada en carrito por 10 minutos', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.holdSeat = holdSeat;
/**
 * POST /api/venues/seat-status/release
 * Liberar silla del carrito manualmente
 * Acceso: todos los roles
 */
const releaseSeat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seat_id, event_id } = req.body;
        const result = yield seatStatusService.releaseSeat(seat_id, event_id);
        res.status(200).json({ message: 'Silla liberada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.releaseSeat = releaseSeat;
/**
 * POST /api/venues/seat-status/block
 * Bloquear silla para un evento (cortesía, prensa, producción)
 * Acceso: PAYPAC y ORGANIZER
 */
const blockSeat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { seat_id, event_id } = req.body;
        const result = yield seatStatusService.blockSeat(seat_id, event_id, userRole);
        res.status(200).json({ message: 'Silla bloqueada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.blockSeat = blockSeat;
/**
 * POST /api/venues/seat-status/:event_id/release-expired
 * Liberar todos los HELD expirados de un evento
 * Acceso: solo PAYPAC (o job interno)
 */
const releaseExpiredHolds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield seatStatusService.releaseExpiredHolds(Number(req.params.event_id));
        res.status(200).json({ message: 'Holds expirados liberados exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.releaseExpiredHolds = releaseExpiredHolds;
