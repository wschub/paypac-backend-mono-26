import { Request, Response } from 'express';
import { EventFavoritesService } from '../services/eventfavorites.service';

const favoritesService = new EventFavoritesService();

/**
 * POST /api/favorites
 * Agregar evento a favoritos
 */
export const addFavorite = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const data = req.body;

    const favorite = await favoritesService.addFavorite(user.id, data);

    res.status(201).json({
      message: 'Evento agregado a favoritos exitosamente',
      favorite,
    });
  } catch (err: any) {
    console.error('❌ Error en addFavorite:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/favorites
 * Obtener todos los favoritos del usuario autenticado
 */
export const getUserFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const favorites = await favoritesService.getUserFavorites(user.id);

    res.status(200).json({
      total: favorites.length,
      favorites,
    });
  } catch (err: any) {
    console.error('❌ Error en getUserFavorites:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/favorites/:id
 * Obtener un favorito específico
 */
export const getFavoriteById = async (
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
    const favorite = await favoritesService.getFavoriteById(id, user.id);

    res.status(200).json(favorite);
  } catch (err: any) {
    console.error('❌ Error en getFavoriteById:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * PUT /api/favorites/:id
 * Actualizar favorito
 */
export const updateFavorite = async (
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

    const updatedFavorite = await favoritesService.updateFavorite(
      id,
      user.id,
      data
    );

    res.status(200).json({
      message: 'Favorito actualizado exitosamente',
      favorite: updatedFavorite,
    });
  } catch (err: any) {
    console.error('❌ Error en updateFavorite:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * DELETE /api/favorites/:id
 * Eliminar favorito
 */
export const removeFavorite = async (
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

    await favoritesService.removeFavorite(id, user.id);

    res.status(200).json({
      message: 'Favorito eliminado exitosamente',
    });
  } catch (err: any) {
    console.error('❌ Error en removeFavorite:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * POST /api/favorites/toggle
 * Toggle favorito (agregar si no existe, eliminar si existe)
 */
export const toggleFavorite = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const { event_id } = req.body;

    const result = await favoritesService.toggleFavorite(user.id, event_id);

    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Error en toggleFavorite:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/favorites/check/:eventId
 * Verificar si un evento está en favoritos
 */
export const checkFavorite = async (
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
    const isFavorite = await favoritesService.isFavorite(user.id, eventId);

    res.status(200).json({
      event_id: eventId,
      is_favorite: isFavorite,
    });
  } catch (err: any) {
    console.error('❌ Error en checkFavorite:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/favorites/stats
 * Obtener estadísticas de favoritos del usuario
 */
export const getUserFavoritesStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const stats = await favoritesService.getUserFavoritesStats(user.id);

    res.status(200).json(stats);
  } catch (err: any) {
    console.error('❌ Error en getUserFavoritesStats:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/favorites/popular
 * Obtener eventos más populares (más favoritos)
 */
export const getMostPopularEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const limit = Number(req.query.limit) || 10;
    const events = await favoritesService.getMostPopularEvents(limit, user.role);

    res.status(200).json({
      total: events.length,
      events,
    });
  } catch (err: any) {
    console.error('❌ Error en getMostPopularEvents:', err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * GET /api/favorites/recent
 * Obtener favoritos recientes del usuario
 */
export const getRecentFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const limit = Number(req.query.limit) || 5;
    const favorites = await favoritesService.getRecentFavorites(user.id, limit);

    res.status(200).json({
      total: favorites.length,
      favorites,
    });
  } catch (err: any) {
    console.error('❌ Error en getRecentFavorites:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/events/:eventId/favorites/count
 * Obtener conteo de favoritos de un evento
 */
export const getEventFavoritesCount = async (
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
    const result = await favoritesService.getEventFavoritesCount(
      eventId,
      user.id,
      user.role
    );

    res.status(200).json(result);
  } catch (err: any) {
    console.error('❌ Error en getEventFavoritesCount:', err);
    res.status(403).json({ error: err.message });
  }
};