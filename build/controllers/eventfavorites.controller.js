"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventFavoritesCount = exports.getRecentFavorites = exports.getMostPopularEvents = exports.getUserFavoritesStats = exports.checkFavorite = exports.toggleFavorite = exports.removeFavorite = exports.getFavoriteById = exports.getUserFavorites = exports.addFavorite = void 0;
const eventfavorites_service_1 = require("../services/eventfavorites.service");
const favoritesService = new eventfavorites_service_1.EventFavoritesService();
/**
 * POST /api/favorites
 * Agregar evento a favoritos
 */
const addFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const data = req.body;
        const favorite = yield favoritesService.addFavorite(user.id, data);
        res.status(201).json({
            message: 'Evento agregado a favoritos exitosamente',
            favorite,
        });
    }
    catch (err) {
        console.error('❌ Error en addFavorite:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.addFavorite = addFavorite;
/**
 * GET /api/favorites
 * Obtener todos los favoritos del usuario autenticado
 */
const getUserFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const favorites = yield favoritesService.getUserFavorites(user.id);
        res.status(200).json({
            total: favorites.length,
            favorites,
        });
    }
    catch (err) {
        console.error('❌ Error en getUserFavorites:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getUserFavorites = getUserFavorites;
/**
 * GET /api/favorites/:id
 * Obtener un favorito específico
 */
const getFavoriteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const favorite = yield favoritesService.getFavoriteById(id, user.id);
        res.status(200).json(favorite);
    }
    catch (err) {
        console.error('❌ Error en getFavoriteById:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getFavoriteById = getFavoriteById;
/**
 * PUT /api/favorites/:id
 * Actualizar favorito
 */
/**
 * DELETE /api/favorites/:id
 * Eliminar favorito
 */
const removeFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        yield favoritesService.removeFavorite(id, user.id);
        res.status(200).json({
            message: 'Favorito eliminado exitosamente',
        });
    }
    catch (err) {
        console.error('❌ Error en removeFavorite:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.removeFavorite = removeFavorite;
/**
 * POST /api/favorites/toggle
 * Toggle favorito (agregar si no existe, eliminar si existe)
 */
const toggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const { event_id } = req.body;
        const result = yield favoritesService.toggleFavorite(user.id, event_id);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Error en toggleFavorite:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.toggleFavorite = toggleFavorite;
/**
 * GET /api/favorites/check/:eventId
 * Verificar si un evento está en favoritos
 */
const checkFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const isFavorite = yield favoritesService.isFavorite(user.id, eventId);
        res.status(200).json({
            event_id: eventId,
            is_favorite: isFavorite,
        });
    }
    catch (err) {
        console.error('❌ Error en checkFavorite:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.checkFavorite = checkFavorite;
/**
 * GET /api/favorites/stats
 * Obtener estadísticas de favoritos del usuario
 */
const getUserFavoritesStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const stats = yield favoritesService.getUserFavoritesStats(user.id);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('❌ Error en getUserFavoritesStats:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getUserFavoritesStats = getUserFavoritesStats;
/**
 * GET /api/favorites/popular
 * Obtener eventos más populares (más favoritos)
 */
const getMostPopularEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const limit = Number(req.query.limit) || 10;
        const events = yield favoritesService.getMostPopularEvents(limit, user.role);
        res.status(200).json({
            total: events.length,
            events,
        });
    }
    catch (err) {
        console.error('❌ Error en getMostPopularEvents:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getMostPopularEvents = getMostPopularEvents;
/**
 * GET /api/favorites/recent
 * Obtener favoritos recientes del usuario
 */
const getRecentFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const limit = Number(req.query.limit) || 5;
        const favorites = yield favoritesService.getRecentFavorites(user.id, limit);
        res.status(200).json({
            total: favorites.length,
            favorites,
        });
    }
    catch (err) {
        console.error('❌ Error en getRecentFavorites:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getRecentFavorites = getRecentFavorites;
/**
 * GET /api/events/:eventId/favorites/count
 * Obtener conteo de favoritos de un evento
 */
const getEventFavoritesCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const result = yield favoritesService.getEventFavoritesCount(eventId, user.id, user.role);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Error en getEventFavoritesCount:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getEventFavoritesCount = getEventFavoritesCount;
