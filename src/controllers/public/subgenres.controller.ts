import { Request, Response } from 'express';
import { SubgenreService } from '../../services/subgenre.service';

const subgenreService = new SubgenreService();

export const getPublicSubgenres = async (req: Request, res: Response) => {
  try {
    const filters = req.query as any;
    const result = await subgenreService.getPublicSubgenres(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicSubgenres:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch subgenres' });
  }
};
