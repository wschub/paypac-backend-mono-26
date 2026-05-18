import { EventPrivateGuestRepository, GuestCreateData } from '../repositories/event_private_guest.repository';
import { EventRepository } from '../repositories/event.repository';

const guestRepo = new EventPrivateGuestRepository();
const eventRepo = new EventRepository();

export class EventPrivateGuestService {

  async inviteGuest(
    eventId: number,
    requesterId: number,
    requesterRole: string,
    data: Omit<GuestCreateData, 'event_id'>
  ) {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    const isOwner  = event.organizer_id === requesterId;
    const isPaypac = requesterRole === 'PAYPAC';
    if (!isOwner && !isPaypac) throw new Error('Solo el organizador puede gestionar la lista de invitados');

    if (event.event_type !== 'PRIVADO') {
      throw new Error('La lista de invitados solo aplica a eventos privados');
    }

    const existing = await guestRepo.findByEventAndEmail(eventId, data.email);
    if (existing) throw new Error('Este email ya está en la lista de invitados');

    return guestRepo.create({ event_id: eventId, ...data });
  }

  async getGuests(eventId: number, requesterId: number, requesterRole: string) {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    const isOwner  = event.organizer_id === requesterId;
    const isPaypac = requesterRole === 'PAYPAC';
    if (!isOwner && !isPaypac) throw new Error('No tienes permisos para ver la lista de invitados');

    return guestRepo.findByEventId(eventId);
  }

  async confirmGuest(
    eventId: number,
    guestId: number,
    requesterId: number,
    requesterRole: string
  ) {
    return this._changeStatus(eventId, guestId, requesterId, requesterRole, 'CONFIRMED');
  }

  async rejectGuest(
    eventId: number,
    guestId: number,
    requesterId: number,
    requesterRole: string
  ) {
    return this._changeStatus(eventId, guestId, requesterId, requesterRole, 'REJECTED');
  }

  async removeGuest(
    eventId: number,
    guestId: number,
    requesterId: number,
    requesterRole: string
  ) {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    const isOwner  = event.organizer_id === requesterId;
    const isPaypac = requesterRole === 'PAYPAC';
    if (!isOwner && !isPaypac) throw new Error('No tienes permisos para gestionar la lista de invitados');

    const guest = await guestRepo.findById(guestId);
    if (!guest || guest.event_id !== eventId) throw new Error('Invitado no encontrado');

    await guestRepo.delete(guestId);
    return { message: 'Invitado eliminado correctamente' };
  }

  async bulkInviteGuests(
    eventId: number,
    requesterId: number,
    requesterRole: string,
    guests: Array<Omit<GuestCreateData, 'event_id'>>
  ) {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    const isOwner  = event.organizer_id === requesterId;
    const isPaypac = requesterRole === 'PAYPAC';
    if (!isOwner && !isPaypac) throw new Error('Solo el organizador puede gestionar la lista de invitados');

    if (event.event_type !== 'PRIVADO') {
      throw new Error('La lista de invitados solo aplica a eventos privados');
    }

    const inserted: typeof guests = [];
    const skipped: Array<{ email: string; reason: string }> = [];

    for (const guest of guests) {
      const email = guest.email.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        skipped.push({ email: guest.email, reason: 'Email inválido' });
        continue;
      }

      const existing = await guestRepo.findByEventAndEmail(eventId, email);
      if (existing) {
        skipped.push({ email, reason: 'Ya está en la lista' });
        continue;
      }

      await guestRepo.create({ ...guest, event_id: eventId, email });
      inserted.push(guest);
    }

    return {
      summary: { total: guests.length, inserted: inserted.length, skipped: skipped.length },
      skipped,
    };
  }

  private async _changeStatus(
    eventId: number,
    guestId: number,
    requesterId: number,
    requesterRole: string,
    status: 'CONFIRMED' | 'REJECTED'
  ) {
    const event = await eventRepo.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');

    const isOwner  = event.organizer_id === requesterId;
    const isPaypac = requesterRole === 'PAYPAC';
    if (!isOwner && !isPaypac) throw new Error('No tienes permisos para gestionar la lista de invitados');

    const guest = await guestRepo.findById(guestId);
    if (!guest || guest.event_id !== eventId) throw new Error('Invitado no encontrado');

    return guestRepo.updateStatus(guestId, status);
  }
}
