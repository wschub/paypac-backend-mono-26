import { prisma } from '../prisma/client';

export class EventWaitingListRepository {

  async create(data: {
    event_id: number;
    locality_id?: number | null;
    name: string;
    last_name: string;
    email: string;
    phone_number: string;
    qty_requested?: number;
  }) {
    return prisma.eventWaitingList.create({ data });
  }

  async findByEventAndEmail(eventId: number, email: string) {
    return prisma.eventWaitingList.findUnique({
      where: { email_event_id: { email, event_id: eventId } },
    });
  }

  async findByEventId(eventId: number) {
    return prisma.eventWaitingList.findMany({
      where: { event_id: eventId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByLocalityId(localityId: number) {
    return prisma.eventWaitingList.findMany({
      where: { locality_id: localityId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async delete(id: number) {
    return prisma.eventWaitingList.delete({ where: { id } });
  }

  async countByEventId(eventId: number) {
    return prisma.eventWaitingList.count({ where: { event_id: eventId } });
  }
}
