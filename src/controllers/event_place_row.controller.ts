import { Request, Response } from 'express';
import { EventPlaceRowService } from '../services/event_place_row.service';

const rowService = new EventPlaceRowService();

/**
 * POST /api/venues/rows
 * Crear fila dentro de una zona — solo PAYPAC
 */
export const createRow = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await rowService.createRow(req.body, userRole);
    res.status(201).json({ message: 'Fila creada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/venues/zones/:zone_id/rows
 * Filas de una zona con conteo de sillas
 */
export const getRowsByZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await rowService.getRowsByZone(Number(req.params.zone_id));
    res.status(200).json({ message: 'Filas obtenidas exitosamente', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/venues/rows/:id
 * Fila por ID con sillas incluidas
 */
export const getRowById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await rowService.getRowById(Number(req.params.id));
    res.status(200).json({ message: 'Fila obtenida exitosamente', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/venues/rows/:id
 * Actualizar fila — solo PAYPAC
 */
export const updateRow = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await rowService.updateRow(Number(req.params.id), req.body, userRole);
    res.status(200).json({ message: 'Fila actualizada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/venues/rows/:id
 * Eliminar fila — solo PAYPAC (sin sillas)
 */
export const deleteRow = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await rowService.deleteRow(Number(req.params.id), userRole);
    res.status(200).json({ message: 'Fila eliminada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};