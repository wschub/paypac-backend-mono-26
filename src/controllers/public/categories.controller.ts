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
