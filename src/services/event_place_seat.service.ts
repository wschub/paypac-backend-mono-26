import { EventPlaceSeatRepository } from '../repositories/event_place_seat.repository';
import { EventPlaceRowRepository } from '../repositories/event_place_row.repository';
import { SeatStatus } from '@prisma/client';

const seatRepo = new EventPlaceSeatRepository();
const rowRepo  = new EventPlaceRowRepository();

export class EventPlaceSeatService {
  /**
   * Crear silla individual — solo PAYPAC
   */
  async createSeat(data: { seat_number: string; row_id: number }, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede crear sillas');

    const row = await rowRepo.findById(data.row_id);
    if (!row) throw new Error(`Fila con ID ${data.row_id} no encontrada`);

    return seatRepo.create({
      seat_number: data.seat_number,
      row: { connect: { id: data.row_id } },
    });
  }

  /**
   * Crear múltiples sillas de una fila (bulk) — solo PAYPAC
   * Ej: seat_numbers = ["A1","A2",...,"A20"]
   */
  async createBulkSeats(
    data: { row_id: number; seat_numbers: string[] },
    userRole: string
  ) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede crear sillas');

    const row = await rowRepo.findById(data.row_id);
    if (!row) throw new Error(`Fila con ID ${data.row_id} no encontrada`);

    const seats = data.seat_numbers.map((seat_number) => ({
      row_id: data.row_id,
      seat_number,
    }));

    return seatRepo.createMany(seats);
  }

  /**
   * Sillas de una fila — roles internos
   */
  async getSeatsByRow(row_id: number) {
    const row = await rowRepo.findById(row_id);
    if (!row) throw new Error(`Fila con ID ${row_id} no encontrada`);
    return seatRepo.findAll(row_id);
  }

  /**
   * Todas las sillas de un lugar con filtro opcional de status — PAYPAC y ORGANIZER
   */
  async getSeatsByPlace(place_id: number, filters?: { status?: SeatStatus }) {
    return seatRepo.findAllByPlace(place_id, filters);
  }

  /**
   * Silla por ID con jerarquía completa — roles internos
   */
  async getSeatById(id: number) {
    const seat = await seatRepo.findById(id);
    if (!seat) throw new Error('Silla no encontrada');
    return seat;
  }

  /**
   * Cambiar estado permanente (ACTIVE / BLOCKED_MAINTENANCE) — solo PAYPAC
   */
  async updateSeatStatus(id: number, status: SeatStatus, userRole: string) {
    if (userRole !== 'PAYPAC')
      throw new Error('Solo PAYPAC puede cambiar el estado permanente de sillas');

    const seat = await seatRepo.findById(id);
    if (!seat) throw new Error('Silla no encontrada');

    return seatRepo.updateStatus(id, status);
  }

  /**
   * Eliminar silla — solo PAYPAC
   */
  async deleteSeat(id: number, userRole: string) {
    if (userRole !== 'PAYPAC') throw new Error('Solo PAYPAC puede eliminar sillas');

    const seat = await seatRepo.findById(id);
    if (!seat) throw new Error('Silla no encontrada');

    return seatRepo.delete(id);
  }
}