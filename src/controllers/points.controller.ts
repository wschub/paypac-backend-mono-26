import { Request, Response } from 'express';
import { PointsService } from '../services/points.service';

const pointsService = new PointsService();

export class PointsController {

  async getBalance(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const balance = await pointsService.getBalance(userId);
      res.status(200).json({ balance });
    } catch (error: any) {
      console.error('Error in getBalance:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch points balance' });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20;
      const type = req.query.type as string | undefined;

      const result = await pointsService.getHistory(userId, page, limit, type);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getHistory:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch points history' });
    }
  }

  async transferPoints(req: Request, res: Response) {
    try {
      const fromUserId = req.user!.id;
      const { to_user_id, points, description } = req.body;

      const result = await pointsService.transferPoints(fromUserId, to_user_id, points, description);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in transferPoints:', error);

      if (
        error.message.includes('No puedes transferir') ||
        error.message.includes('Saldo insuficiente') ||
        error.message.includes('cantidad de puntos')
      ) {
        return res.status(400).json({ error: 'Bad request', message: error.message });
      }

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ error: 'Not found', message: error.message });
      }

      res.status(500).json({ error: 'Internal server error', message: 'Failed to transfer points' });
    }
  }

  async getExpiringPoints(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await pointsService.getExpiringPoints(userId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in getExpiringPoints:', error);
      res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch expiring points' });
    }
  }
}
