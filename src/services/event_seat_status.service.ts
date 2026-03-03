import { EventSeatStatusRepository } from '../repositories/event_seat_status.repository';
import { EventPlaceSeatRepository } from '../repositories/event_place_seat.repository';
import { SeatEventStatus } from '@prisma/client';

const seatStatusRepo = new EventSeatStatusRepository();
const seatRepo       = new EventPlaceSeatRepository();

const HOLD_MINUTES = 10;

export class EventSeatStatusService {
  /**
   * Inicializar todos los estados de sillas para un evento recién aprobado
   * Llamado al crear/aprobar un evento numerado — PAYPAC u ORGANIZER
   */
  async initializeForEvent(place_id: number, event_id: number, userRole: string) {
    if (!['PAYPAC', 'ORGANIZER'].includes(userRole))
      throw new Error('Sin permisos para inicializar el mapa de sillas');

    const seat_ids = await seatRepo.findActiveIdsByPlace(place_id);
    if (seat_ids.length === 0)
      throw new Error('El lugar no tiene sillas activas para inicializar');

    const result = await seatStatusRepo.initializeForEvent(seat_ids, event_id);
    return { initialized: result.count, event_id, place_id };
  }

  /**
   * Mapa simplificado { seat_id: status } para el mapa interactivo
   * Los HELD expirados se devuelven como AVAILABLE sin tocar la DB
   * Acceso: todos los roles
   */
  async getSeatMap(event_id: number) {
    return seatStatusRepo.findSeatMapByEvent(event_id);
  }

  /**
   * Detalle completo con jerarquía seat → row → zone
   * Acceso: PAYPAC y ORGANIZER
   */
  async getSeatsForEvent(event_id: number) {
    return seatStatusRepo.findByEvent(event_id);
  }

  /**
   * Reservar silla en carrito (HELD) — expira en HOLD_MINUTES
   * Acceso: todos los roles (CUSTOMER compra desde la app)
   */
  async holdSeat(seat_id: number, event_id: number) {
    const current = await seatStatusRepo.findBySeatAndEvent(seat_id, event_id);
    if (!current) throw new Error('Silla no encontrada para este evento');

    const now = new Date();

    if (
      current.status === 'HELD' &&
      current.held_until !== null &&
      current.held_until > now
    ) {
      throw new Error('La silla ya está reservada por otro usuario');
    }

    if (current.status === 'SOLD')    throw new Error('La silla ya fue vendida');
    if (current.status === 'BLOCKED') throw new Error('La silla está bloqueada para este evento');

    const held_until = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);
    return seatStatusRepo.updateStatus(seat_id, event_id, 'HELD', held_until);
  }

  /**
   * Confirmar venta de la silla — llamado desde el servicio de pagos/tickets
   * La silla debe estar en HELD antes de poder venderse
   */
  async sellSeat(seat_id: number, event_id: number) {
    const current = await seatStatusRepo.findBySeatAndEvent(seat_id, event_id);
    if (!current) throw new Error('Silla no encontrada para este evento');

    if (current.status === 'SOLD')
      throw new Error('La silla ya fue vendida');
    if (current.status === 'BLOCKED')
      throw new Error('La silla está bloqueada para este evento');
    if (current.status === 'AVAILABLE')
      throw new Error('La silla debe estar en HELD antes de confirmar la venta');

    return seatStatusRepo.updateStatus(seat_id, event_id, 'SOLD');
  }

  /**
   * Liberar silla del carrito manualmente
   * Acceso: todos los roles
   */
  async releaseSeat(seat_id: number, event_id: number) {
    const current = await seatStatusRepo.findBySeatAndEvent(seat_id, event_id);
    if (!current) throw new Error('Silla no encontrada para este evento');

    if (current.status === 'SOLD')
      throw new Error('No se puede liberar una silla ya vendida');

    return seatStatusRepo.updateStatus(seat_id, event_id, 'AVAILABLE');
  }

  /**
   * Bloquear silla para un evento (cortesía, prensa, producción)
   * Acceso: PAYPAC y ORGANIZER
   */
  async blockSeat(seat_id: number, event_id: number, userRole: string) {
    if (!['PAYPAC', 'ORGANIZER'].includes(userRole))
      throw new Error('Sin permisos para bloquear sillas');

    const current = await seatStatusRepo.findBySeatAndEvent(seat_id, event_id);
    if (!current) throw new Error('Silla no encontrada para este evento');

    if (current.status === 'SOLD')
      throw new Error('No se puede bloquear una silla ya vendida');

    return seatStatusRepo.updateStatus(seat_id, event_id, 'BLOCKED');
  }

  /**
   * Liberar todos los HELD expirados de un evento
   * Llamado desde job programado o manualmente por PAYPAC
   */
  async releaseExpiredHolds(event_id: number) {
    return seatStatusRepo.releaseExpiredHolds(event_id);
  }

  /**
   * Conteo de sillas por estado — PAYPAC y ORGANIZER
   */
  async getSeatCountsByStatus(event_id: number) {
    return seatStatusRepo.countByStatus(event_id);
  }
}