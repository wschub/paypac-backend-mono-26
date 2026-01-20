import { Request, Response } from 'express';
import { EventStagesService } from '../services/eventStages.service';

const stagesService = new EventStagesService();

/**
 * POST /api/localities/:localityId/stages
 * Crear una nueva etapa para una localidad
 */
export const createStage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const localityId = Number(req.params.localityId);
    const data = req.body;

    const stage = await stagesService.createStage(
      localityId,
      data,
      user.id,
      user.role
    );

    res.status(201).json({
      message: 'Etapa creada exitosamente',
      stage,
    });
  } catch (err: any) {
    console.error('❌ Error en createStage:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/localities/:localityId/stages
 * Obtener todas las etapas de una localidad
 */
export const getStagesByLocalityId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const localityId = Number(req.params.localityId);
    const stages = await stagesService.getStagesByLocalityId(localityId);

    res.status(200).json({
      total: stages.length,
      stages,
    });
  } catch (err: any) {
    console.error('❌ Error en getStagesByLocalityId:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * GET /api/stages/:id
 * Obtener una etapa específica por ID
 */
export const getStageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const stage = await stagesService.getStageById(id);

    res.status(200).json(stage);
  } catch (err: any) {
    console.error('❌ Error en getStageById:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * PUT /api/stages/:id
 * Actualizar una etapa
 */
export const updateStage = async (
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

    const updatedStage = await stagesService.updateStage(
      id,
      data,
      user.id,
      user.role
    );

    res.status(200).json({
      message: 'Etapa actualizada exitosamente',
      stage: updatedStage,
    });
  } catch (err: any) {
    console.error('❌ Error en updateStage:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/stages/:id
 * Eliminar una etapa
 */
export const deleteStage = async (
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

    await stagesService.deleteStage(id, user.id, user.role);

    res.status(200).json({
      message: 'Etapa eliminada exitosamente',
    });
  } catch (err: any) {
    console.error('❌ Error en deleteStage:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/localities/:localityId/stages/active
 * Obtener la etapa activa actual de una localidad
 */
export const getActiveStage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const localityId = Number(req.params.localityId);
    const result = await stagesService.getActiveStage(localityId);

    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Error en getActiveStage:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * GET /api/localities/:localityId/stages/upcoming
 * Obtener próximas etapas de una localidad
 */
export const getUpcomingStages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const localityId = Number(req.params.localityId);
    const stages = await stagesService.getUpcomingStages(localityId);

    res.status(200).json({
      total: stages.length,
      upcoming_stages: stages,
    });
  } catch (err: any) {
    console.error('❌ Error en getUpcomingStages:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * GET /api/localities/:localityId/stages/price-stats
 * Obtener estadísticas de precios de una localidad
 */
export const getPriceStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const localityId = Number(req.params.localityId);
    const stats = await stagesService.getPriceStats(localityId);

    res.status(200).json(stats);
  } catch (err: any) {
    console.error('❌ Error en getPriceStats:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/stages/:id/availability
 * Verificar disponibilidad de una etapa
 */
export const checkAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const availability = await stagesService.checkAvailability(id);

    res.status(200).json(availability);
  } catch (err: any) {
    console.error('❌ Error en checkAvailability:', err);
    res.status(404).json({ error: err.message });
  }
};