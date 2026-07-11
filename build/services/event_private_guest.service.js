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
exports.EventPrivateGuestService = void 0;
const event_private_guest_repository_1 = require("../repositories/event_private_guest.repository");
const event_repository_1 = require("../repositories/event.repository");
const guestRepo = new event_private_guest_repository_1.EventPrivateGuestRepository();
const eventRepo = new event_repository_1.EventRepository();
class EventPrivateGuestService {
    inviteGuest(eventId, requesterId, requesterRole, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event)
                throw new Error('Evento no encontrado');
            const isOwner = event.organizer_id === requesterId;
            const isPaypac = requesterRole === 'PAYPAC';
            if (!isOwner && !isPaypac)
                throw new Error('Solo el organizador puede gestionar la lista de invitados');
            if (event.event_type !== 'PRIVADO') {
                throw new Error('La lista de invitados solo aplica a eventos privados');
            }
            const existing = yield guestRepo.findByEventAndEmail(eventId, data.email);
            if (existing)
                throw new Error('Este email ya está en la lista de invitados');
            return guestRepo.create(Object.assign({ event_id: eventId }, data));
        });
    }
    getGuests(eventId, requesterId, requesterRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event)
                throw new Error('Evento no encontrado');
            const isOwner = event.organizer_id === requesterId;
            const isPaypac = requesterRole === 'PAYPAC';
            if (!isOwner && !isPaypac)
                throw new Error('No tienes permisos para ver la lista de invitados');
            return guestRepo.findByEventId(eventId);
        });
    }
    confirmGuest(eventId, guestId, requesterId, requesterRole) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._changeStatus(eventId, guestId, requesterId, requesterRole, 'CONFIRMED');
        });
    }
    rejectGuest(eventId, guestId, requesterId, requesterRole) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._changeStatus(eventId, guestId, requesterId, requesterRole, 'REJECTED');
        });
    }
    removeGuest(eventId, guestId, requesterId, requesterRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event)
                throw new Error('Evento no encontrado');
            const isOwner = event.organizer_id === requesterId;
            const isPaypac = requesterRole === 'PAYPAC';
            if (!isOwner && !isPaypac)
                throw new Error('No tienes permisos para gestionar la lista de invitados');
            const guest = yield guestRepo.findById(guestId);
            if (!guest || guest.event_id !== eventId)
                throw new Error('Invitado no encontrado');
            yield guestRepo.delete(guestId);
            return { message: 'Invitado eliminado correctamente' };
        });
    }
    bulkInviteGuests(eventId, requesterId, requesterRole, guests) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event)
                throw new Error('Evento no encontrado');
            const isOwner = event.organizer_id === requesterId;
            const isPaypac = requesterRole === 'PAYPAC';
            if (!isOwner && !isPaypac)
                throw new Error('Solo el organizador puede gestionar la lista de invitados');
            if (event.event_type !== 'PRIVADO') {
                throw new Error('La lista de invitados solo aplica a eventos privados');
            }
            const inserted = [];
            const skipped = [];
            for (const guest of guests) {
                const email = guest.email.trim().toLowerCase();
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    skipped.push({ email: guest.email, reason: 'Email inválido' });
                    continue;
                }
                const existing = yield guestRepo.findByEventAndEmail(eventId, email);
                if (existing) {
                    skipped.push({ email, reason: 'Ya está en la lista' });
                    continue;
                }
                yield guestRepo.create(Object.assign(Object.assign({}, guest), { event_id: eventId, email }));
                inserted.push(guest);
            }
            return {
                summary: { total: guests.length, inserted: inserted.length, skipped: skipped.length },
                skipped,
            };
        });
    }
    _changeStatus(eventId, guestId, requesterId, requesterRole, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event)
                throw new Error('Evento no encontrado');
            const isOwner = event.organizer_id === requesterId;
            const isPaypac = requesterRole === 'PAYPAC';
            if (!isOwner && !isPaypac)
                throw new Error('No tienes permisos para gestionar la lista de invitados');
            const guest = yield guestRepo.findById(guestId);
            if (!guest || guest.event_id !== eventId)
                throw new Error('Invitado no encontrado');
            return guestRepo.updateStatus(guestId, status);
        });
    }
}
exports.EventPrivateGuestService = EventPrivateGuestService;
