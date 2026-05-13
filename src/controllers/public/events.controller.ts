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

export const getPublicEventBySlug = async (req: Request, res: Response) => {
  try {
    const publicUrl = req.params.publicUrl as string;
    const event = await eventService.getEventByPublicUrl(publicUrl);

    if (
      !event ||
      !['APPROVED', 'ACTIVE'].includes(event.status) ||
      event.event_type !== 'PUBLICO'
    ) {
      return res.status(404).json({ error: 'Not found', message: 'Evento no encontrado' });
    }

    res.status(200).json({ event });
  } catch (error) {
    console.error('Error in getPublicEventBySlug:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch event' });
  }
};

export const getFeaturedEvents = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 50) : 10;
    const events = await eventService.getFeaturedEvents(limit);
    res.status(200).json({ events });
  } catch (error) {
    console.error('Error in getFeaturedEvents:', error);
    res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch featured events' });
  }
};
