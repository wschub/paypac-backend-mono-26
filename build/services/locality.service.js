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
exports.LocalityService = void 0;
const client_1 = require("../prisma/client");
const event_service_1 = require("./event.service");
const eventService = new event_service_1.EventService();
class LocalityService {
    getPublicLocalitiesByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield eventService.getPublicEventById(eventId);
            const now = new Date();
            const localities = yield client_1.prisma.eventLocalities.findMany({
                where: {
                    event_id: eventId,
                    stages: {
                        some: {
                            date_start: { lte: now },
                            date_end: { gte: now },
                        },
                    },
                },
                include: {
                    stages: {
                        where: {
                            date_start: { lte: now },
                            date_end: { gte: now },
                        },
                        orderBy: { price_ticket: 'asc' },
                        take: 1,
                    },
                },
                orderBy: { name_locality: 'asc' },
            });
            const validLocalities = localities.filter(loc => loc.stages.length > 0);
            return { data: validLocalities, total: validLocalities.length };
        });
    }
}
exports.LocalityService = LocalityService;
