import { Request, Response } from 'express';
import { EventService } from '../../services/event.service';

const eventService = new EventService();

export const getPublicEvents = async (req: Request, res: Response) => {
  try {
    const filters = req.query as any;
    const result = await eventService.getPublicEvents(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicEvents:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch events' });
  }
};

export const getPublicEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await eventService.getPublicEventById(Number(id));
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicEventById:', error);
    res.status(404).json({ error: 'Not Found', message: 'Event not found' });
  }
};
