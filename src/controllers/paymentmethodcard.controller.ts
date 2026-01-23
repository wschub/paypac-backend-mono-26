import { Request, Response } from 'express';
import { PaymentMethodCardService } from '../services/paymentmethodcard.service';

const cardService = new PaymentMethodCardService();

/**
 * POST /api/payment-cards
 * Guardar una nueva tarjeta tokenizada
 * Acceso: Usuario autenticado (dueño)
 */
export const createCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id_token,
      created_at,
      brand,
      name,
      last_four,
      bin,
      exp_year,
      exp_month,
      card_holder,
      created_with_cvc,
      expires_at,
      validity_ends_at,
    } = req.body;

    const userId = req.user?.id;
    const userUid = req.user?.firebase_uid;

    if (!userId || !userUid) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await cardService.createCard(
      {
        user_id: userId,
        user_uid: userUid,
        id_token,
        created_at,
        brand,
        name,
        last_four,
        bin,
        exp_year,
        exp_month,
        card_holder,
        created_with_cvc,
        expires_at,
        validity_ends_at,
      },
      userId,
      userUid
    );

    res.status(201).json({
      message: 'Tarjeta guardada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/payment-cards
 * Listar todas las tarjetas del usuario autenticado
 * Acceso: Usuario autenticado
 * 
 * Query params opcionales:
 * - active_only: true | false (solo tarjetas no expiradas)
 */
export const getMyCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userUid = req.user?.firebase_uid;
    const activeOnly = req.query.active_only === 'true';

    if (!userId || !userUid) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await cardService.getMyCards(userId, userUid, activeOnly);

    res.status(200).json({
      message: 'Tarjetas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/payment-cards/stats
 * Obtener estadísticas de tarjetas del usuario
 * Acceso: Usuario autenticado
 */
export const getCardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userUid = req.user?.firebase_uid;

    if (!userId || !userUid) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await cardService.getCardStats(userId, userUid);

    res.status(200).json({
      message: 'Estadísticas obtenidas exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/payment-cards/:id
 * Obtener una tarjeta específica por ID
 * Acceso: Usuario autenticado (solo el dueño)
 */
export const getCardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userUid = req.user?.firebase_uid;

    if (!userId || !userUid) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await cardService.getCardById(Number(id), userId, userUid);

    res.status(200).json({
      message: 'Tarjeta obtenida exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * DELETE /api/payment-cards/:id
 * Eliminar una tarjeta
 * Acceso: Usuario autenticado (solo el dueño)
 */
export const deleteCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userUid = req.user?.firebase_uid;

    if (!userId || !userUid) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await cardService.deleteCard(Number(id), userId, userUid);

    res.status(200).json({
      message: 'Tarjeta eliminada exitosamente',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/payment-cards/clean-expired
 * Limpiar tarjetas expiradas del usuario
 * Acceso: Usuario autenticado
 */
export const cleanExpiredCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userUid = req.user?.firebase_uid;

    if (!userId || !userUid) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await cardService.cleanExpiredCards(userId, userUid);

    res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * POST /api/payment-cards/:id/validate
 * Validar si una tarjeta es válida para usar en pago
 * Acceso: Usuario autenticado (solo el dueño)
 */
export const validateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userUid = req.user?.firebase_uid;

    if (!userId || !userUid) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const result = await cardService.validateCardForPayment(Number(id), userId, userUid);

    res.status(200).json({
      message: 'Tarjeta válida para pago',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};