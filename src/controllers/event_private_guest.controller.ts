import { Request, Response } from 'express';
import { EventPrivateGuestService } from '../services/event_private_guest.service';

const guestService = new EventPrivateGuestService();

export const inviteGuest = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params['eventId'] as string);
    const user    = (req as any).user;
    const guest   = await guestService.inviteGuest(eventId, user.id, user.role, req.body);
    res.status(201).json({ guest });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const getGuests = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params['eventId'] as string);
    const user    = (req as any).user;
    const guests  = await guestService.getGuests(eventId, user.id, user.role);
    res.status(200).json({ guests });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const confirmGuest = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params['eventId'] as string);
    const guestId = parseInt(req.params['guestId'] as string);
    const user    = (req as any).user;
    const guest   = await guestService.confirmGuest(eventId, guestId, user.id, user.role);
    res.status(200).json({ guest });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const rejectGuest = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params['eventId'] as string);
    const guestId = parseInt(req.params['guestId'] as string);
    const user    = (req as any).user;
    const guest   = await guestService.rejectGuest(eventId, guestId, user.id, user.role);
    res.status(200).json({ guest });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const removeGuest = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params['eventId'] as string);
    const guestId = parseInt(req.params['guestId'] as string);
    const user    = (req as any).user;
    const result  = await guestService.removeGuest(eventId, guestId, user.id, user.role);
    res.status(200).json(result);
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const bulkInviteGuests = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params['eventId'] as string);
    const user    = (req as any).user;
    const { guests } = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
      res.status(400).json({ error: 'Bad request', message: 'El campo guests debe ser un array no vacío' });
      return;
    }

    const result = await guestService.bulkInviteGuests(eventId, user.id, user.role, guests);
    res.status(200).json(result);
  } catch (error: any) {
    _handleError(res, error);
  }
};

function _handleError(res: Response, error: any) {
  const msg: string = error.message ?? '';
  if (msg.includes('no encontrad')) return res.status(404).json({ error: 'Not found', message: msg });
  if (msg.includes('permiso') || msg.includes('Solo el')) {
    return res.status(403).json({ error: 'Forbidden', message: msg });
  }
  if (msg.includes('ya está')) return res.status(409).json({ error: 'Conflict', message: msg });
  res.status(400).json({ error: 'Bad request', message: msg });
}
