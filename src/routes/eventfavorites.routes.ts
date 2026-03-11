import { Router } from 'express';
import {
  addFavorite,
  getUserFavorites,
  getFavoriteById,
  removeFavorite,
  toggleFavorite,
  checkFavorite,
  getUserFavoritesStats,
  getMostPopularEvents,
  getRecentFavorites,
  getEventFavoritesCount,
} from '../controllers/eventfavorites.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  addFavoriteSchema,
  getFavoriteByIdSchema,
  toggleFavoriteSchema,
  checkFavoriteSchema,
  getMostPopularEventsSchema,
  getRecentFavoritesSchema,
  getEventFavoritesCountSchema,
} from '../validators/eventfavorites.validation';

const router = Router();

/**
 * POST /api/favorites
 * Agregar evento a favoritos
 * Acceso: Todos los usuarios autenticados
 */
router.post(
  '/favorites',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(addFavoriteSchema),
  addFavorite
);

/**
 * GET /api/favorites
 * Obtener todos los favoritos del usuario autenticado
 * Acceso: Todos los usuarios autenticados
 */
router.get(
  '/favorites',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getUserFavorites
);

/**
 * GET /api/favorites/stats
 * Obtener estadísticas de favoritos del usuario
 * Acceso: Todos los usuarios autenticados
 * 
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.get(
  '/favorites/stats',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  getUserFavoritesStats
);

/**
 * GET /api/favorites/popular
 * Obtener eventos más populares (más favoritos)
 * Requiere: ORGANIZER o PAYPAC
 * 
 * Query params:
 * - limit?: number (default: 10)
 */
router.get(
  '/favorites/popular',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getMostPopularEventsSchema),
  getMostPopularEvents
);

/**
 * GET /api/favorites/recent
 * Obtener favoritos recientes del usuario
 * Acceso: Todos los usuarios autenticados
 * 
 * Query params:
 * - limit?: number (default: 5)
 */
router.get(
  '/favorites/recent',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getRecentFavoritesSchema),
  getRecentFavorites
);

/**
 * POST /api/favorites/toggle
 * Toggle favorito (agregar si no existe, eliminar si existe)
 * Acceso: Todos los usuarios autenticados
 * 
 * Body:
 * - event_id: number
 */
router.post(
  '/favorites/toggle',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(toggleFavoriteSchema),
  toggleFavorite
);

/**
 * GET /api/favorites/check/:eventId
 * Verificar si un evento está en favoritos
 * Acceso: Todos los usuarios autenticados
 */
router.get(
  '/favorites/check/:eventId',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(checkFavoriteSchema),
  checkFavorite
);

/**
 * GET /api/favorites/:id
 * Obtener un favorito específico
 * Acceso: Todos los usuarios autenticados (solo su propio favorito)
 */
router.get(
  '/favorites/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getFavoriteByIdSchema),
  getFavoriteById
);



/**
 * DELETE /api/favorites/:id
 * Eliminar favorito
 * Acceso: Todos los usuarios autenticados (solo su propio favorito)
 */
router.delete(
  '/favorites/:id',
  authenticate,
  authorizeRoles('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'),
  validateRequest(getFavoriteByIdSchema),
  removeFavorite
);

/**
 * GET /api/events/:eventId/favorites/count
 * Obtener conteo de favoritos de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get(
  '/events/:eventId/favorites/count',
  authenticate,
  authorizeRoles('ORGANIZER', 'PAYPAC'),
  validateRequest(getEventFavoritesCountSchema),
  getEventFavoritesCount
);

export default router;