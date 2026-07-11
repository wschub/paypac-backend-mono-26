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
exports.getEventCheckinStats = exports.inviteStaffToEvent = exports.getEventStaffStats = exports.checkOutStaff = exports.checkInStaff = exports.removeStaffFromEvent = exports.getMyNextEvent = exports.getMyAssignedEvents = exports.getEventStaff = exports.assignStaffToEvent = void 0;
const event_staff_assignment_service_1 = require("../services/event_staff_assignment.service");
const utils_1 = require("../utils/utils");
const staffAssignmentService = new event_staff_assignment_service_1.EventStaffAssignmentService();
/**
 * POST /api/events/:eventId/staff
 * Asignar un STAFF a un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
const assignStaffToEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = (0, utils_1.paramToInt)(req.params.eventId);
        const { user_id, role_type } = req.body;
        const assignedBy = req.user;
        const result = yield staffAssignmentService.assignStaffToEvent(eventId, user_id, role_type, assignedBy.id, assignedBy.role);
        res.status(201).json({
            success: true,
            message: result.message,
            assignment: result.assignment,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.assignStaffToEvent = assignStaffToEvent;
/**
 * GET /api/events/:eventId/staff
 * Obtener todos los STAFF asignados a un evento
 * Requiere: ORGANIZER (dueño), STAFF del evento, o PAYPAC
 */
const getEventStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = (0, utils_1.paramToInt)(req.params.eventId);
        const user = req.user;
        const staff = yield staffAssignmentService.getEventStaff(eventId, user.id, user.role);
        res.status(200).json({
            success: true,
            count: staff.length,
            staff,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getEventStaff = getEventStaff;
/**
 * GET /api/staff/my-events
 * Obtener eventos asignados al STAFF autenticado
 * Requiere: STAFF, STAFF_PROMOTER
 */
const getMyAssignedEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const events = yield staffAssignmentService.getMyAssignedEvents(userId);
        res.status(200).json({
            success: true,
            count: events.length,
            events,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getMyAssignedEvents = getMyAssignedEvents;
//next event to start check-in 
const getMyNextEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield staffAssignmentService.getMyNextEvent(req.user.id);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.getMyNextEvent = getMyNextEvent;
/**
 * DELETE /api/events/:eventId/staff/:staffUserId
 * Remover un STAFF de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
const removeStaffFromEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = (0, utils_1.paramToInt)(req.params.eventId);
        const staffUserId = (0, utils_1.paramToInt)(req.params.staffUserId);
        const removedBy = req.user;
        const result = yield staffAssignmentService.removeStaffFromEvent(eventId, staffUserId, removedBy.id, removedBy.role);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.removeStaffFromEvent = removeStaffFromEvent;
/**
 * POST /api/events/:eventId/staff/check-in
 * Check-in del STAFF en el evento
 * Requiere: STAFF, STAFF_PROMOTER
 */
const checkInStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = (0, utils_1.paramToInt)(req.params.eventId);
        const userId = req.user.id;
        const { latitude, longitude } = req.body;
        const result = yield staffAssignmentService.checkInStaff(userId, eventId, latitude, longitude);
        res.status(200).json({
            success: true,
            message: result.message,
            assignment: result.assignment,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.checkInStaff = checkInStaff;
/**
 * POST /api/events/:eventId/staff/check-out
 * Check-out del STAFF del evento
 * Requiere: STAFF, STAFF_PROMOTER
 */
const checkOutStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = (0, utils_1.paramToInt)(req.params.eventId);
        const userId = req.user.id;
        const result = yield staffAssignmentService.checkOutStaff(userId, eventId);
        res.status(200).json({
            success: true,
            message: result.message,
            assignment: result.assignment,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.checkOutStaff = checkOutStaff;
/**
 * GET /api/events/:eventId/staff/stats
 * Obtener estadísticas de STAFF del evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
const getEventStaffStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = (0, utils_1.paramToInt)(req.params.eventId);
        const user = req.user;
        const stats = yield staffAssignmentService.getEventStaffStats(eventId, user.id, user.role);
        res.status(200).json({
            success: true,
            stats,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getEventStaffStats = getEventStaffStats;
/**
 * POST /api/events/:eventId/staff?invite=true
 * Invitar staff que aún no existe como usuario
 * Requiere: ORGANIZER o PAYPAC
 */
const inviteStaffToEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = (0, utils_1.paramToInt)(req.params.eventId);
        const assignedBy = req.user;
        const { role_type, door_identifier, email_or_phone } = req.body;
        const result = yield staffAssignmentService.inviteStaffToEvent(eventId, role_type, door_identifier, email_or_phone, assignedBy.id, assignedBy.role);
        res.status(201).json({
            success: true,
            message: result.message,
            assignment: result.assignment,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.inviteStaffToEvent = inviteStaffToEvent;
const getEventCheckinStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = (0, utils_1.paramToInt)(req.params.eventId);
        const userId = req.user.id;
        const stats = yield staffAssignmentService.getEventCheckinStats(eventId, userId);
        res.status(200).json(Object.assign({ success: true }, stats));
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getEventCheckinStats = getEventCheckinStats;
