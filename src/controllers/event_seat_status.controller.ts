import { Request, Response } from 'express';
import { EventSeatStatusService } from '../services/event_seat_status.service';

const seatStatusService = new EventSeatStatusService();

/**
 * POST /api/venues/seat-status/initialize
 * Inicializar todos los estados de sillas al aprobar un evento numerado
 * Acceso: PAYPAC y ORGANIZER
 */
export const initializeSeatMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { place_id, event_id } = req.body;
    const result = await seatStatusService.initializeForEvent(place_id, event_id, userRole);
    res.status(201).json({ message: 'Mapa de sillas inicializado exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/venues/seat-status/:event_id/map
 * Mapa { seat_id: status } para el mapa interactivo
 * Acceso: todos los roles
 */
export const getSeatMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await seatStatusService.getSeatMap(Number(req.params.event_id));
    res.status(200).json({ message: 'Mapa de sillas obtenido', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/venues/seat-status/:event_id/counts
 * Conteo de sillas por estado — PAYPAC y ORGANIZER
 */
export const getSeatCountsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await seatStatusService.getSeatCountsByStatus(Number(req.params.event_id));
    res.status(200).json({ message: 'Conteos por estado obtenidos', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/venues/seat-status/hold
 * Reservar silla en carrito por 10 minutos
 * Acceso: todos los roles
 */
export const holdSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { seat_id, event_id } = req.body;
    const result = await seatStatusService.holdSeat(seat_id, event_id);
    res.status(200).json({ message: 'Silla reservada en carrito por 10 minutos', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/venues/seat-status/release
 * Liberar silla del carrito manualmente
 * Acceso: todos los roles
 */
export const releaseSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { seat_id, event_id } = req.body;
    const result = await seatStatusService.releaseSeat(seat_id, event_id);
    res.status(200).json({ message: 'Silla liberada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/venues/seat-status/block
 * Bloquear silla para un evento (cortesía, prensa, producción)
 * Acceso: PAYPAC y ORGANIZER
 */
export const blockSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { seat_id, event_id } = req.body;
    const result = await seatStatusService.blockSeat(seat_id, event_id, userRole);
    res.status(200).json({ message: 'Silla bloqueada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/venues/seat-status/:event_id/release-expired
 * Liberar todos los HELD expirados de un evento
 * Acceso: solo PAYPAC (o job interno)
 */
export const releaseExpiredHolds = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await seatStatusService.releaseExpiredHolds(Number(req.params.event_id));
    res.status(200).json({ message: 'Holds expirados liberados exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};