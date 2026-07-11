"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateExpirationDate = exports.calculateDiscountFromPoints = exports.calculatePointsFromAmount = exports.POINTS_CONFIG = exports.PUBLIC_EVENT_TYPE = exports.PUBLIC_EVENT_STATUSES = exports.WEB_API_KEY = exports.DEFAULT_COUNTRY_ID = void 0;
// Colombia (id 3 en la tabla countries)
exports.DEFAULT_COUNTRY_ID = parseInt(process.env.DEFAULT_COUNTRY_ID || '3');
exports.WEB_API_KEY = process.env.WEB_API_KEY;
exports.PUBLIC_EVENT_STATUSES = ['APPROVED', 'ACTIVE'];
exports.PUBLIC_EVENT_TYPE = 'PUBLICO';
// ============================================
// SISTEMA DE PUNTOS
// ============================================
exports.POINTS_CONFIG = {
    COST_POINT: 100, // $100 COP = 1 punto
    COST_EXPIRATION_POINT: 365, // Días hasta expiración
    REDEMPTION_RATE: 10, // 10 puntos = $1,000 descuento
    REDEMPTION_UNIT: 1000 // Unidad de canje
};
const calculatePointsFromAmount = (amount) => {
    return Math.floor(amount / exports.POINTS_CONFIG.COST_POINT);
};
exports.calculatePointsFromAmount = calculatePointsFromAmount;
const calculateDiscountFromPoints = (points) => {
    return Math.floor(points / exports.POINTS_CONFIG.REDEMPTION_RATE) * exports.POINTS_CONFIG.REDEMPTION_UNIT;
};
exports.calculateDiscountFromPoints = calculateDiscountFromPoints;
const calculateExpirationDate = (fromDate = new Date()) => {
    const expirationDate = new Date(fromDate);
    expirationDate.setDate(expirationDate.getDate() + exports.POINTS_CONFIG.COST_EXPIRATION_POINT);
    return expirationDate;
};
exports.calculateExpirationDate = calculateExpirationDate;
