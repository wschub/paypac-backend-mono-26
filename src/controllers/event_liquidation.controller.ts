import { Request, Response } from 'express';
import { EventLiquidationService } from '../services/event_liquidation.service';
import { EventLiquidationStatus } from '@prisma/client';

const liquidationService = new EventLiquidationService();

export const createLiquidation = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await liquidationService.createLiquidation(req.body, req.user!.role);
    res.status(201).json({ message: 'Liquidación creada exitosamente', liquidation: result });
  } catch (err: any) {
    const status = err.message.includes('Solo PAYPAC') ? 403
                 : err.message.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const getLiquidations = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { status, event_id, from, to } = req.query;

    const filters: any = {
      status:     status   as EventLiquidationStatus | undefined,
      event_id:   event_id ? Number(event_id) : undefined,
      from:       from     ? new Date(from as string) : undefined,
      to:         to       ? new Date(to as string)   : undefined,
    };

    // ORGANIZER solo ve las suyas
    if (user.role === 'ORGANIZER') filters.company_id = user.company_id;

    const liquidations = await liquidationService.getLiquidations(filters, user.role, user.id);
    res.status(200).json({ total: liquidations.length, liquidations });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getLiquidationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const result = await liquidationService.getLiquidationById(
      Number(req.params.id), user.role, user.company_id ?? undefined
    );
    res.status(200).json(result);
  } catch (err: any) {
    const status = err.message.includes('no encontrada') ? 404
                 : err.message.includes('permisos') ? 403 : 500;
    res.status(status).json({ message: err.message });
  }
};

export const updateLiquidationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await liquidationService.updateStatus(
      Number(req.params.id), req.body.status, req.user!.role
    );
    res.status(200).json({ message: 'Estado actualizado exitosamente', liquidation: result });
  } catch (err: any) {
    const status = err.message.includes('Solo PAYPAC') ? 403
                 : err.message.includes('no encontrada') ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};

export const getMyBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { from, to } = req.query;
    const result = await liquidationService.getMyBalance(
      user.company_id!,
      from ? new Date(from as string) : undefined,
      to   ? new Date(to   as string) : undefined,
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteLiquidation = async (req: Request, res: Response): Promise<void> => {
  try {
    await liquidationService.deleteLiquidation(Number(req.params.id), req.user!.role);
    res.status(200).json({ message: 'Liquidación eliminada exitosamente' });
  } catch (err: any) {
    const status = err.message.includes('Solo PAYPAC') ? 403
                 : err.message.includes('no encontrada') ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};