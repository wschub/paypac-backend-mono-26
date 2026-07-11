"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventFavoritesCountSchema = exports.getRecentFavoritesSchema = exports.getMostPopularEventsSchema = exports.checkFavoriteSchema = exports.toggleFavoriteSchema = exports.getFavoriteByIdSchema = exports.updateFavoriteSchema = exports.addFavoriteSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para agregar favorito
 */
exports.addFavoriteSchema = zod_1.z.object({
    body: zod_1.z.object({
        event_id: zod_1.z.number().int().positive('El ID del evento es requerido'),
    }),
});
/**
 * Schema para actualizar favorito
 */
exports.updateFavoriteSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para obtener favorito por ID
 */
exports.getFavoriteByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El id debe ser numérico'),
    }),
});
/**
 * Schema para toggle favorito
 */
exports.toggleFavoriteSchema = zod_1.z.object({
    body: zod_1.z.object({
        event_id: zod_1.z.number().int().positive('El ID del evento es requerido'),
    }),
});
/**
 * Schema para verificar favorito
 */
exports.checkFavoriteSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
/**
 * Schema para obtener eventos populares
 */
exports.getMostPopularEventsSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.string().regex(/^\d+$/).optional(),
    }).optional(),
});
/**
 * Schema para obtener favoritos recientes
 */
exports.getRecentFavoritesSchema = zod_1.z.object({
    query: zod_1.z.object({
        limit: zod_1.z.string().regex(/^\d+$/).optional(),
    }).optional(),
});
/**
 * Schema para obtener conteo de favoritos de un evento
 */
exports.getEventFavoritesCountSchema = zod_1.z.object({
    params: zod_1.z.object({
        eventId: zod_1.z.string().regex(/^\d+$/, 'El eventId debe ser numérico'),
    }),
});
