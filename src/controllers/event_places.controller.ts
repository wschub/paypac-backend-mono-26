import { Request, Response } from 'express';
import { EventPlacesService } from '../services/event_places.service';

const placesService = new EventPlacesService();

/**
 * POST /api/venues
 * Crear un lugar nuevo — solo PAYPAC
 */
export const createPlace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await placesService.createPlace(req.body, userRole);
    res.status(201).json({ message: 'Lugar creado exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/venues
 * Listar lugares con filtros opcionales
 */
export const getPlaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, type_place, place_type } = req.query;
    const result = await placesService.getPlaces({
      search:     search     as string | undefined,
      type_place: type_place as any,
      place_type: place_type as any,
    });
    res.status(200).json({ message: 'Lugares obtenidos exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/venues/:id
 * Lugar por ID con zonas y conteos
 */
export const getPlaceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await placesService.getPlaceById(Number(req.params.id));
    res.status(200).json({ message: 'Lugar obtenido exitosamente', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/venues/:id/layout
 * Layout completo: zones → rows → seats
 */
export const getPlaceWithFullLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await placesService.getPlaceWithFullLayout(Number(req.params.id));
    res.status(200).json({ message: 'Layout completo obtenido', data: result });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/venues/:id
 * Actualizar lugar — solo PAYPAC
 */
export const updatePlace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await placesService.updatePlace(Number(req.params.id), req.body, userRole);
    res.status(200).json({ message: 'Lugar actualizado exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * PATCH /api/venues/:id/map
 * Actualizar solo el JSON del mapa interactivo — solo PAYPAC
 */
export const updatePlaceMap = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await placesService.updateMap(
      Number(req.params.id),
      req.body.map_place,
      userRole
    );
    res.status(200).json({ message: 'Mapa actualizado exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/venues/:id
 * Eliminar lugar — solo PAYPAC (sin zonas ni eventos)
 */
export const deletePlace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await placesService.deletePlace(Number(req.params.id), userRole);
    res.status(200).json({ message: 'Lugar eliminado exitosamente', data: result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};