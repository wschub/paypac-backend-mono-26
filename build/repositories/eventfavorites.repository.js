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
exports.EventFavoritesRepository = void 0;
const db_1 = require("../config/db");
class EventFavoritesRepository {
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventFavorites.create({
                data,
                include: {
                    event: true,
                    user: true,
                },
            });
        });
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventFavorites.findMany({
                where: { user_id: userId },
                include: {
                    event: {
                        include: {
                            category: true,
                            subcategory: true,
                            subgenre: true,
                            localities: {
                                include: {
                                    stages: true,
                                },
                            },
                        },
                    },
                    user: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventFavorites.findUnique({
                where: { id },
                include: {
                    event: true,
                    user: true,
                },
            });
        });
    }
    findByUserAndEvent(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventFavorites.findFirst({
                where: {
                    user_id: userId,
                    event_id: eventId,
                },
                include: {
                    event: true,
                    user: true,
                },
            });
        });
    }
    findByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventFavorites.findMany({
                where: { event_id: eventId },
                include: {
                    user: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventFavorites.update({
                where: { id },
                data,
                include: {
                    event: true,
                    user: true,
                },
            });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventFavorites.delete({
                where: { id },
            });
        });
    }
    deleteByUserAndEvent(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorite = yield this.findByUserAndEvent(userId, eventId);
            if (!favorite)
                return null;
            return this.delete(favorite.id);
        });
    }
    countByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventFavorites.count({
                where: { user_id: userId },
            });
        });
    }
    countByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.eventFavorites.count({
                where: { event_id: eventId },
            });
        });
    }
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.eventFavorites.count({
                where: { id },
            });
            return count > 0;
        });
    }
    getMostPopularEvents() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            const favorites = yield db_1.prisma.eventFavorites.groupBy({
                by: ['event_id'],
                _count: { event_id: true },
                orderBy: { _count: { event_id: 'desc' } },
                take: limit,
            });
            const eventIds = favorites.map(f => f.event_id);
            const events = yield db_1.prisma.event.findMany({
                where: { id: { in: eventIds } },
            });
            return events.map(event => {
                var _a;
                return (Object.assign(Object.assign({}, event), { favorites_count: ((_a = favorites.find(f => f.event_id === event.id)) === null || _a === void 0 ? void 0 : _a._count.event_id) || 0 }));
            });
        });
    }
    getRecentFavorites(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 5) {
            return db_1.prisma.eventFavorites.findMany({
                where: { user_id: userId },
                include: {
                    event: true,
                    user: true,
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
        });
    }
}
exports.EventFavoritesRepository = EventFavoritesRepository;
