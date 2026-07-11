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
exports.EventViewService = void 0;
const client_1 = require("../prisma/client");
class EventViewService {
    detectDeviceType(userAgent) {
        const ua = userAgent.toLowerCase();
        if (/mobile|android|iphone/i.test(ua))
            return 'MOBILE';
        if (/tablet|ipad/i.test(ua))
            return 'TABLET';
        return 'DESKTOP';
    }
    createView(eventId, data, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
            const userAgent = req.headers['user-agent'] || '';
            const referrer = req.headers['referer'] ||
                req.headers['referrer'] ||
                null;
            const deviceType = this.detectDeviceType(userAgent);
            const existing = yield client_1.prisma.eventView.findUnique({
                where: {
                    event_id_session_token: {
                        event_id: eventId,
                        session_token: data.session_token,
                    },
                },
            });
            if (existing) {
                return {
                    id: existing.id,
                    session_token: existing.session_token,
                    message: 'View already exists',
                };
            }
            const view = yield client_1.prisma.eventView.create({
                data: {
                    event_id: eventId,
                    user_id: data.user_id || null,
                    session_token: data.session_token,
                    session_duration: 0,
                    session_ip: sessionIp,
                    session_channel: data.session_channel,
                    session_conversion: false,
                    country_id: data.country_id || null,
                    city_id: data.city_id || null,
                    user_agent: userAgent,
                    referrer: referrer,
                    device_type: deviceType,
                },
            });
            return {
                id: view.id,
                session_token: view.session_token,
                message: 'View created',
            };
        });
    }
    updateDuration(eventId, sessionToken, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield client_1.prisma.eventView.updateMany({
                where: {
                    event_id: eventId,
                    session_token: sessionToken,
                },
                data: {
                    session_duration: { increment: duration },
                },
            });
            if (updated.count === 0) {
                throw new Error('View not found');
            }
            const view = yield client_1.prisma.eventView.findUnique({
                where: {
                    event_id_session_token: {
                        event_id: eventId,
                        session_token: sessionToken,
                    },
                },
                select: { session_duration: true },
            });
            return {
                message: 'Duration updated',
                total_duration: (view === null || view === void 0 ? void 0 : view.session_duration) || 0,
            };
        });
    }
    markConversion(eventId, sessionToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield client_1.prisma.eventView.updateMany({
                where: {
                    event_id: eventId,
                    session_token: sessionToken,
                },
                data: {
                    session_conversion: true,
                },
            });
            if (updated.count === 0) {
                console.warn(`No view found for conversion: event=${eventId}, token=${sessionToken}`);
            }
            return { message: 'Conversion marked' };
        });
    }
}
exports.EventViewService = EventViewService;
