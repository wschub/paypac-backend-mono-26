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
exports.EventPlaceSeatService = void 0;
const event_place_seat_repository_1 = require("../repositories/event_place_seat.repository");
const event_place_row_repository_1 = require("../repositories/event_place_row.repository");
const seatRepo = new event_place_seat_repository_1.EventPlaceSeatRepository();
const rowRepo = new event_place_row_repository_1.EventPlaceRowRepository();
class EventPlaceSeatService {
    /**
     * Crear silla individual — solo PAYPAC
     */
    createSeat(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede crear sillas');
            const row = yield rowRepo.findById(data.row_id);
            if (!row)
                throw new Error(`Fila con ID ${data.row_id} no encontrada`);
            return seatRepo.create({
                seat_number: data.seat_number,
                row: { connect: { id: data.row_id } },
            });
        });
    }
    /**
     * Crear múltiples sillas de una fila (bulk) — solo PAYPAC
     * Ej: seat_numbers = ["A1","A2",...,"A20"]
     */
    createBulkSeats(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede crear sillas');
            const row = yield rowRepo.findById(data.row_id);
            if (!row)
                throw new Error(`Fila con ID ${data.row_id} no encontrada`);
            const seats = data.seat_numbers.map((seat_number) => ({
                row_id: data.row_id,
                seat_number,
            }));
            return seatRepo.createMany(seats);
        });
    }
    /**
     * Sillas de una fila — roles internos
     */
    getSeatsByRow(row_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield rowRepo.findById(row_id);
            if (!row)
                throw new Error(`Fila con ID ${row_id} no encontrada`);
            return seatRepo.findAll(row_id);
        });
    }
    /**
     * Todas las sillas de un lugar con filtro opcional de status — PAYPAC y ORGANIZER
     */
    getSeatsByPlace(place_id, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return seatRepo.findAllByPlace(place_id, filters);
        });
    }
    /**
     * Silla por ID con jerarquía completa — roles internos
     */
    getSeatById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const seat = yield seatRepo.findById(id);
            if (!seat)
                throw new Error('Silla no encontrada');
            return seat;
        });
    }
    /**
     * Cambiar estado permanente (ACTIVE / BLOCKED_MAINTENANCE) — solo PAYPAC
     */
    updateSeatStatus(id, status, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede cambiar el estado permanente de sillas');
            const seat = yield seatRepo.findById(id);
            if (!seat)
                throw new Error('Silla no encontrada');
            return seatRepo.updateStatus(id, status);
        });
    }
    /**
     * Eliminar silla — solo PAYPAC
     */
    deleteSeat(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC')
                throw new Error('Solo PAYPAC puede eliminar sillas');
            const seat = yield seatRepo.findById(id);
            if (!seat)
                throw new Error('Silla no encontrada');
            return seatRepo.delete(id);
        });
    }
}
exports.EventPlaceSeatService = EventPlaceSeatService;
