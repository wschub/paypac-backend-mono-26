import { Request, Response } from 'express';
import { LocalityService } from '../../services/locality.service';

const localityService = new LocalityService();

export const getPublicLocalities = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const result = await localityService.getPublicLocalitiesByEvent(Number(eventId));
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getPublicLocalities:', error);
    res.status(404).json({ error: 'Not Found', message: 'Event not found or no active localities' });
  }
};
