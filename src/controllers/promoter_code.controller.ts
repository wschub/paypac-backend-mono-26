import { Request, Response } from 'express';
import { PromoterCodeService } from '../services/promoter_code.service';
import {paramToString } from '../utils/utils'
const promoCodeService = new PromoterCodeService();

export const createMyCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { custom_code } = req.body;
    const result = await promoCodeService.createCode(user.id, user.role, user.id, custom_code);
    res.status(201).json({ message: 'Código creado exitosamente', promoter_code: result });
  } catch (err: any) {
    const status = err.message.includes('permisos') ? 403
                 : err.message.includes('ya tiene') || err.message.includes('en uso') ? 409 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const getMyCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await promoCodeService.getMyCode(req.user!.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const getMyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await promoCodeService.getMyStats(req.user!.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const validateCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const  { code } = req.params;
     
    const codeString = paramToString(code)

    const result = await promoCodeService.validateCode(codeString);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const getAllCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const is_active = req.query.is_active !== undefined
      ? req.query.is_active === 'true'
      : undefined;
    const result = await promoCodeService.getAllCodes({ is_active }, req.user!.role);
    res.status(200).json({ total: result.length, codes: result });
  } catch (err: any) {
    res.status(403).json({ message: err.message });
  }
};

export const toggleActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await promoCodeService.toggleActive(Number(req.params.id), req.user!.role);
    res.status(200).json({ message: `Código ${result.is_active ? 'activado' : 'desactivado'}`, code: result });
  } catch (err: any) {
    const status = err.message.includes('Solo PAYPAC') ? 403
                 : err.message.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const deleteCode = async (req: Request, res: Response): Promise<void> => {
  try {
    await promoCodeService.deleteCode(Number(req.params.id), req.user!.role);
    res.status(200).json({ message: 'Código eliminado exitosamente' });
  } catch (err: any) {
    const status = err.message.includes('Solo PAYPAC') ? 403
                 : err.message.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};