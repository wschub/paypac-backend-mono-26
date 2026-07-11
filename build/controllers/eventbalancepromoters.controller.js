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
exports.assignCutoffDate = exports.getAllPendingBalances = exports.getEventBalanceStats = exports.createRefundBalance = exports.bulkMarkAsPaid = exports.markAsPaid = exports.getMyBalanceStats = exports.getMyBalance = exports.getPromoterBalance = exports.getBalancesByEventId = void 0;
const eventbalancepromoters_service_1 = require("../services/eventbalancepromoters.service");
const balanceService = new eventbalancepromoters_service_1.EventBalancePromotersService();
/**
 * GET /api/events/:eventId/balances
 * Obtener todos los balances de un evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
const getBalancesByEventId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const balances = yield balanceService.getBalancesByEventId(eventId, user.id, user.role);
        res.status(200).json({
            total: balances.length,
            balances,
        });
    }
    catch (err) {
        console.error('❌ Error en getBalancesByEventId:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getBalancesByEventId = getBalancesByEventId;
/**
 * GET /api/balances/promoter/:promoterId
 * Obtener extracto de un promotor
 * Acceso: El mismo promotor, ORGANIZER o PAYPAC
 */
const getPromoterBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const promoterId = Number(req.params.promoterId);
        const balance = yield balanceService.getPromoterBalance(promoterId, user.id, user.role);
        res.status(200).json(balance);
    }
    catch (err) {
        console.error('❌ Error en getPromoterBalance:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getPromoterBalance = getPromoterBalance;
/**
 * GET /api/promoters/my-balance
 * Obtener extracto del promotor autenticado
 */
const getMyBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const balance = yield balanceService.getPromoterBalance(user.id, user.id, user.role);
        res.status(200).json(balance);
    }
    catch (err) {
        console.error('❌ Error en getMyBalance:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getMyBalance = getMyBalance;
/**
 * GET /api/promoters/my-balance/stats
 * Obtener estadísticas del promotor autenticado
 */
const getMyBalanceStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const stats = yield balanceService.getMyBalanceStats(user.id);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('❌ Error en getMyBalanceStats:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getMyBalanceStats = getMyBalanceStats;
/**
 * PATCH /api/balances/:id/mark-paid
 * Marcar un balance como pagado
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
const markAsPaid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const { payment_method, payment_reference } = req.body;
        const updatedBalance = yield balanceService.markAsPaid(id, user.id, user.role, { payment_method, payment_reference });
        res.status(200).json({
            message: 'Balance marcado como pagado exitosamente',
            balance: updatedBalance,
        });
    }
    catch (err) {
        console.error('❌ Error en markAsPaid:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.markAsPaid = markAsPaid;
/**
 * PATCH /api/balances/bulk-pay
 * Marcar múltiples balances como pagados
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
const bulkMarkAsPaid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const { balance_ids, payment_date, payment_method, payment_reference } = req.body;
        const result = yield balanceService.bulkMarkAsPaid(balance_ids, user.id, user.role, { payment_date, payment_method, payment_reference });
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Error en bulkMarkAsPaid:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.bulkMarkAsPaid = bulkMarkAsPaid;
/**
 * POST /api/balances/:id/refund
 * Crear balance de reembolso (negativo)
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
const createRefundBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const originalBalanceId = Number(req.params.id);
        const refundBalance = yield balanceService.createRefundBalance(originalBalanceId, user.id, user.role);
        res.status(201).json({
            message: 'Balance de reembolso creado exitosamente',
            balance: refundBalance,
        });
    }
    catch (err) {
        console.error('❌ Error en createRefundBalance:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.createRefundBalance = createRefundBalance;
/**
 * GET /api/events/:eventId/balances/stats
 * Obtener estadísticas de balances del evento
 * Requiere: ORGANIZER (dueño) o PAYPAC
 */
const getEventBalanceStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const stats = yield balanceService.getEventBalanceStats(eventId, user.id, user.role);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('❌ Error en getEventBalanceStats:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getEventBalanceStats = getEventBalanceStats;
/**
 * GET /api/balances/pending
 * Obtener todos los balances pendientes
 * Requiere: PAYPAC
 */
const getAllPendingBalances = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const balances = yield balanceService.getAllPendingBalances(user.role);
        res.status(200).json({
            total: balances.length,
            balances,
        });
    }
    catch (err) {
        console.error('❌ Error en getAllPendingBalances:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getAllPendingBalances = getAllPendingBalances;
/**
 * POST /api/events/:eventId/balances/assign-cutoff
 * Asignar fecha de corte a balances pendientes
 * Requiere: ORGANIZER (dueño) o PAYPAC
 * Normalmente se ejecuta automáticamente al FINALIZED
 */
const assignCutoffDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const { days_after_event } = req.body;
        const result = yield balanceService.assignCutoffDateForEvent(eventId, days_after_event || 15);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Error en assignCutoffDate:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.assignCutoffDate = assignCutoffDate;
