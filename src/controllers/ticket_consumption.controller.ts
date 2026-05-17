import { Request, Response } from 'express';
import { TicketConsumptionService } from '../services/ticket_consumption.service';

const service = new TicketConsumptionService();

export const registerConsumption = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params['id'] as string);
    const user     = (req as any).user;
    const { amount, description } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Bad request', message: 'El campo amount debe ser un número positivo' });
      return;
    }

    const result = await service.registerConsumption(ticketId, amount, description, user.id);
    res.status(201).json(result);
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const getConsumptionHistory = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params['id'] as string);
    const user     = (req as any).user;
    const result   = await service.getHistory(ticketId, user.id, user.role);
    res.status(200).json(result);
  } catch (error: any) {
    _handleError(res, error);
  }
};

function _handleError(res: Response, error: any) {
  const msg: string = error.message ?? '';
  if (msg.includes('no encontrad')) return res.status(404).json({ error: 'Not found', message: msg });
  if (msg.includes('permiso'))      return res.status(403).json({ error: 'Forbidden', message: msg });
  if (msg.includes('insuficiente') || msg.includes('no es de tipo')) {
    return res.status(409).json({ error: 'Conflict', message: msg });
  }
  res.status(400).json({ error: 'Bad request', message: msg });
}
