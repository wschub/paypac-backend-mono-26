import { prisma } from '../config/db';
import { Prisma, TypePlaces, Places } from '@prisma/client';

export class EventPlacesRepository {
  async create(data: Prisma.EventPlacesCreateInput) {
    return prisma.eventPlaces.create({ data });
  }

  async findAll(filters?: { search?: string; type_place?: TypePlaces; place_type?: Places }) {
    const where: Prisma.EventPlacesWhereInput = {};

    if (filters?.search) {
      where.name_place = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters?.type_place) where.type_place = filters.type_place;
    if (filters?.place_type) where.place_type = filters.place_type;

    return prisma.eventPlaces.findMany({
      where,
      orderBy: { name_place: 'asc' },
      include: {
        _count: { select: { zones: true, events: true } },
      },
    });
  }

  async findById(id: number) {
    return prisma.eventPlaces.findUnique({
      where: { id },
      include: {
        zones: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { rows: true } },
          },
        },
        _count: { select: { zones: true, events: true } },
      },
    });
  }

  async findByIdWithFullLayout(id: number) {
    return prisma.eventPlaces.findUnique({
      where: { id },
      include: {
        zones: {
          orderBy: { name: 'asc' },
          include: {
            rows: {
              orderBy: { name: 'asc' },
              include: {
                seats: {
                  orderBy: { seat_number: 'asc' },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.EventPlacesUpdateInput) {
    return prisma.eventPlaces.update({
      where: { id },
      data,
      include: {
        _count: { select: { zones: true, events: true } },
      },
    });
  }

  async delete(id: number) {
    return prisma.eventPlaces.delete({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventPlaces.count({ where: { id } });
    return count > 0;
  }

  async findByName(name_place: string) {
    return prisma.eventPlaces.findFirst({
      where: { name_place: { equals: name_place, mode: 'insensitive' } },
    });
  }
}