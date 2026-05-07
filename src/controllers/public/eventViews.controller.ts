import { Request, Response } from 'express';
import { EventViewService } from '../../services/eventView.service';

const eventViewService = new EventViewService();

export const createEventView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await eventViewService.createView(Number(id), data, req);
    const statusCode = result.message === 'View created' ? 201 : 200;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Error in createEventView:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to create view' });
  }
};

export const updateEventViewDuration = async (req: Request, res: Response) => {
  try {
    const { id, sessionToken } = req.params;
    const { duration } = req.body;
    const result = await eventViewService.updateDuration(Number(id), String(sessionToken), duration);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in updateEventViewDuration:', error);
    res.status(404).json({ error: 'Not Found', message: 'View not found' });
  }
};
