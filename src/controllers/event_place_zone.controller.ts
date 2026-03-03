import { Request, Response } from 'express';
import { EventPlaceZoneService } from '../services/event_place_zone.service';

const zoneService = new EventPlaceZoneService();

/**
 * POST /api/venues/zones
 * Crear zona dentro de un lugar — solo PAYPAC
 */
export const createZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await zoneService.createZone(req.body, userRole);
    res.status(201).json({ message: 'Zona creada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/venues/:place_id/zones
 * Zonas de un lugar
 */
export const getZonesByPlace = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await zoneService.getZonesByPlace(Number(req.params.place_id));
    res.status(200).json({ message: 'Zonas obtenidas exitosamente', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/venues/zones/:id
 * Zona por ID con filas y conteos
 */
export const getZoneById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await zoneService.getZoneById(Number(req.params.id));
    res.status(200).json({ message: 'Zona obtenida exitosamente', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/venues/zones/:id
 * Actualizar zona — solo PAYPAC
 */
export const updateZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await zoneService.updateZone(Number(req.params.id), req.body, userRole);
    res.status(200).json({ message: 'Zona actualizada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/venues/zones/:id
 * Eliminar zona — solo PAYPAC (sin filas)
 */
export const deleteZone = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await zoneService.deleteZone(Number(req.params.id), userRole);
    res.status(200).json({ message: 'Zona eliminada exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};