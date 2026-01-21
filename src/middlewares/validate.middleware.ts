import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError, ZodObject, ZodRawShape } from 'zod';

/**
 * Middleware genérico de validación para Zod v4.
 * Permite validar body, params y query.
 */
export const validateRequest = (schema: ZodType<any> | ZodObject<ZodRawShape>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

    

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Error de validación',
          issues: error.issues, // ✅ Cambiado de `errors` → `issues`
        });
      }

      return res.status(400).json({
        message: 'Error desconocido en validación',
        error: error instanceof Error ? error.message : error,
      });
    }
  };
};



