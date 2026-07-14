import { Request, Response } from 'express';
import { PaymentMethodsUIService } from '../services/paymentmethodsui.service';

const paymentMethodsUIService = new PaymentMethodsUIService();

/**
 * POST /api/payment-methods
 * Crear un nuevo método de pago
 * Requiere: PAYPAC
 */
export const createPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { method_name, mehtod_img, method_code, method_status, commission_pct, commission_amount } = req.body;
    const userRole = req.user?.role || '';

    const result = await paymentMethodsUIService.createPaymentMethod(
      { method_name, mehtod_img, method_code, method_status, commission_pct, commission_amount },
      userRole
    );

    res.status(201).json({
      message: 'Método de pago creado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/payment-methods
 * Listar todos los métodos de pago
 * Acceso: Todos los roles autenticados
 * Query params opcionales:
 * - method_status: 0 (inactivos) | 1 (activos)
 */
export const getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const { method_status } = req.query;

    const filters = method_status !== undefined
      ? { method_status: Number(method_status) }
      : undefined;

    const result = await paymentMethodsUIService.getPaymentMethods(filters);

    res.status(200).json({
      message: 'Métodos de pago obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/payment-methods/active
 * Listar solo métodos de pago activos
 * Acceso: Todos los roles autenticados
 * Este endpoint lo usa el frontend en el proceso de compra
 */
export const getActivePaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await paymentMethodsUIService.getActivePaymentMethods();

    res.status(200).json({
      message: 'Métodos de pago activos obtenidos exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/payment-methods/stats
 * Obtener estadísticas de métodos de pago
 * Requiere: PAYPAC
 */
export const getPaymentMethodsStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role || '';
    const result = await paymentMethodsUIService.getPaymentMethodsStats(userRole);

    res.status(200).json({
      message: 'Estadísticas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/payment-methods/:id
 * Obtener un método de pago específico por ID
 * Acceso: Todos los roles autenticados
 */
export const getPaymentMethodById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await paymentMethodsUIService.getPaymentMethodById(Number(id));

    res.status(200).json({
      message: 'Método de pago obtenido exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * PUT /api/payment-methods/:id
 * Actualizar un método de pago completo
 * Requiere: PAYPAC
 */
export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { method_name, mehtod_img, method_code, method_status, commission_pct, commission_amount } = req.body;
    const userRole = req.user?.role || '';

    const result = await paymentMethodsUIService.updatePaymentMethod(
      Number(id),
      { method_name, mehtod_img, method_code, method_status, commission_pct, commission_amount },
      userRole
    );

    res.status(200).json({
      message: 'Método de pago actualizado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * PATCH /api/payment-methods/:id/status
 * Actualizar solo el status del método de pago
 * Requiere: PAYPAC
 */
export const updatePaymentMethodStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { method_status } = req.body;
    const userRole = req.user?.role || '';

    const result = await paymentMethodsUIService.updatePaymentMethodStatus(
      Number(id),
      method_status,
      userRole
    );

    res.status(200).json({
      message: 'Status actualizado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/payment-methods/:id
 * Eliminar un método de pago
 * Requiere: PAYPAC
 */
export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role || '';

    const result = await paymentMethodsUIService.deletePaymentMethod(Number(id), userRole);

    res.status(200).json({
      message: 'Método de pago eliminado exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};