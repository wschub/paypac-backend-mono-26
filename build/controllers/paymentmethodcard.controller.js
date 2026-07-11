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
exports.validateCard = exports.cleanExpiredCards = exports.deleteCard = exports.getCardById = exports.getCardStats = exports.getMyCards = exports.createCard = void 0;
const paymentmethodcard_service_1 = require("../services/paymentmethodcard.service");
const cardService = new paymentmethodcard_service_1.PaymentMethodCardService();
/**
 * POST /api/payment-cards
 * Guardar una nueva tarjeta tokenizada
 * Acceso: Usuario autenticado (dueño)
 */
const createCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id_token, created_at, brand, name, last_four, bin, exp_year, exp_month, card_holder, created_with_cvc, expires_at, validity_ends_at, } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userUid = (_b = req.user) === null || _b === void 0 ? void 0 : _b.firebase_uid;
        if (!userId || !userUid) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }
        const result = yield cardService.createCard({
            user_id: userId,
            user_uid: userUid,
            id_token,
            created_at,
            brand,
            name,
            last_four,
            bin,
            exp_year,
            exp_month,
            card_holder,
            created_with_cvc,
            expires_at,
            validity_ends_at,
        }, userId, userUid);
        res.status(201).json({
            message: 'Tarjeta guardada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createCard = createCard;
/**
 * GET /api/payment-cards
 * Listar todas las tarjetas del usuario autenticado
 * Acceso: Usuario autenticado
 *
 * Query params opcionales:
 * - active_only: true | false (solo tarjetas no expiradas)
 */
const getMyCards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userUid = (_b = req.user) === null || _b === void 0 ? void 0 : _b.firebase_uid;
        const activeOnly = req.query.active_only === 'true';
        if (!userId || !userUid) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }
        const result = yield cardService.getMyCards(userId, userUid, activeOnly);
        res.status(200).json({
            message: 'Tarjetas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getMyCards = getMyCards;
/**
 * GET /api/payment-cards/stats
 * Obtener estadísticas de tarjetas del usuario
 * Acceso: Usuario autenticado
 */
const getCardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userUid = (_b = req.user) === null || _b === void 0 ? void 0 : _b.firebase_uid;
        if (!userId || !userUid) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }
        const result = yield cardService.getCardStats(userId, userUid);
        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCardStats = getCardStats;
/**
 * GET /api/payment-cards/:id
 * Obtener una tarjeta específica por ID
 * Acceso: Usuario autenticado (solo el dueño)
 */
const getCardById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userUid = (_b = req.user) === null || _b === void 0 ? void 0 : _b.firebase_uid;
        if (!userId || !userUid) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }
        const result = yield cardService.getCardById(Number(id), userId, userUid);
        res.status(200).json({
            message: 'Tarjeta obtenida exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getCardById = getCardById;
/**
 * DELETE /api/payment-cards/:id
 * Eliminar una tarjeta
 * Acceso: Usuario autenticado (solo el dueño)
 */
const deleteCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userUid = (_b = req.user) === null || _b === void 0 ? void 0 : _b.firebase_uid;
        if (!userId || !userUid) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }
        const result = yield cardService.deleteCard(Number(id), userId, userUid);
        res.status(200).json({
            message: 'Tarjeta eliminada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteCard = deleteCard;
/**
 * DELETE /api/payment-cards/clean-expired
 * Limpiar tarjetas expiradas del usuario
 * Acceso: Usuario autenticado
 */
const cleanExpiredCards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userUid = (_b = req.user) === null || _b === void 0 ? void 0 : _b.firebase_uid;
        if (!userId || !userUid) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }
        const result = yield cardService.cleanExpiredCards(userId, userUid);
        res.status(200).json({
            message: result.message,
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.cleanExpiredCards = cleanExpiredCards;
/**
 * POST /api/payment-cards/:id/validate
 * Validar si una tarjeta es válida para usar en pago
 * Acceso: Usuario autenticado (solo el dueño)
 */
const validateCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userUid = (_b = req.user) === null || _b === void 0 ? void 0 : _b.firebase_uid;
        if (!userId || !userUid) {
            res.status(401).json({ message: 'Usuario no autenticado' });
            return;
        }
        const result = yield cardService.validateCardForPayment(Number(id), userId, userUid);
        res.status(200).json({
            message: 'Tarjeta válida para pago',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.validateCard = validateCard;
