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
exports.EventFavoritesService = void 0;
const eventfavorites_repository_1 = require("../repositories/eventfavorites.repository");
const event_repository_1 = require("../repositories/event.repository");
const favoritesRepo = new eventfavorites_repository_1.EventFavoritesRepository();
const eventRepo = new event_repository_1.EventRepository();
class EventFavoritesService {
    /**
     * Agregar evento a favoritos
     */
    addFavorite(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que el evento existe
            const event = yield eventRepo.findById(data.event_id);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Verificar que no esté ya en favoritos
            const existing = yield favoritesRepo.findByUserAndEvent(userId, data.event_id);
            if (existing) {
                throw new Error('Este evento ya está en tus favoritos');
            }
            // Crear favorito
            const favoriteData = {
                user_id: userId,
                event_id: data.event_id,
            };
            return favoritesRepo.create(favoriteData);
        });
    }
    /**
     * Obtener favoritos de un usuario
     */
    getUserFavorites(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorites = yield favoritesRepo.findByUserId(userId);
            return favorites.map(f => {
                var _a;
                return (Object.assign(Object.assign({}, f), { event: Object.assign(Object.assign({}, f.event), { price_from: this.getPriceFrom((_a = f.event.localities) !== null && _a !== void 0 ? _a : []) }) }));
            });
        });
    }
    getPriceFrom(localities) {
        const now = new Date();
        let cheapest = null;
        for (const locality of localities) {
            for (const stage of locality.stages) {
                const inRange = new Date(stage.date_start) <= now && now <= new Date(stage.date_end);
                if (!inRange)
                    continue;
                if (!cheapest || stage.price_ticket < cheapest.price_ticket) {
                    cheapest = {
                        name_locality: locality.name_locality,
                        stage_name: stage.stage_name,
                        date_start: stage.date_start,
                        date_end: stage.date_end,
                        price_ticket: stage.price_ticket,
                    };
                }
            }
        }
        return cheapest;
    }
    /**
     * Obtener favorito por ID
     */
    getFavoriteById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorite = yield favoritesRepo.findById(id);
            if (!favorite) {
                throw new Error('Favorito no encontrado');
            }
            // Verificar que el favorito pertenece al usuario
            if (favorite.user_id !== userId) {
                throw new Error('No tienes permisos para ver este favorito');
            }
            return favorite;
        });
    }
    /**
     * Eliminar favorito
     */
    removeFavorite(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorite = yield favoritesRepo.findById(id);
            if (!favorite) {
                throw new Error('Favorito no encontrado');
            }
            // Verificar que el favorito pertenece al usuario
            if (favorite.user_id !== userId) {
                throw new Error('No tienes permisos para eliminar este favorito');
            }
            return favoritesRepo.delete(id);
        });
    }
    /**
     * Eliminar favorito por evento (toggle)
     */
    toggleFavorite(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield favoritesRepo.findByUserAndEvent(userId, eventId);
            if (existing) {
                yield favoritesRepo.delete(existing.id);
                return {
                    action: 'removed',
                    message: 'Evento eliminado de favoritos',
                    is_favorite: false,
                };
            }
            else {
                const event = yield eventRepo.findById(eventId);
                if (!event)
                    throw new Error('Evento no encontrado');
                yield this.addFavorite(userId, { event_id: eventId });
                return {
                    action: 'added',
                    message: 'Evento agregado a favoritos',
                    is_favorite: true,
                };
            }
        });
    }
    /**
     * Verificar si un evento está en favoritos del usuario
     */
    isFavorite(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorite = yield favoritesRepo.findByUserAndEvent(userId, eventId);
            return !!favorite;
        });
    }
    /**
     * Obtener estadísticas de favoritos del usuario
     */
    getUserFavoritesStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorites = yield favoritesRepo.findByUserId(userId);
            return {
                total_favorites: favorites.length,
                by_status: {
                    upcoming: favorites.filter(f => f.event.date_event > new Date() &&
                        ['APPROVED', 'SCHEDULED', 'ACTIVE'].includes(f.event.status)).length,
                    past: favorites.filter(f => f.event.date_event < new Date() ||
                        f.event.status === 'FINALIZED').length,
                    canceled: favorites.filter(f => f.event.status === 'CANCELED').length,
                },
            };
        });
    }
    /**
     * Obtener eventos más populares (para ORGANIZER/PAYPAC)
     */
    getMostPopularEvents() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, userRole) {
            if (!['PAYPAC', 'ORGANIZER'].includes(userRole)) {
                throw new Error('No tienes permisos para ver esta información');
            }
            return favoritesRepo.getMostPopularEvents(limit);
        });
    }
    /**
     * Obtener favoritos recientes del usuario
     */
    getRecentFavorites(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 5) {
            return favoritesRepo.getRecentFavorites(userId, limit);
        });
    }
    /**
     * Obtener conteo de favoritos de un evento (para ORGANIZER)
     */
    getEventFavoritesCount(eventId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield eventRepo.findById(eventId);
            if (!event) {
                throw new Error('Evento no encontrado');
            }
            // Solo el dueño del evento o PAYPAC pueden ver esta info
            const isOwner = event.organizer_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para ver esta información');
            }
            const count = yield favoritesRepo.countByEventId(eventId);
            const favorites = yield favoritesRepo.findByEventId(eventId);
            return {
                event_id: eventId,
                event_name: event.name,
                total_favorites: count,
                favorites: favorites.map(f => ({
                    user_id: f.user.id,
                    user_name: f.user.name,
                    added_at: f.createdAt,
                })),
            };
        });
    }
}
exports.EventFavoritesService = EventFavoritesService;
