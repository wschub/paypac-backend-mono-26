import { Request, Response } from 'express';
import { CityService } from '../../services/city.service';

const cityService = new CityService();

export const getPublicCities = async (req: Request, res: Response) => {
  try {
    const { country_id } = req.query;
    const result = await cityService.getPublicCities(
      country_id ? Number(country_id) : undefined
    );
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicCities:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch cities' });
  }
};
