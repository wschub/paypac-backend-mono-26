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
exports.getEventTicketStats = exports.cancelTicket = exports.getUpcomingTickets = exports.validateTicket = exports.transferTicket = exports.getTicketById = exports.getMyTickets = exports.getTotpSecret = exports.registerPublicKey = void 0;
const ticket_service_1 = require("../services/ticket.service");
const tickettransaction_service_1 = require("../services/tickettransaction.service");
const utils_1 = require("../utils/utils");
const ticketService = new ticket_service_1.TicketService();
const ticketTransactionService = new tickettransaction_service_1.TicketTransactionService();
/*
otp
*/
const registerPublicKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const { device_public_key } = req.body;
        const ticket = yield ticketService.registerPublicKey(id, userId, device_public_key);
        res.status(200).json({ message: 'Public key registrada', ticket });
    }
    catch (err) {
        const status = err.message.includes('autorizado') ? 403
            : err.message.includes('encontrado') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.registerPublicKey = registerPublicKey;
const getTotpSecret = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const result = yield ticketService.getTotpSecret(id, userId);
        res.status(200).json(result);
    }
    catch (err) {
        const status = err.message.includes('autorizado') ? 403
            : err.message.includes('encontrado') || err.message.includes('configurado') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.getTotpSecret = getTotpSecret;
/**
 * GET /api/tickets/my-tickets
 * Obtener mis tickets (Wallet)
 */
const getMyTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const rawStatus = req.query.status;
        const status = rawStatus
            ? rawStatus.includes(',')
                ? rawStatus.split(',')
                : rawStatus
            : undefined;
        const result = yield ticketService.getMyTickets(userId, status);
        res.status(200).json({
            success: true,
            event_count: result.event_count,
            events: result.events,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
exports.getMyTickets = getMyTickets;
/**
 * GET /api/tickets/:id
 * Obtener un ticket específico
 */
const getTicketById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = (0, utils_1.paramToInt)(req.params.id);
        const userId = req.user.id;
        const ticket = yield ticketService.getTicketById(ticketId, userId);
        res.status(200).json({
            success: true,
            ticket,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getTicketById = getTicketById;
/**
 * POST /api/tickets/:id/transfer
 * Transferir/regalar/vender ticket
 */
const transferTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = (0, utils_1.paramToInt)(req.params.id);
        const fromUser = req.user;
        const { to_user_id, to_user_uid, to_user_id_phone, transaction_type, description, } = req.body;
        // Transferir el ticket
        const result = yield ticketService.transferTicket(ticketId, fromUser.id, fromUser.firebase_uid, req.body.from_user_id_phone || 'UNKNOWN', // TODO: Obtener del perfil
        to_user_id, to_user_uid, to_user_id_phone, transaction_type, description);
        // Crear registro de auditoría
        yield ticketTransactionService.createTransaction({
            ticket_id: ticketId,
            from_customer_id: fromUser.id,
            from_customer_token: result.ticket.token_ticket, // Token anterior
            from_customer_uid: fromUser.firebase_uid,
            from_customer_UUID_phone: req.body.from_user_id_phone || 'UNKNOWN',
            reference_ticket: result.ticket.reference_ticket,
            booking_ticket: result.ticket.booking_ticket,
            to_customer_id: to_user_id,
            to_customer_token: result.ticket.token_ticket, // Nuevo token
            to_customer_uid: to_user_uid,
            to_customer_UUID_phone: to_user_id_phone,
            type_transaction: transaction_type,
            ev_name: result.ticket.ev_name,
            transaction_description: description || `Transferencia de ticket`,
            status_ticket: transaction_type === 'sale' ? 'PENDING' : 'COMPLETED',
        });
        res.status(200).json({
            success: true,
            message: result.message,
            ticket: result.ticket,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.transferTicket = transferTicket;
/**
 * 🆕 POST /api/tickets/:id/validate
 * Validar ticket en la entrada del evento
 * ACTUALIZADO: Ahora requiere event_id en el body
 */
const validateTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { qr_token, event_id } = req.body;
        const scannerUser = req.user;
        const result = yield ticketService.validateTicket(qr_token, scannerUser.id, scannerUser.role, event_id // 🆕 Pasar event_id
        );
        res.status(200).json({
            success: true,
            message: result.message,
            ticket: result.ticket,
            scanner_id: result.scanner_id,
            scanner_role: result.scanner_role,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.validateTicket = validateTicket;
/**
 * GET /api/tickets/upcoming
 * Obtener tickets próximos (para notificaciones)
 */
const getUpcomingTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const daysAhead = parseInt(req.query.days) || 7;
        const tickets = yield ticketService.getUpcomingTickets(userId, daysAhead);
        res.status(200).json({
            success: true,
            count: tickets.length,
            tickets,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getUpcomingTickets = getUpcomingTickets;
/**
 * DELETE /api/tickets/:id
 * Cancelar ticket
 */
const cancelTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticketId = (0, utils_1.paramToInt)(req.params.id);
        const userId = req.user.id;
        const userRole = req.user.role;
        const ticket = yield ticketService.cancelTicket(ticketId, userId, userRole);
        res.status(200).json({
            success: true,
            message: 'Ticket cancelado exitosamente',
            ticket,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.cancelTicket = cancelTicket;
/**
 * GET /api/tickets/event/:eventId/stats
 * Obtener estadísticas de tickets por evento
 */
const getEventTicketStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = (0, utils_1.paramToInt)(req.params.eventId);
        const userId = req.user.id;
        const userRole = req.user.role;
        const stats = yield ticketService.getEventTicketStats(eventId, userId, userRole);
        res.status(200).json({
            success: true,
            stats,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});
exports.getEventTicketStats = getEventTicketStats;
