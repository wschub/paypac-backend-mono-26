"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventfavorites_controller_1 = require("../controllers/eventfavorites.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const eventfavorites_validation_1 = require("../validators/eventfavorites.validation");
const router = (0, express_1.Router)();
/**
 * POST /api/favorites
 * Agregar evento a favoritos
 * Acceso: Todos los usuarios autenticados
 */
router.post('/favorites', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventfavorites_validation_1.addFavoriteSchema), eventfavorites_controller_1.addFavorite);
/**
 * GET /api/favorites
 * Obtener todos los favoritos del usuario autenticado
 * Acceso: Todos los usuarios autenticados
 */
router.get('/favorites', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), eventfavorites_controller_1.getUserFavorites);
/**
 * GET /api/favorites/stats
 * Obtener estadísticas de favoritos del usuario
 * Acceso: Todos los usuarios autenticados
 *
 * NOTA: Esta ruta debe ir ANTES de /:id
 */
router.get('/favorites/stats', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), eventfavorites_controller_1.getUserFavoritesStats);
/**
 * GET /api/favorites/popular
 * Obtener eventos más populares (más favoritos)
 * Requiere: ORGANIZER o PAYPAC
 *
 * Query params:
 * - limit?: number (default: 10)
 */
router.get('/favorites/popular', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventfavorites_validation_1.getMostPopularEventsSchema), eventfavorites_controller_1.getMostPopularEvents);
/**
 * GET /api/favorites/recent
 * Obtener favoritos recientes del usuario
 * Acceso: Todos los usuarios autenticados
 *
 * Query params:
 * - limit?: number (default: 5)
 */
router.get('/favorites/recent', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventfavorites_validation_1.getRecentFavoritesSchema), eventfavorites_controller_1.getRecentFavorites);
/**
 * POST /api/favorites/toggle
 * Toggle favorito (agregar si no existe, eliminar si existe)
 * Acceso: Todos los usuarios autenticados
 *
 * Body:
 * - event_id: number
 */
router.post('/favorites/toggle', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventfavorites_validation_1.toggleFavoriteSchema), eventfavorites_controller_1.toggleFavorite);
/**
 * GET /api/favorites/check/:eventId
 * Verificar si un evento está en favoritos
 * Acceso: Todos los usuarios autenticados
 */
router.get('/favorites/check/:eventId', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventfavorites_validation_1.checkFavoriteSchema), eventfavorites_controller_1.checkFavorite);
/**
 * GET /api/favorites/:id
 * Obtener un favorito específico
 * Acceso: Todos los usuarios autenticados (solo su propio favorito)
 */
router.get('/favorites/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventfavorites_validation_1.getFavoriteByIdSchema), eventfavorites_controller_1.getFavoriteById);
/**
 * DELETE /api/favorites/:id
 * Eliminar favorito
 * Acceso: Todos los usuarios autenticados (solo su propio favorito)
 */
router.delete('/favorites/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER', 'PROMOTER', 'CUSTOMER'), (0, validate_middleware_1.validateRequest)(eventfavorites_validation_1.getFavoriteByIdSchema), eventfavorites_controller_1.removeFavorite);
/**
 * GET /api/events/:eventId/favorites/count
 * Obtener conteo de favoritos de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
router.get('/events/:eventId/favorites/count', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)('ORGANIZER', 'PAYPAC'), (0, validate_middleware_1.validateRequest)(eventfavorites_validation_1.getEventFavoritesCountSchema), eventfavorites_controller_1.getEventFavoritesCount);
exports.default = router;
