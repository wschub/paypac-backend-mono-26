import { Request, Response } from 'express';
import { EventDctoService } from '../services/eventdcto.service';

const dctoService = new EventDctoService();

/**
 * POST /api/events/:eventId/discounts
 * Crear un nuevo descuento para un evento
 */
export const createDiscount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const eventId = Number(req.params.eventId);
    const data = req.body;

    const discount = await dctoService.createDiscount(
      eventId,
      data,
      user.id,
      user.role
    );

    res.status(201).json({
      message: 'Descuento creado exitosamente',
      discount,
    });
  } catch (err: any) {
    console.error('❌ Error en createDiscount:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/discounts
 * Obtener todos los descuentos de un evento
 */
export const getDiscountsByEventId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventId = Number(req.params.eventId);
    const discounts = await dctoService.getDiscountsByEventId(eventId);

    res.status(200).json({
      total: discounts.length,
      discounts,
    });
  } catch (err: any) {
    console.error('❌ Error en getDiscountsByEventId:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * GET /api/discounts/:id
 * Obtener un descuento específico por ID
 */
export const getDiscountById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const discount = await dctoService.getDiscountById(id);

    res.status(200).json(discount);
  } catch (err: any) {
    console.error('❌ Error en getDiscountById:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * PUT /api/discounts/:id
 * Actualizar un descuento
 */
export const updateDiscount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const id = Number(req.params.id);
    const data = req.body;

    const updatedDiscount = await dctoService.updateDiscount(
      id,
      data,
      user.id,
      user.role
    );

    res.status(200).json({
      message: 'Descuento actualizado exitosamente',
      discount: updatedDiscount,
    });
  } catch (err: any) {
    console.error('❌ Error en updateDiscount:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/discounts/:id
 * Eliminar un descuento
 */
export const deleteDiscount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const id = Number(req.params.id);

    await dctoService.deleteDiscount(id, user.id, user.role);

    res.status(200).json({
      message: 'Descuento eliminado exitosamente',
    });
  } catch (err: any) {
    console.error('❌ Error en deleteDiscount:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * POST /api/discounts/validate
 * Validar un código de descuento
 * Endpoint público para que CUSTOMER pueda validar
 */
export const validateDiscount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { event_id, discount_name, quantity, locality_id } = req.body;

    const result = await dctoService.validateDiscount(
      event_id,
      discount_name,
      quantity,
      locality_id
    );

    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Error en validateDiscount:', err);
    res.status(400).json({ 
      valid: false,
      error: err.message 
    });
  }
};

/**
 * POST /api/discounts/calculate
 * Calcular monto de descuento
 */
export const calculateDiscount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { total_amount, discount_type, discount_value } = req.body;

    const discountAmount = dctoService.calculateDiscountAmount(
      total_amount,
      discount_type,
      discount_value
    );

    res.status(200).json({
      total_amount,
      discountAmount,
      final_amount: total_amount - discountAmount,
    });
  } catch (err: any) {
    console.error('❌ Error en calculateDiscount:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/discounts/applicable
 * Obtener descuentos aplicables para una cantidad de tickets
 */
export const getApplicableDiscounts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventId = Number(req.params.eventId);
    const quantity = Number(req.query.quantity);
    const localityId = req.query.locality_id 
      ? Number(req.query.locality_id) 
      : undefined;

    if (!quantity || quantity <= 0) {
      res.status(400).json({ error: 'Cantidad de tickets inválida' });
      return;
    }

    const discounts = await dctoService.getApplicableDiscounts(
      eventId,
      quantity,
      localityId
    );

    res.status(200).json({
      total: discounts.length,
      discounts,
    });
  } catch (err: any) {
    console.error('❌ Error en getApplicableDiscounts:', err);
    res.status(400).json({ error: err.message });
  }


  
};


export const toggleDiscount = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await dctoService.toggleDiscount(
      Number(req.params.id),
      req.user!.id,
      req.user!.role
    );
    res.status(200).json({
      message: `Descuento ${result.is_active ? 'activado' : 'desactivado'} exitosamente`,
      discount: result,
    });
  } catch (err: any) {
    const status = err.message.includes('permisos') ? 403
                 : err.message.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ message: err.message });
  }
};