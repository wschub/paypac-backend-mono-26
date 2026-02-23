import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

const categoryService = new CategoryService();

/**
 * POST /api/categories
 * Crear una nueva categoría
 * Requiere: PAYPAC
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_name, category_icon, country_id } = req.body;
    const userRole = req.user?.role || '';

    const result = await categoryService.createCategory(
      { category_name, category_icon, country_id },
      userRole
    );

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/categories
 * Listar categorías con filtros opcionales
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string
 * - country_id: number
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, country_id } = req.query;

    const result = await categoryService.getCategories({
      search: search as string | undefined,
      country_id: country_id ? Number(country_id) : undefined,
    });

    res.status(200).json({
      message: 'Categorías obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/categories/stats
 * Estadísticas de categorías
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - country_id: number
 */
export const getCategoriesStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { country_id } = req.query;

    const result = await categoryService.getCategoriesStats(
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
 * GET /api/categories/by-country/:country_id
 * Categorías de un país con subcategorías y subgéneros anidados
 * Acceso: todos los roles autenticados
 */
export const getCategoriesByCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { country_id } = req.params;

    const result = await categoryService.getCategoriesByCountry(Number(country_id));

    res.status(200).json({
      message: 'Categorías del país obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * GET /api/categories/:id
 * Obtener categoría por ID con jerarquía completa (subcategorías → subgéneros)
 * Acceso: todos los roles autenticados
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await categoryService.getCategoryById(Number(id));

    res.status(200).json({
      message: 'Categoría obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/categories/:id
 * Actualizar categoría
 * Requiere: PAYPAC
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category_name, category_icon, country_id } = req.body;
    const userRole = req.user?.role || '';

    const result = await categoryService.updateCategory(
      Number(id),
      { category_name, category_icon, country_id },
      userRole
    );

    res.status(200).json({
      message: 'Categoría actualizada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/categories/:id
 * Eliminar categoría (solo si no tiene subcategorías ni eventos)
 * Requiere: PAYPAC
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await categoryService.deleteCategory(Number(id), userRole);

    res.status(200).json({
      message: 'Categoría eliminada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};