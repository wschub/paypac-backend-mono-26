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
exports.acceptByContact = exports.sendTransfer = exports.countPendingTransactions = exports.cancelTransfer = exports.rejectTransfer = exports.acceptTransfer = exports.getTransactionById = exports.getTicketHistory = exports.getReceivedTransactions = exports.getSentTransactions = exports.getUserHistory = exports.getPendingTransactions = void 0;
const tickettransaction_service_1 = require("../services/tickettransaction.service");
const utils_1 = require("../utils/utils");
const transactionService = new tickettransaction_service_1.TicketTransactionService();
/**
 * GET /api/ticket-transactions/pending
 * Obtener transferencias pendientes para el usuario autenticado
 */
const getPendingTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const transactions = yield transactionService.getPendingTransactions(userId);
        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getPendingTransactions = getPendingTransactions;
/**
 * GET /api/ticket-transactions/history
 * Obtener historial completo de transacciones del usuario
 */
const getUserHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const transactions = yield transactionService.getUserHistory(userId);
        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getUserHistory = getUserHistory;
/**
 * GET /api/ticket-transactions/sent
 * Obtener transacciones enviadas por el usuario
 */
const getSentTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const transactions = yield transactionService.getSentTransactions(userId);
        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getSentTransactions = getSentTransactions;
/**
 * GET /api/ticket-transactions/received
 * Obtener transacciones recibidas por el usuario
 */
const getReceivedTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const transactions = yield transactionService.getReceivedTransactions(userId);
        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getReceivedTransactions = getReceivedTransactions;
/**
 * GET /api/ticket-transactions/ticket/:ticketId/history
 * Obtener historial de un ticket específico
 */
const getTicketHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = (0, utils_1.paramToInt)(req.params.ticketId);
        const userId = req.user.id;
        const transactions = yield transactionService.getTicketHistory(ticketId, userId);
        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getTicketHistory = getTicketHistory;
/**
 * GET /api/ticket-transactions/:id
 * Obtener detalles de una transacción específica
 */
const getTransactionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionId = (0, utils_1.paramToInt)(req.params.id);
        const userId = req.user.id;
        const transaction = yield transactionService.getTransactionById(transactionId, userId);
        res.status(200).json({
            success: true,
            transaction,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getTransactionById = getTransactionById;
/**
 * POST /api/ticket-transactions/:id/accept
 * Aceptar transferencia de ticket
 */
const acceptTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionId = (0, utils_1.paramToInt)(req.params.id);
        const userId = req.user.id;
        const result = yield transactionService.acceptTransfer(transactionId, userId);
        res.status(200).json({
            success: true,
            message: result.message,
            transaction: result.transaction,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.acceptTransfer = acceptTransfer;
/**
 * POST /api/ticket-transactions/:id/reject
 * Rechazar transferencia de ticket
 */
const rejectTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionId = (0, utils_1.paramToInt)(req.params.id);
        const userId = req.user.id;
        const result = yield transactionService.rejectTransfer(transactionId, userId);
        res.status(200).json({
            success: true,
            message: result.message,
            transaction: result.transaction,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.rejectTransfer = rejectTransfer;
/**
 * POST /api/ticket-transactions/:id/cancel
 * Cancelar transferencia pendiente (solo el remitente)
 */
const cancelTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionId = (0, utils_1.paramToInt)(req.params.id);
        const userId = req.user.id;
        const result = yield transactionService.cancelTransaction(transactionId, userId);
        res.status(200).json({
            success: true,
            message: result.message,
            transaction: result.transaction,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.cancelTransfer = cancelTransfer;
/**
 * GET /api/ticket-transactions/count/pending
 * Contar transacciones pendientes (para notificaciones)
 */
const countPendingTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const count = yield transactionService.countPendingTransactions(userId);
        res.status(200).json({
            success: true,
            count,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.countPendingTransactions = countPendingTransactions;
// ═══════════════════════════════════════════════════════════════════════════
// 3. tickettransaction.controller.ts — agregar 2 métodos nuevos
// ═══════════════════════════════════════════════════════════════════════════
const sendTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield transactionService.sendTransfer(req.user.id, req.body);
        res.status(201).json(Object.assign({ success: true }, result));
    }
    catch (err) {
        const httpStatus = err.message.includes('no te pertenece') ? 403
            : err.message.includes('no encontrado') ? 404 : 400;
        res.status(httpStatus).json({ success: false, message: err.message });
    }
});
exports.sendTransfer = sendTransfer;
const acceptByContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contact } = req.body;
        const result = yield transactionService.acceptByContact(req.user.id, contact);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.acceptByContact = acceptByContact;
