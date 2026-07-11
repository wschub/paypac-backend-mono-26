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
exports.adminTransferTicket = exports.updateTicketStatus = exports.getAdminTickets = void 0;
const ticket_admin_service_1 = require("../services/ticket.admin.service");
const ticketAdminService = new ticket_admin_service_1.TicketAdminService();
/**
 * GET /api/tickets/admin
 * Listar tickets con filtros
 * PAYPAC: todos | ORGANIZER: solo sus eventos
 */
const getAdminTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { event_id, status, search, from, to, page, limit } = req.query;
        const result = yield ticketAdminService.getTickets({
            event_id: event_id ? Number(event_id) : undefined,
            status: status,
            search: search,
            from: from,
            to: to,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 50,
        }, user.role, user.id);
        res.status(200).json(result);
    }
    catch (err) {
        const httpStatus = err.message.includes('permisos') ? 403 : 500;
        res.status(httpStatus).json({ message: err.message });
    }
});
exports.getAdminTickets = getAdminTickets;
/**
 * PATCH /api/tickets/admin/:id/status
 * Cambiar status de un ticket
 * PAYPAC only (por ahora)
 */
const updateTicketStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield ticketAdminService.updateTicketStatus(Number(req.params.id), req.body.status, req.user.role);
        res.status(200).json({
            message: `Ticket actualizado a ${result.status_ticket}`,
            ticket: result,
        });
    }
    catch (err) {
        const httpStatus = err.message.includes('permisos') ? 403
            : err.message.includes('no encontrado') ? 404 : 400;
        res.status(httpStatus).json({ message: err.message });
    }
});
exports.updateTicketStatus = updateTicketStatus;
/**
 * POST /api/tickets/admin/:id/transfer
 * Transferir ticket a otro usuario
 * PAYPAC only (por ahora)
 */
const adminTransferTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield ticketAdminService.adminTransferTicket(Number(req.params.id), req.body.to_user_id, req.user.role);
        res.status(200).json({
            message: 'Ticket transferido exitosamente',
            ticket: result,
        });
    }
    catch (err) {
        const httpStatus = err.message.includes('permisos') ? 403
            : err.message.includes('no encontrado') ? 404 : 400;
        res.status(httpStatus).json({ message: err.message });
    }
});
exports.adminTransferTicket = adminTransferTicket;
