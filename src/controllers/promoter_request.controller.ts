import { Request, Response } from 'express';
import { PromoterRequestService } from '../services/promoter_request.service';

const service = new PromoterRequestService();

export const applyToBePromoter = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { motivation } = req.body;
    const request = await service.apply(userId, motivation);
    res.status(201).json({ request });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const getMyRequest = async (req: Request, res: Response) => {
  try {
    const userId  = (req as any).user.id;
    const request = await service.getMyRequest(userId);
    res.status(200).json({ request });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const status   = req.query.status as string | undefined;
    const requests = await service.getAll(status);
    res.status(200).json({ requests });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const approveRequest = async (req: Request, res: Response) => {
  try {
    const requestId  = parseInt(req.params['id'] as string);
    const reviewerId = (req as any).user.id;
    const request    = await service.approve(requestId, reviewerId);
    res.status(200).json({ request });
  } catch (error: any) {
    _handleError(res, error);
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const requestId       = parseInt(req.params['id'] as string);
    const reviewerId      = (req as any).user.id;
    const { rejection_reason } = req.body;
    const request         = await service.reject(requestId, reviewerId, rejection_reason);
    res.status(200).json({ request });
  } catch (error: any) {
    _handleError(res, error);
  }
};

function _handleError(res: Response, error: any) {
  const msg: string = error.message ?? '';
  if (msg.includes('no encontrad')) return res.status(404).json({ error: 'Not found', message: msg });
  if (msg.includes('Ya eres') || msg.includes('Ya tienes') || msg.includes('ya fue')) {
    return res.status(409).json({ error: 'Conflict', message: msg });
  }
  res.status(400).json({ error: 'Bad request', message: msg });
}
