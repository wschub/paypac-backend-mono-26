import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class EventPlaceZoneRepository {
  async create(data: Prisma.EventPlaceZoneCreateInput) {
    return prisma.eventPlaceZone.create({ data });
  }

  async findAll(place_id: number) {
    return prisma.eventPlaceZone.findMany({
      where: { place_id },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { rows: true } },
      },
    });
  }

  async findById(id: number) {
    return prisma.eventPlaceZone.findUnique({
      where: { id },
      include: {
        place: { select: { id: true, name_place: true, type_place: true } },
        rows: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { seats: true } },
          },
        },
        _count: { select: { rows: true } },
      },
    });
  }

  async update(id: number, data: Prisma.EventPlaceZoneUpdateInput) {
    return prisma.eventPlaceZone.update({
      where: { id },
      data,
      include: {
        _count: { select: { rows: true } },
      },
    });
  }

  async delete(id: number) {
    return prisma.eventPlaceZone.delete({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventPlaceZone.count({ where: { id } });
    return count > 0;
  }

  async findByNameAndPlace(name: string, place_id: number) {
    return prisma.eventPlaceZone.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        place_id,
      },
    });
  }
}