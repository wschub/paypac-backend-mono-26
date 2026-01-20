import { Request, Response } from 'express';
import { EventLocalitiesService } from '../services/eventLocalities.service';

const localitiesService = new EventLocalitiesService();

/**
 * POST /api/events/:eventId/localities
 * Crear una nueva localidad para un evento
 */
export const createLocality = async (
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

    // Validar colores antes de crear
    localitiesService.validateLocalityData(data);

    const locality = await localitiesService.createLocality(
      eventId,
      data,
      user.id,
      user.role
    );

    res.status(201).json({
      message: 'Localidad creada exitosamente',
      locality,
    });
  } catch (err: any) {
    console.error('❌ Error en createLocality:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/localities
 * Obtener todas las localidades de un evento
 */
export const getLocalitiesByEventId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventId = Number(req.params.eventId);
    const localities = await localitiesService.getLocalitiesByEventId(eventId);

    res.status(200).json({
      total: localities.length,
      localities,
    });
  } catch (err: any) {
    console.error('❌ Error en getLocalitiesByEventId:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * GET /api/localities/:id
 * Obtener una localidad específica por ID
 */
export const getLocalityById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const locality = await localitiesService.getLocalityById(id);

    res.status(200).json(locality);
  } catch (err: any) {
    console.error('❌ Error en getLocalityById:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * PUT /api/localities/:id
 * Actualizar una localidad
 */
export const updateLocality = async (
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

    // Validar colores antes de actualizar
    localitiesService.validateLocalityData(data);

    const updatedLocality = await localitiesService.updateLocality(
      id,
      data,
      user.id,
      user.role
    );

    res.status(200).json({
      message: 'Localidad actualizada exitosamente',
      locality: updatedLocality,
    });
  } catch (err: any) {
    console.error('❌ Error en updateLocality:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/localities/:id
 * Eliminar una localidad
 */
export const deleteLocality = async (
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

    await localitiesService.deleteLocality(id, user.id, user.role);

    res.status(200).json({
      message: 'Localidad eliminada exitosamente',
    });
  } catch (err: any) {
    console.error('❌ Error en deleteLocality:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/localities/stats
 * Obtener estadísticas de localidades de un evento
 */
export const getLocalitiesStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventId = Number(req.params.eventId);
    const stats = await localitiesService.getLocalitiesStats(eventId);

    res.status(200).json(stats);
  } catch (err: any) {
    console.error('❌ Error en getLocalitiesStats:', err);
    res.status(500).json({ error: err.message });
  }
};