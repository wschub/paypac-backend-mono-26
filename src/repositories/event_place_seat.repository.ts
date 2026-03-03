import { prisma } from '../config/db';
import { Prisma, SeatStatus } from '@prisma/client';

export class EventPlaceSeatRepository {
  async create(data: Prisma.EventPlaceSeatCreateInput) {
    return prisma.eventPlaceSeat.create({ data });
  }

  // Bulk create — para cuando se genera una fila completa de sillas
  async createMany(seats: { row_id: number; seat_number: string }[]) {
    return prisma.eventPlaceSeat.createMany({
      data: seats.map((s) => ({ ...s, status: 'ACTIVE' as SeatStatus })),
      skipDuplicates: true,
    });
  }

  async findAll(row_id: number) {
    return prisma.eventPlaceSeat.findMany({
      where: { row_id },
      orderBy: { seat_number: 'asc' },
    });
  }

  async findAllByPlace(place_id: number, filters?: { status?: SeatStatus }) {
    const where: Prisma.EventPlaceSeatWhereInput = {
      row: { zone: { place_id } },
    };
    if (filters?.status) where.status = filters.status;

    return prisma.eventPlaceSeat.findMany({
      where,
      orderBy: { seat_number: 'asc' },
      include: {
        row: {
          select: {
            id: true,
            name: true,
            zone: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async findById(id: number) {
    return prisma.eventPlaceSeat.findUnique({
      where: { id },
      include: {
        row: {
          include: {
            zone: {
              include: {
                place: { select: { id: true, name_place: true } },
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, data: Prisma.EventPlaceSeatUpdateInput) {
    return prisma.eventPlaceSeat.update({ where: { id }, data });
  }

  // Bloquear/activar silla permanentemente (mantenimiento)
  async updateStatus(id: number, status: SeatStatus) {
    return prisma.eventPlaceSeat.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: number) {
    return prisma.eventPlaceSeat.delete({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.eventPlaceSeat.count({ where: { id } });
    return count > 0;
  }

  // Todos los seat_ids ACTIVE de un lugar — para inicializar EventSeatStatus
  async findActiveIdsByPlace(place_id: number): Promise<number[]> {
    const seats = await prisma.eventPlaceSeat.findMany({
      where: {
        status: 'ACTIVE',
        row: { zone: { place_id } },
      },
      select: { id: true },
    });
    return seats.map((s) => s.id);
  }
}