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
exports.EventSeatStatusService = void 0;
const event_seat_status_repository_1 = require("../repositories/event_seat_status.repository");
const event_place_seat_repository_1 = require("../repositories/event_place_seat.repository");
const seatStatusRepo = new event_seat_status_repository_1.EventSeatStatusRepository();
const seatRepo = new event_place_seat_repository_1.EventPlaceSeatRepository();
const HOLD_MINUTES = 10;
class EventSeatStatusService {
    /**
     * Inicializar todos los estados de sillas para un evento recién aprobado
     * Llamado al crear/aprobar un evento numerado — PAYPAC u ORGANIZER
     */
    initializeForEvent(place_id, event_id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!['PAYPAC', 'ORGANIZER'].includes(userRole))
                throw new Error('Sin permisos para inicializar el mapa de sillas');
            const seat_ids = yield seatRepo.findActiveIdsByPlace(place_id);
            if (seat_ids.length === 0)
                throw new Error('El lugar no tiene sillas activas para inicializar');
            const result = yield seatStatusRepo.initializeForEvent(seat_ids, event_id);
            return { initialized: result.count, event_id, place_id };
        });
    }
    /**
     * Mapa simplificado { seat_id: status } para el mapa interactivo
     * Los HELD expirados se devuelven como AVAILABLE sin tocar la DB
     * Acceso: todos los roles
     */
    getSeatMap(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return seatStatusRepo.findSeatMapByEvent(event_id);
        });
    }
    /**
     * Detalle completo con jerarquía seat → row → zone
     * Acceso: PAYPAC y ORGANIZER
     */
    getSeatsForEvent(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return seatStatusRepo.findByEvent(event_id);
        });
    }
    /**
     * Reservar silla en carrito (HELD) — expira en HOLD_MINUTES
     * Acceso: todos los roles (CUSTOMER compra desde la app)
     */
    holdSeat(seat_id, event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield seatStatusRepo.findBySeatAndEvent(seat_id, event_id);
            if (!current)
                throw new Error('Silla no encontrada para este evento');
            const now = new Date();
            if (current.status === 'HELD' &&
                current.held_until !== null &&
                current.held_until > now) {
                throw new Error('La silla ya está reservada por otro usuario');
            }
            if (current.status === 'SOLD')
                throw new Error('La silla ya fue vendida');
            if (current.status === 'BLOCKED')
                throw new Error('La silla está bloqueada para este evento');
            const held_until = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);
            return seatStatusRepo.updateStatus(seat_id, event_id, 'HELD', held_until);
        });
    }
    /**
     * Confirmar venta de la silla — llamado desde el servicio de pagos/tickets
     * La silla debe estar en HELD antes de poder venderse
     */
    sellSeat(seat_id, event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield seatStatusRepo.findBySeatAndEvent(seat_id, event_id);
            if (!current)
                throw new Error('Silla no encontrada para este evento');
            if (current.status === 'SOLD')
                throw new Error('La silla ya fue vendida');
            if (current.status === 'BLOCKED')
                throw new Error('La silla está bloqueada para este evento');
            if (current.status === 'AVAILABLE')
                throw new Error('La silla debe estar en HELD antes de confirmar la venta');
            return seatStatusRepo.updateStatus(seat_id, event_id, 'SOLD');
        });
    }
    /**
     * Liberar silla del carrito manualmente
     * Acceso: todos los roles
     */
    releaseSeat(seat_id, event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const current = yield seatStatusRepo.findBySeatAndEvent(seat_id, event_id);
            if (!current)
                throw new Error('Silla no encontrada para este evento');
            if (current.status === 'SOLD')
                throw new Error('No se puede liberar una silla ya vendida');
            return seatStatusRepo.updateStatus(seat_id, event_id, 'AVAILABLE');
        });
    }
    /**
     * Bloquear silla para un evento (cortesía, prensa, producción)
     * Acceso: PAYPAC y ORGANIZER
     */
    blockSeat(seat_id, event_id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!['PAYPAC', 'ORGANIZER'].includes(userRole))
                throw new Error('Sin permisos para bloquear sillas');
            const current = yield seatStatusRepo.findBySeatAndEvent(seat_id, event_id);
            if (!current)
                throw new Error('Silla no encontrada para este evento');
            if (current.status === 'SOLD')
                throw new Error('No se puede bloquear una silla ya vendida');
            return seatStatusRepo.updateStatus(seat_id, event_id, 'BLOCKED');
        });
    }
    /**
     * Liberar todos los HELD expirados de un evento
     * Llamado desde job programado o manualmente por PAYPAC
     */
    releaseExpiredHolds(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return seatStatusRepo.releaseExpiredHolds(event_id);
        });
    }
    /**
     * Conteo de sillas por estado — PAYPAC y ORGANIZER
     */
    getSeatCountsByStatus(event_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return seatStatusRepo.countByStatus(event_id);
        });
    }
}
exports.EventSeatStatusService = EventSeatStatusService;
