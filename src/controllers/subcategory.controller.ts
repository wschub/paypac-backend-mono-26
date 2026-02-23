import { Request, Response } from 'express';
import { SubCategoryService } from '../services/subcategory.service';

const subCategoryService = new SubCategoryService();

/**
 * POST /api/subcategories
 * Crear una nueva subcategoría
 * Requiere: PAYPAC
 */
export const createSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subcategory_name, category_id } = req.body;
    const userRole = req.user?.role || '';

    const result = await subCategoryService.createSubCategory(
      { subcategory_name, category_id },
      userRole
    );

    res.status(201).json({
      message: 'Subcategoría creada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/subcategories
 * Listar subcategorías con filtros opcionales
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string
 * - category_id: number
 * - country_id: number
 */
export const getSubCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category_id, country_id } = req.query;

    const result = await subCategoryService.getSubCategories({
      search: search as string | undefined,
      category_id: category_id ? Number(category_id) : undefined,
      country_id: country_id ? Number(country_id) : undefined,
    });

    res.status(200).json({
      message: 'Subcategorías obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/subcategories/stats
 * Estadísticas de subcategorías
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - category_id: number
 * - country_id: number
 */
export const getSubCategoriesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { category_id, country_id } = req.query;

    const result = await subCategoryService.getSubCategoriesStats(userRole, {
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
 * GET /api/subcategories/by-category/:category_id
 * Subcategorías de una categoría con sus subgéneros anidados
 * Acceso: todos los roles autenticados
 */
export const getSubCategoriesByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_id } = req.params;

    const result = await subCategoryService.getSubCategoriesByCategory(Number(category_id));

    res.status(200).json({
      message: 'Subcategorías de la categoría obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/subcategories/:id
 * Obtener subcategoría por ID con subgéneros
 * Acceso: todos los roles autenticados
 */
export const getSubCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await subCategoryService.getSubCategoryById(Number(id));

    res.status(200).json({
      message: 'Subcategoría obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/subcategories/:id
 * Actualizar subcategoría
 * Requiere: PAYPAC
 */
export const updateSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { subcategory_name, category_id } = req.body;
    const userRole = req.user?.role || '';

    const result = await subCategoryService.updateSubCategory(
      Number(id),
      { subcategory_name, category_id },
      userRole
    );

    res.status(200).json({
      message: 'Subcategoría actualizada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/subcategories/:id
 * Eliminar subcategoría (solo si no tiene subgéneros ni eventos)
 * Requiere: PAYPAC
 */
export const deleteSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await subCategoryService.deleteSubCategory(Number(id), userRole);

    res.status(200).json({
      message: 'Subcategoría eliminada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};