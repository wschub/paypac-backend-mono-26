import { prisma } from '../config/db';
import { Prisma, SeatEventStatus } from '@prisma/client';

export class EventSeatStatusRepository {
  // Inicializar todos los asientos ACTIVE de un lugar para un evento
  async initializeForEvent(seat_ids: number[], event_id: number) {
    return prisma.eventSeatStatus.createMany({
      data: seat_ids.map((seat_id) => ({
        seat_id,
        event_id,
        status: 'AVAILABLE' as SeatEventStatus,
      })),
      skipDuplicates: true,
    });
  }

  // Query principal del mapa interactivo — filtra expirados de HELD automáticamente
  async findByEvent(event_id: number) {
    return prisma.eventSeatStatus.findMany({
      where: { event_id },
      include: {
        seat: {
          include: {
            row: {
              include: {
                zone: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  // Mapa simplificado para el frontend — solo { seat_id, status }
  async findSeatMapByEvent(event_id: number): Promise<Record<number, string>> {
    const now = new Date();

    const statuses = await prisma.eventSeatStatus.findMany({
      where: { event_id },
      select: { seat_id: true, status: true, held_until: true },
    });

    // Si held_until expiró, se trata como AVAILABLE en la respuesta
    return statuses.reduce(
      (map, s) => {
        const isExpiredHold =
          s.status === 'HELD' && s.held_until !== null && s.held_until < now;
        map[s.seat_id] = isExpiredHold ? 'AVAILABLE' : s.status;
        return map;
      },
      {} as Record<number, string>
    );
  }

  async findBySeatAndEvent(seat_id: number, event_id: number) {
    return prisma.eventSeatStatus.findUnique({
      where: { seat_id_event_id: { seat_id, event_id } },
    });
  }

  async updateStatus(
    seat_id: number,
    event_id: number,
    status: SeatEventStatus,
    held_until?: Date
  ) {
    return prisma.eventSeatStatus.update({
      where: { seat_id_event_id: { seat_id, event_id } },
      data: {
        status,
        held_until: held_until ?? null,
      },
    });
  }

  // Liberar todos los HELD expirados de un evento (útil para job o cleanup)
  async releaseExpiredHolds(event_id: number) {
    const now = new Date();
    return prisma.eventSeatStatus.updateMany({
      where: {
        event_id,
        status: 'HELD',
        held_until: { lt: now },
      },
      data: { status: 'AVAILABLE', held_until: null },
    });
  }

  // Contar disponibles para un evento
  async countByStatus(event_id: number) {
    const results = await prisma.eventSeatStatus.groupBy({
      by: ['status'],
      where: { event_id },
      _count: true,
    });
    return results.reduce(
      (acc, r) => ({ ...acc, [r.status]: r._count }),
      {} as Record<string, number>
    );
  }
}