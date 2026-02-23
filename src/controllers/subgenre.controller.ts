import { Request, Response } from 'express';
import { SubgenreService } from '../services/subgenre.service';

const subgenreService = new SubgenreService();

/**
 * POST /api/subgenres
 * Crear un nuevo subgénero
 * Requiere: PAYPAC
 */
export const createSubgenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subcategory_name, subcategory_id } = req.body;
    const userRole = req.user?.role || '';

    const result = await subgenreService.createSubgenre(
      { subcategory_name, subcategory_id },
      userRole
    );

    res.status(201).json({
      message: 'Subgénero creado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/subgenres
 * Listar subgéneros con filtros opcionales
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string
 * - subcategory_id: number
 * - category_id: number
 * - country_id: number
 */
export const getSubgenres = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, subcategory_id, category_id, country_id } = req.query;

    const result = await subgenreService.getSubgenres({
      search: search as string | undefined,
      subcategory_id: subcategory_id ? Number(subcategory_id) : undefined,
      category_id: category_id ? Number(category_id) : undefined,
      country_id: country_id ? Number(country_id) : undefined,
    });

    res.status(200).json({
      message: 'Subgéneros obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/subgenres/stats
 * Estadísticas de subgéneros
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - subcategory_id: number
 * - category_id: number
 * - country_id: number
 */
export const getSubgenresStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { subcategory_id, category_id, country_id } = req.query;

    const result = await subgenreService.getSubgenresStats(userRole, {
      subcategory_id: subcategory_id ? Number(subcategory_id) : undefined,
      category_id: category_id ? Number(category_id) : undefined,
      country_id: country_id ? Number(country_id) : undefined,
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
 * GET /api/subgenres/by-subcategory/:subcategory_id
 * Subgéneros de una subcategoría específica
 * Acceso: todos los roles autenticados
 */
export const getSubgenresBySubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subcategory_id } = req.params;

    const result = await subgenreService.getSubgenresBySubCategory(Number(subcategory_id));

    res.status(200).json({
      message: 'Subgéneros de la subcategoría obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/subgenres/:id
 * Obtener subgénero por ID
 * Acceso: todos los roles autenticados
 */
export const getSubgenreById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await subgenreService.getSubgenreById(Number(id));

    res.status(200).json({
      message: 'Subgénero obtenido exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/subgenres/:id
 * Actualizar subgénero
 * Requiere: PAYPAC
 */
export const updateSubgenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { subcategory_name, subcategory_id } = req.body;
    const userRole = req.user?.role || '';

    const result = await subgenreService.updateSubgenre(
      Number(id),
      { subcategory_name, subcategory_id },
      userRole
    );

    res.status(200).json({
      message: 'Subgénero actualizado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/subgenres/:id
 * Eliminar subgénero (solo si no tiene eventos asociados)
 * Requiere: PAYPAC
 */
export const deleteSubgenre = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await subgenreService.deleteSubgenre(Number(id), userRole);

    res.status(200).json({
      message: 'Subgénero eliminado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};