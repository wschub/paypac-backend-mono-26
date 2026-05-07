import { Request, Response, NextFunction } from 'express';
import { WEB_API_KEY } from '../config/constants';

export const authenticatePublicWeb = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey =
    req.headers['x-web-api-key'] as string ||
    req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey || apiKey !== WEB_API_KEY) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing web API key'
    });
    return;
  }

  next();
};
