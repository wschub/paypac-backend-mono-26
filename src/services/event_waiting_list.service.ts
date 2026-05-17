import { EventWaitingListRepository } from '../repositories/event_waiting_list.repository';
import { prisma } from '../prisma/client';

const repo = new EventWaitingListRepository();

export class EventWaitingListService {

  async register(data: {
    event_id: number;
    locality_id?: number | null;
    name: string;
    last_name: string;
    email: string;
    phone_number: string;
  }) {
    const event = await prisma.event.findUnique({ where: { id: data.event_id } });
    if (!event) throw new Error('Evento no encontrado');

    if (data.locality_id) {
      const locality = await prisma.eventLocalities.findUnique({ where: { id: data.locality_id } });
      if (!locality || locality.event_id !== data.event_id) {
        throw new Error('Localidad no encontrada para este evento');
      }
    }

    const existing = await repo.findByEventAndEmail(data.event_id, data.email);
    if (existing) throw new Error('Este email ya está registrado en la lista de espera de este evento');

    return repo.create(data);
  }

  async getByEvent(eventId: number) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('Evento no encontrado');
    return repo.findByEventId(eventId);
  }

  async getByLocality(localityId: number) {
    const locality = await prisma.eventLocalities.findUnique({ where: { id: localityId } });
    if (!locality) throw new Error('Localidad no encontrada');
    return repo.findByLocalityId(localityId);
  }

  async remove(id: number) {
    const entry = await prisma.eventWaitingList.findUnique({ where: { id } });
    if (!entry) throw new Error('Registro no encontrado en lista de espera');
    await repo.delete(id);
  }
}
