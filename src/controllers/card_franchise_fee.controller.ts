import { Request, Response } from 'express';
import { CardFranchiseFeeService } from '../services/card_franchise_fee.service';

const franchiseFeeService = new CardFranchiseFeeService();

/**
 * POST /api/card-franchise-fees
 * Crear una comisión por franquicia
 * Requiere: PAYPAC
 */
export const createFranchiseFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { franchise, commission_pct, commission_amount, is_active } = req.body;
    const userRole = req.user?.role || '';

    const result = await franchiseFeeService.createFranchiseFee(
      { franchise, commission_pct, commission_amount, is_active },
      userRole
    );

    res.status(201).json({
      message: 'Comisión por franquicia creada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/card-franchise-fees
 * Listar todas las comisiones por franquicia
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - is_active: "true" | "false"
 */
export const getFranchiseFees = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { is_active } = req.query;

    const filters =
      is_active !== undefined ? { is_active: is_active === 'true' } : undefined;

    const result = await franchiseFeeService.getFranchiseFees(userRole, filters);

    res.status(200).json({
      message: 'Comisiones por franquicia obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/card-franchise-fees/:id
 * Obtener comisión por franquicia por ID
 * Requiere: PAYPAC
 */
export const getFranchiseFeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const { id } = req.params;

    const result = await franchiseFeeService.getFranchiseFeeById(Number(id), userRole);

    res.status(200).json({
      message: 'Comisión por franquicia obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/card-franchise-fees/:id
 * Actualizar comisión por franquicia
 * Requiere: PAYPAC
 */
export const updateFranchiseFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { franchise, commission_pct, commission_amount, is_active } = req.body;
    const userRole = req.user?.role || '';

    const result = await franchiseFeeService.updateFranchiseFee(
      Number(id),
      { franchise, commission_pct, commission_amount, is_active },
      userRole
    );

    res.status(200).json({
      message: 'Comisión por franquicia actualizada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/card-franchise-fees/:id
 * Eliminar comisión por franquicia
 * Requiere: PAYPAC
 */
export const deleteFranchiseFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await franchiseFeeService.deleteFranchiseFee(Number(id), userRole);

    res.status(200).json({
      message: 'Comisión por franquicia eliminada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
