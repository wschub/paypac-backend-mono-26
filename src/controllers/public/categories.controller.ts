import { Request, Response } from 'express';
import { CategoryService } from '../../services/category.service';

const categoryService = new CategoryService();

export const getPublicCategories = async (req: Request, res: Response) => {
  try {
    const filters = req.query as any;
    const result = await categoryService.getPublicCategories(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicCategories:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch categories' });
  }
};

export const getPublicCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const publicUrl = req.params.publicUrl as string;
    const category = await categoryService.getPublicCategoryBySlug(publicUrl);
    if (!category) {
      return res.status(404).json({ error: 'Not found', message: 'Categoría no encontrada' });
    }
    res.status(200).json({ data: category });
  } catch (error) {
    console.error('Error in getPublicCategoryBySlug:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch category' });
  }
};
