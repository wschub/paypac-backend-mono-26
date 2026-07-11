"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicViewUpdateLimiter = exports.publicViewLimiter = exports.publicCitiesLimiter = exports.publicCatalogLimiter = exports.publicLocalitiesLimiter = exports.publicEventDetailLimiter = exports.publicEventsLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const RATE_LIMIT_MESSAGE = 'Too many requests from this IP, please try again later.';
exports.publicEventsLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: parseInt(process.env.WEB_RATE_LIMIT_EVENTS || '60'),
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.publicEventDetailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: parseInt(process.env.WEB_RATE_LIMIT_DETAIL || '100'),
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.publicLocalitiesLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: parseInt(process.env.WEB_RATE_LIMIT_LOCALITIES || '100'),
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.publicCatalogLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: parseInt(process.env.WEB_RATE_LIMIT_CATEGORIES || '30'),
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.publicCitiesLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: parseInt(process.env.WEB_RATE_LIMIT_CITIES || '20'),
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.publicViewLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 10,
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.publicViewUpdateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 20,
    message: RATE_LIMIT_MESSAGE,
    standardHeaders: true,
    legacyHeaders: false,
});
