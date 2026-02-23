import { Request, Response } from 'express';
import { StatesService } from '../services/states.service';

const statesService = new StatesService();

/**
 * POST /api/states
 * Crear un nuevo estado
 * Requiere: PAYPAC
 */
export const createState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name_state, country_id } = req.body;
    const userRole = req.user?.role || '';

    const result = await statesService.createState({ name_state, country_id }, userRole);

    res.status(201).json({
      message: 'Estado creado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/states
 * Listar todos los estados
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string (buscar por nombre)
 * - country_id: number (filtrar por país)
 */
export const getStates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, country_id } = req.query;

    const filters = {
      search: search as string | undefined,
      country_id: country_id ? Number(country_id) : undefined,
    };

    const result = await statesService.getStates(filters);

    res.status(200).json({
      message: 'Estados obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/states/stats
 * Estadísticas de estados
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - country_id: number (filtrar stats por país)
 */
export const getStatesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { country_id } = req.query;

    const result = await statesService.getStatesStats(
      userRole,
      country_id ? Number(country_id) : undefined
    );

    res.status(200).json({
      message: 'Estadísticas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/states/by-country/:country_id
 * Obtener estados de un país con sus ciudades
 * Acceso: todos los roles autenticados
 */
export const getStatesByCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { country_id } = req.params;

    const result = await statesService.getStatesByCountry(Number(country_id));

    res.status(200).json({
      message: 'Estados del país obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/states/:id
 * Obtener estado por ID con ciudades incluidas
 * Acceso: todos los roles autenticados
 */
export const getStateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await statesService.getStateById(Number(id));

    res.status(200).json({
      message: 'Estado obtenido exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/states/:id
 * Actualizar estado
 * Requiere: PAYPAC
 */
export const updateState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name_state, country_id } = req.body;
    const userRole = req.user?.role || '';

    const result = await statesService.updateState(
      Number(id),
      { name_state, country_id },
      userRole
    );

    res.status(200).json({
      message: 'Estado actualizado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/states/:id
 * Eliminar estado (solo si no tiene ciudades asociadas)
 * Requiere: PAYPAC
 */
export const deleteState = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await statesService.deleteState(Number(id), userRole);

    res.status(200).json({
      message: 'Estado eliminado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};