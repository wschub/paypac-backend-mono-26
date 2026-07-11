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
exports.cleanOldMessages = exports.deleteMessage = exports.retryMessage = exports.getMessageById = exports.getQueueStats = exports.getMyMessages = exports.processPendingMessages = exports.queueEmail = void 0;
const notificationmessagequeue_service_1 = require("../services/notificationmessagequeue.service");
const queueService = new notificationmessagequeue_service_1.NotificationMessageQueueService();
/**
 * POST /api/email-queue
 */
const queueEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, email, templateCode, variables, sendAt } = req.body;
        const result = yield queueService.queueEmail({
            userId,
            email,
            templateCode,
            variables,
            sendAt: sendAt ? new Date(sendAt) : undefined,
        });
        res.status(201).json({
            message: 'Email encolado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.queueEmail = queueEmail;
/**
 * POST /api/email-queue/process
 */
const processPendingMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        if (userRole !== 'PAYPAC') {
            res.status(403).json({ message: 'Solo PAYPAC puede procesar la cola' });
            return;
        }
        const result = yield queueService.processPendingMessages();
        res.status(200).json({ message: 'Procesamiento completado', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.processPendingMessages = processPendingMessages;
/**
 * GET /api/email-queue/my-messages
 */
const getMyMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const result = yield queueService.getUserMessages(userId);
        res.status(200).json({ message: 'Mensajes obtenidos', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getMyMessages = getMyMessages;
/**
 * GET /api/email-queue/stats
 */
const getQueueStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield queueService.getQueueStats(userRole);
        res.status(200).json({ message: 'Estadísticas obtenidas', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getQueueStats = getQueueStats;
/**
 * GET /api/email-queue/:id
 */
const getMessageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const currentUserId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        const message = yield queueService.getMessageById(Number(id));
        if (userRole !== 'PAYPAC' && message.user_id !== currentUserId) {
            res.status(403).json({ message: 'Sin permiso' });
            return;
        }
        res.status(200).json({ message: 'Mensaje obtenido', data: message });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getMessageById = getMessageById;
/**
 * POST /api/email-queue/:id/retry
 */
const retryMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield queueService.retryMessage(Number(id), userRole);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.retryMessage = retryMessage;
/**
 * DELETE /api/email-queue/:id
 */
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield queueService.deleteMessage(Number(id), userRole);
        res.status(200).json({ message: 'Eliminado', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteMessage = deleteMessage;
/**
 * POST /api/email-queue/clean-old
 */
const cleanOldMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { days_old } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield queueService.cleanOldMessages(days_old || 30, userRole);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.cleanOldMessages = cleanOldMessages;
