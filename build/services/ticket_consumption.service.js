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
exports.TicketConsumptionService = void 0;
const ticket_consumption_repository_1 = require("../repositories/ticket_consumption.repository");
const ticket_repository_1 = require("../repositories/ticket.repository");
const client_1 = require("../prisma/client");
const consumptionRepo = new ticket_consumption_repository_1.TicketConsumptionRepository();
const ticketRepo = new ticket_repository_1.TicketRepository();
class TicketConsumptionService {
    registerConsumption(ticketId, amount, description, staffId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield ticketRepo.findById(ticketId);
            if (!ticket)
                throw new Error('Ticket no encontrado');
            if (!ticket.is_consumable) {
                throw new Error('Este ticket no es de tipo consumible');
            }
            if (!['PAID', 'ACTIVE'].includes(ticket.status_ticket)) {
                throw new Error(`El ticket no está activo. Status: ${ticket.status_ticket}`);
            }
            const total = ticket.consumable_total;
            const used = ticket.consumable_used;
            const remaining = total - used;
            if (amount <= 0)
                throw new Error('El monto debe ser mayor a 0');
            if (amount > remaining) {
                throw new Error(`Saldo insuficiente. Disponible: $${remaining.toLocaleString('es-CO')}`);
            }
            const [consumption] = yield client_1.prisma.$transaction([
                client_1.prisma.ticketConsumption.create({
                    data: { ticket_id: ticketId, amount, description, consumed_by_id: staffId },
                }),
                client_1.prisma.ticket.update({
                    where: { id: ticketId },
                    data: { consumable_used: { increment: amount } },
                }),
            ]);
            return {
                consumption,
                balance: { total, used: used + amount, remaining: remaining - amount },
            };
        });
    }
    getHistory(ticketId, requesterId, requesterRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield ticketRepo.findById(ticketId);
            if (!ticket)
                throw new Error('Ticket no encontrado');
            const isOwner = ticket.customer_id === requesterId;
            const isStaff = ['PAYPAC', 'ORGANIZER', 'STAFF', 'STAFF_PROMOTER'].includes(requesterRole);
            if (!isOwner && !isStaff)
                throw new Error('No tienes permisos para ver este historial');
            if (!ticket.is_consumable) {
                throw new Error('Este ticket no es de tipo consumible');
            }
            const consumptions = yield consumptionRepo.findByTicketId(ticketId);
            const total = ticket.consumable_total;
            const used = ticket.consumable_used;
            return {
                balance: { total, used, remaining: total - used },
                consumptions,
            };
        });
    }
}
exports.TicketConsumptionService = TicketConsumptionService;
