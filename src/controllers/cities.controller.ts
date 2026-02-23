import { Request, Response } from 'express';
import { CitiesService } from '../services/cities.service';

const citiesService = new CitiesService();

/**
 * POST /api/cities
 * Crear una nueva ciudad
 * Requiere: PAYPAC
 */
export const createCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name_city, state_id, country_id, latitude, longitude } = req.body;
    const userRole = req.user?.role || '';

    const result = await citiesService.createCity(
      { name_city, state_id, country_id, latitude, longitude },
      userRole
    );

    res.status(201).json({
      message: 'Ciudad creada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/cities
 * Listar ciudades con filtros opcionales
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string
 * - country_id: number
 * - state_id: number
 */
export const getCities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, country_id, state_id } = req.query;

    const filters = {
      search: search as string | undefined,
      country_id: country_id ? Number(country_id) : undefined,
      state_id: state_id ? Number(state_id) : undefined,
    };

    const result = await citiesService.getCities(filters);

    res.status(200).json({
      message: 'Ciudades obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/cities/stats
 * Estadísticas de ciudades
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - country_id: number
 * - state_id: number
 */
export const getCitiesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { country_id, state_id } = req.query;

    const result = await citiesService.getCitiesStats(userRole, {
      country_id: country_id ? Number(country_id) : undefined,
      state_id: state_id ? Number(state_id) : undefined,
    });

    res.status(200).json({
      message: 'Estadísticas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/cities/by-country/:country_id
 * Obtener ciudades de un país directamente (sin pasar por estados)
 * Acceso: todos los roles autenticados
 */
export const getCitiesByCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { country_id } = req.params;

    const result = await citiesService.getCitiesByCountry(Number(country_id));

    res.status(200).json({
      message: 'Ciudades del país obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/cities/by-state/:state_id
 * Obtener ciudades de un estado específico
 * Acceso: todos los roles autenticados
 */
export const getCitiesByState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { state_id } = req.params;

    const result = await citiesService.getCitiesByState(Number(state_id));

    res.status(200).json({
      message: 'Ciudades del estado obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/cities/:id
 * Obtener ciudad por ID
 * Acceso: todos los roles autenticados
 */
export const getCityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await citiesService.getCityById(Number(id));

    res.status(200).json({
      message: 'Ciudad obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/cities/:id
 * Actualizar ciudad
 * Requiere: PAYPAC
 */
export const updateCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name_city, state_id, country_id, latitude, longitude } = req.body;
    const userRole = req.user?.role || '';

    const result = await citiesService.updateCity(
      Number(id),
      { name_city, state_id, country_id, latitude, longitude },
      userRole
    );

    res.status(200).json({
      message: 'Ciudad actualizada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/cities/:id
 * Eliminar ciudad
 * Requiere: PAYPAC
 */
export const deleteCity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await citiesService.deleteCity(Number(id), userRole);

    res.status(200).json({
      message: 'Ciudad eliminada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};