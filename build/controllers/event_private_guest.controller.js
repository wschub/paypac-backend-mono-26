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
exports.bulkInviteGuests = exports.removeGuest = exports.rejectGuest = exports.confirmGuest = exports.getGuests = exports.inviteGuest = void 0;
const event_private_guest_service_1 = require("../services/event_private_guest.service");
const guestService = new event_private_guest_service_1.EventPrivateGuestService();
const inviteGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = parseInt(req.params['eventId']);
        const user = req.user;
        const guest = yield guestService.inviteGuest(eventId, user.id, user.role, req.body);
        res.status(201).json({ guest });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.inviteGuest = inviteGuest;
const getGuests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = parseInt(req.params['eventId']);
        const user = req.user;
        const guests = yield guestService.getGuests(eventId, user.id, user.role);
        res.status(200).json({ guests });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.getGuests = getGuests;
const confirmGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = parseInt(req.params['eventId']);
        const guestId = parseInt(req.params['guestId']);
        const user = req.user;
        const guest = yield guestService.confirmGuest(eventId, guestId, user.id, user.role);
        res.status(200).json({ guest });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.confirmGuest = confirmGuest;
const rejectGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = parseInt(req.params['eventId']);
        const guestId = parseInt(req.params['guestId']);
        const user = req.user;
        const guest = yield guestService.rejectGuest(eventId, guestId, user.id, user.role);
        res.status(200).json({ guest });
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.rejectGuest = rejectGuest;
const removeGuest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = parseInt(req.params['eventId']);
        const guestId = parseInt(req.params['guestId']);
        const user = req.user;
        const result = yield guestService.removeGuest(eventId, guestId, user.id, user.role);
        res.status(200).json(result);
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.removeGuest = removeGuest;
const bulkInviteGuests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = parseInt(req.params['eventId']);
        const user = req.user;
        const { guests } = req.body;
        if (!Array.isArray(guests) || guests.length === 0) {
            res.status(400).json({ error: 'Bad request', message: 'El campo guests debe ser un array no vacío' });
            return;
        }
        const result = yield guestService.bulkInviteGuests(eventId, user.id, user.role, guests);
        res.status(200).json(result);
    }
    catch (error) {
        _handleError(res, error);
    }
});
exports.bulkInviteGuests = bulkInviteGuests;
function _handleError(res, error) {
    var _a;
    const msg = (_a = error.message) !== null && _a !== void 0 ? _a : '';
    if (msg.includes('no encontrad'))
        return res.status(404).json({ error: 'Not found', message: msg });
    if (msg.includes('permiso') || msg.includes('Solo el')) {
        return res.status(403).json({ error: 'Forbidden', message: msg });
    }
    if (msg.includes('ya está'))
        return res.status(409).json({ error: 'Conflict', message: msg });
    res.status(400).json({ error: 'Bad request', message: msg });
}
