import { Request, Response } from 'express';
import { EventPlaceSeatService } from '../services/event_place_seat.service';

const seatService = new EventPlaceSeatService();

/**
 * POST /api/venues/seats
 * Crear silla individual — solo PAYPAC
 */
export const createSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await seatService.createSeat(req.body, userRole);
    res.status(201).json({ message: 'Silla creada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/venues/seats/bulk
 * Crear múltiples sillas de una fila — solo PAYPAC
 */
export const createBulkSeats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await seatService.createBulkSeats(req.body, userRole);
    res.status(201).json({
      message: `${result.count} silla(s) creada(s) exitosamente`,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/venues/rows/:row_id/seats
 * Sillas de una fila
 */
export const getSeatsByRow = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await seatService.getSeatsByRow(Number(req.params.row_id));
    res.status(200).json({ message: 'Sillas obtenidas exitosamente', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/venues/:place_id/seats
 * Todas las sillas de un lugar (?status= opcional)
 */
export const getSeatsByPlace = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await seatService.getSeatsByPlace(Number(req.params.place_id), {
      status: req.query.status as any,
    });
    res.status(200).json({ message: 'Sillas del lugar obtenidas exitosamente', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/venues/seats/:id
 * Silla por ID con jerarquía completa
 */
export const getSeatById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await seatService.getSeatById(Number(req.params.id));
    res.status(200).json({ message: 'Silla obtenida exitosamente', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PATCH /api/venues/seats/:id/status
 * Cambiar estado permanente: ACTIVE / BLOCKED_MAINTENANCE — solo PAYPAC
 */
export const updateSeatStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await seatService.updateSeatStatus(
      Number(req.params.id),
      req.body.status,
      userRole
    );
    res.status(200).json({ message: 'Estado de silla actualizado exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/venues/seats/:id
 * Eliminar silla — solo PAYPAC
 */
export const deleteSeat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await seatService.deleteSeat(Number(req.params.id), userRole);
    res.status(200).json({ message: 'Silla eliminada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};