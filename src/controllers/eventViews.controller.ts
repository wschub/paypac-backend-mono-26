import { Request, Response } from 'express';
import { EventViewService } from '../services/eventView.service';

const eventViewService = new EventViewService();

export const markEventViewConversion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { session_token } = req.body;
    const result = await eventViewService.markConversion(Number(id), session_token);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in markEventViewConversion:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to mark conversion' });
  }
};
