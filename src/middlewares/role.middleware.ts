import { Request, Response, NextFunction } from 'express';


export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ message: 'Acceso denegado: rol no autorizado' });
      return; // 👈 Agrega return para cortar el flujo correctamente
    }

    next();
  };
};