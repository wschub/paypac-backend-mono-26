import { Request, Response } from 'express';
import { InterestsService } from '../services/interests.service';

const interestsService = new InterestsService();

export class InterestsController {

  async getMyInterests(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const interests = await interestsService.getMyInterests(userId);
      res.status(200).json({ interests });
    } catch (error: any) {
      console.error('Error in getMyInterests:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch interests' });
    }
  }

  async createInterest(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { category_id, subcategory_id, subgenre_id, interest_level } = req.body;

      const interest = await interestsService.createInterest(
        userId, category_id, subcategory_id, subgenre_id, interest_level
      );
      res.status(201).json({ interest });
    } catch (error: any) {
      console.error('Error in createInterest:', error);

      if (error.message.includes('Ya tienes este interés')) {
        return res.status(400).json({ error: 'Bad request', message: error.message });
      }
      if (error.message.includes('no encontrad')) {
        return res.status(404).json({ error: 'Not found', message: error.message });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to create interest' });
    }
  }

  async updateInterest(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const interestId = parseInt(req.params.id as string);
      const { interest_level } = req.body;

      const interest = await interestsService.updateInterest(userId, interestId, interest_level);
      res.status(200).json({ interest });
    } catch (error: any) {
      console.error('Error in updateInterest:', error);

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: 'Not found', message: error.message });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to update interest' });
    }
  }

  async deleteInterest(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const interestId = parseInt(req.params.id as string);

      await interestsService.deleteInterest(userId, interestId);
      res.status(200).json({ message: 'Interés eliminado exitosamente' });
    } catch (error: any) {
      console.error('Error in deleteInterest:', error);

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: 'Not found', message: error.message });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to delete interest' });
    }
  }
}
