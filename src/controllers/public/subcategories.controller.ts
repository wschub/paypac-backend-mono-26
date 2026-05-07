import { Request, Response } from 'express';
import { SubCategoryService } from '../../services/subcategory.service';

const subcategoryService = new SubCategoryService();

export const getPublicSubcategories = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const result = await subcategoryService.getPublicSubcategories(Number(categoryId));
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicSubcategories:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch subcategories' });
  }
};
