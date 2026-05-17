import { prisma } from '../prisma/client';
import { GuestStatus } from '@prisma/client';

export class EventPrivateGuestRepository {
  async create(data: { event_id: number; email: string; name?: string; user_id?: number }) {
    return prisma.eventPrivateGuestList.create({ data });
  }

  async findById(id: number) {
    return prisma.eventPrivateGuestList.findUnique({ where: { id } });
  }

  async findByEventAndEmail(event_id: number, email: string) {
    return prisma.eventPrivateGuestList.findUnique({
      where: { event_id_email: { event_id, email } },
    });
  }

  async findByEventId(event_id: number) {
    return prisma.eventPrivateGuestList.findMany({
      where: { event_id },
      orderBy: { invited_at: 'desc' },
    });
  }

  async updateStatus(id: number, status: GuestStatus) {
    return prisma.eventPrivateGuestList.update({
      where: { id },
      data: {
        status,
        confirmed_at: status === 'CONFIRMED' ? new Date() : null,
      },
    });
  }

  async delete(id: number) {
    return prisma.eventPrivateGuestList.delete({ where: { id } });
  }
}
