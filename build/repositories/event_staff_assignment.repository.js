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
exports.EventStaffAssignmentRepository = void 0;
const db_1 = require("../config/db");
class EventStaffAssignmentRepository {
    /**
     * Asignar un STAFF a un evento
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.create({
                data,
                include: {
                    event: true,
                    user: true,
                    assignedBy: true,
                },
            });
        });
    }
    /**
     * Buscar asignación por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.findUnique({
                where: { id },
                include: {
                    event: true,
                    user: true,
                    assignedBy: true,
                },
            });
        });
    }
    /**
     * Verificar si un usuario está asignado a un evento
     */
    isStaffAssignedToEvent(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignment = yield db_1.prisma.eventStaffAssignment.findUnique({
                where: {
                    event_id_user_id: {
                        event_id: eventId,
                        user_id: userId,
                    },
                },
            });
            return !!assignment;
        });
    }
    /**
     * Obtener asignación específica (usuario + evento)
     */
    findByUserAndEvent(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.findUnique({
                where: {
                    event_id_user_id: {
                        event_id: eventId,
                        user_id: userId,
                    },
                },
                include: {
                    event: true,
                    user: true,
                },
            });
        });
    }
    /**
     * Obtener todos los staff asignados a un evento
     */
    findByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.findMany({
                where: { event_id: eventId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                            email: true,
                            role: true,
                        },
                    },
                    assignedBy: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                        },
                    },
                },
                orderBy: { assigned_at: 'desc' },
            });
        });
    }
    /**
   * Obtener eventos asignados al STAFF — excluye el evento activo de check-in
   * Opción A: todos los vigentes excepto el que está en ventana de check-in ahora
   */
    findByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return db_1.prisma.eventStaffAssignment.findMany({
                where: {
                    user_id: userId,
                    event: {
                        status: { in: ['APPROVED', 'ACTIVE'] },
                        // Evento no ha terminado
                        OR: [
                            { date_end_event: null },
                            { date_end_event: { gte: now } },
                        ],
                        // Excluir el evento que tiene check-in abierto ahora mismo
                        NOT: {
                            AND: [
                                { date_checkin_open: { lte: now } },
                                { date_checkin_close: { gte: now } },
                            ],
                        },
                    },
                },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            cover: true,
                            date_event: true,
                            date_end_event: true,
                            date_checkin_open: true,
                            date_checkin_close: true,
                            place_address: true,
                            city: true,
                            status: true,
                        },
                    },
                },
                orderBy: { event: { date_event: 'asc' } },
            });
        });
    }
    /**
     * Obtener el próximo evento con check-in abierto ahora mismo — LIMIT 1
     */
    findNextEvent(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            return db_1.prisma.eventStaffAssignment.findFirst({
                where: {
                    user_id: userId,
                    event: {
                        status: { in: ['APPROVED', 'ACTIVE'] },
                        date_checkin_open: { lte: now }, // check-in ya abrió
                        date_checkin_close: { gte: now }, // check-in no ha cerrado
                        OR: [
                            { date_end_event: null },
                            { date_end_event: { gte: now } },
                        ],
                    },
                },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            cover: true,
                            date_event: true,
                            date_end_event: true,
                            date_checkin_open: true,
                            date_checkin_close: true,
                            place_address: true,
                            city: true,
                            status: true,
                        },
                    },
                },
                orderBy: { event: { date_event: 'asc' } }, // el más próximo
            });
        });
    }
    /**
     * Actualizar asignación (para check-in, geolocalización, etc.)
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.update({
                where: { id },
                data,
            });
        });
    }
    /**
     * Check-in de STAFF en el evento (registra ubicación)
     */
    checkIn(userId, eventId, latitude, longitude) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.update({
                where: {
                    event_id_user_id: {
                        event_id: eventId,
                        user_id: userId,
                    },
                },
                data: {
                    checked_in: true,
                    checked_in_at: new Date(),
                    latitude,
                    longitude,
                },
            });
        });
    }
    /**
     * Check-out de STAFF (marca como no presente)
     */
    checkOut(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.update({
                where: {
                    event_id_user_id: {
                        event_id: eventId,
                        user_id: userId,
                    },
                },
                data: {
                    checked_in: false,
                    latitude: null,
                    longitude: null,
                },
            });
        });
    }
    /**
     * Eliminar asignación (remover STAFF de evento)
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.delete({
                where: { id },
            });
        });
    }
    /**
     * Eliminar por usuario y evento
     */
    deleteByUserAndEvent(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.delete({
                where: {
                    event_id_user_id: {
                        event_id: eventId,
                        user_id: userId,
                    },
                },
            });
        });
    }
    /**
     * Verificar si existe una asignación
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventStaffAssignment.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Contar STAFF asignados a un evento
     */
    countByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.count({
                where: { event_id: eventId },
            });
        });
    }
    /**
     * Contar eventos asignados a un STAFF
     */
    countByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.count({
                where: { user_id: userId },
            });
        });
    }
    /**
     * Obtener STAFF que están checked-in en un evento
     */
    findCheckedInByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventStaffAssignment.findMany({
                where: {
                    event_id: eventId,
                    checked_in: true,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                },
            });
        });
    }
}
exports.EventStaffAssignmentRepository = EventStaffAssignmentRepository;
