import { Request, Response } from 'express';
import { EventWaitingListService } from '../../services/event_waiting_list.service';

const service = new EventWaitingListService();

export const registerWaitingList = async (req: Request, res: Response) => {
  try {
    const entry = await service.register(req.body);
    res.status(201).json({ entry });
  } catch (error: any) {
    console.error('Error in registerWaitingList:', error);
    if (error.message.includes('ya está registrado')) {
      return res.status(409).json({ error: 'Conflict', message: error.message });
    }
    if (error.message.includes('no encontrad')) {
      return res.status(404).json({ error: 'Not found', message: error.message });
    }
    res.status(500).json({ error: 'Internal server error', message: 'Error al registrar en lista de espera' });
  }
};
