import { Request, Response } from 'express';
import { EventRewardRulesService } from '../services/eventrewardrules.service';

const rewardRulesService = new EventRewardRulesService();

/**
 * POST /api/events/:eventId/reward-rules
 * Crear una nueva regla de recompensa
 */
export const createRewardRule = async (
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

    const rule = await rewardRulesService.createRewardRule(
      eventId,
      data,
      user.id,
      user.role
    );

    res.status(201).json({
      message: 'Regla de recompensa creada exitosamente',
      rule,
    });
  } catch (err: any) {
    console.error('❌ Error en createRewardRule:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/reward-rules
 * Obtener todas las reglas de recompensa de un evento
 */
export const getRewardRulesByEventId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventId = Number(req.params.eventId);
    const rules = await rewardRulesService.getRewardRulesByEventId(eventId);

    res.status(200).json({
      total: rules.length,
      rules,
    });
  } catch (err: any) {
    console.error('❌ Error en getRewardRulesByEventId:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * GET /api/reward-rules/:id
 * Obtener una regla específica por ID
 */
export const getRewardRuleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const rule = await rewardRulesService.getRewardRuleById(id);

    res.status(200).json(rule);
  } catch (err: any) {
    console.error('❌ Error en getRewardRuleById:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * PUT /api/reward-rules/:id
 * Actualizar una regla de recompensa
 */
export const updateRewardRule = async (
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

    const updatedRule = await rewardRulesService.updateRewardRule(
      id,
      data,
      user.id,
      user.role
    );

    res.status(200).json({
      message: 'Regla de recompensa actualizada exitosamente',
      rule: updatedRule,
    });
  } catch (err: any) {
    console.error('❌ Error en updateRewardRule:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/reward-rules/:id
 * Eliminar una regla de recompensa
 */
export const deleteRewardRule = async (
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

    await rewardRulesService.deleteRewardRule(id, user.id, user.role);

    res.status(200).json({
      message: 'Regla de recompensa eliminada exitosamente',
    });
  } catch (err: any) {
    console.error('❌ Error en deleteRewardRule:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * POST /api/reward-rules/calculate
 * Calcular recompensa para una venta (uso interno o testing)
 */
export const calculateReward = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { event_id, quantity, total_amount, locality_id } = req.body;

    const result = await rewardRulesService.calculateReward(
      event_id,
      quantity,
      total_amount,
      locality_id
    );

    if (!result) {
      res.status(200).json({
        hasReward: false,
        message: 'No hay reglas de recompensa aplicables para esta venta',
      });
      return;
    }

    res.status(200).json({
      hasReward: true,
      ...result,
    });
  } catch (err: any) {
    console.error('❌ Error en calculateReward:', err);
    res.status(400).json({ error: err.message });
  }
};