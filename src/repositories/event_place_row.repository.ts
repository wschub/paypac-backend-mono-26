import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class EventPlaceRowRepository {
  async create(data: Prisma.EventPlaceRowCreateInput) {
    return prisma.eventPlaceRow.create({ data });
  }

  async findAll(zone_id: number) {
    return prisma.eventPlaceRow.findMany({
      where: { zone_id },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { seats: true } },
      },
    });
  }

  async findById(id: number) {
    return prisma.eventPlaceRow.findUnique({
      where: { id },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            place: { select: { id: true, name_place: true } },
          },
        },
        seats: {
          orderBy: { seat_number: 'asc' },
        },
        _count: { select: { seats: true } },
      },
    });
  }

  async update(id: number, data: Prisma.EventPlaceRowUpdateInput) {
    return prisma.eventPlaceRow.update({
      where: { id },
      data,
      include: {
        _count: { select: { seats: true } },
      },
    });
  }

  async delete(id: number) {
    return prisma.eventPlaceRow.delete({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventPlaceRow.count({ where: { id } });
    return count > 0;
  }

  async findByNameAndZone(name: string, zone_id: number) {
    return prisma.eventPlaceRow.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        zone_id,
      },
    });
  }
}