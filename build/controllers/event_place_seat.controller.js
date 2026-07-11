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
exports.deleteSeat = exports.updateSeatStatus = exports.getSeatById = exports.getSeatsByPlace = exports.getSeatsByRow = exports.createBulkSeats = exports.createSeat = void 0;
const event_place_seat_service_1 = require("../services/event_place_seat.service");
const seatService = new event_place_seat_service_1.EventPlaceSeatService();
/**
 * POST /api/venues/seats
 * Crear silla individual — solo PAYPAC
 */
const createSeat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield seatService.createSeat(req.body, userRole);
        res.status(201).json({ message: 'Silla creada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createSeat = createSeat;
/**
 * POST /api/venues/seats/bulk
 * Crear múltiples sillas de una fila — solo PAYPAC
 */
const createBulkSeats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield seatService.createBulkSeats(req.body, userRole);
        res.status(201).json({
            message: `${result.count} silla(s) creada(s) exitosamente`,
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createBulkSeats = createBulkSeats;
/**
 * GET /api/venues/rows/:row_id/seats
 * Sillas de una fila
 */
const getSeatsByRow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield seatService.getSeatsByRow(Number(req.params.row_id));
        res.status(200).json({ message: 'Sillas obtenidas exitosamente', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSeatsByRow = getSeatsByRow;
/**
 * GET /api/venues/:place_id/seats
 * Todas las sillas de un lugar (?status= opcional)
 */
const getSeatsByPlace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield seatService.getSeatsByPlace(Number(req.params.place_id), {
            status: req.query.status,
        });
        res.status(200).json({ message: 'Sillas del lugar obtenidas exitosamente', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSeatsByPlace = getSeatsByPlace;
/**
 * GET /api/venues/seats/:id
 * Silla por ID con jerarquía completa
 */
const getSeatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield seatService.getSeatById(Number(req.params.id));
        res.status(200).json({ message: 'Silla obtenida exitosamente', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSeatById = getSeatById;
/**
 * PATCH /api/venues/seats/:id/status
 * Cambiar estado permanente: ACTIVE / BLOCKED_MAINTENANCE — solo PAYPAC
 */
const updateSeatStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield seatService.updateSeatStatus(Number(req.params.id), req.body.status, userRole);
        res.status(200).json({ message: 'Estado de silla actualizado exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateSeatStatus = updateSeatStatus;
/**
 * DELETE /api/venues/seats/:id
 * Eliminar silla — solo PAYPAC
 */
const deleteSeat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield seatService.deleteSeat(Number(req.params.id), userRole);
        res.status(200).json({ message: 'Silla eliminada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteSeat = deleteSeat;
