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
exports.TicketRepository = void 0;
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
class TicketRepository {
    /**
     * Crear un nuevo ticket
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.create({
                data,
            });
        });
    }
    /**
     * Crear múltiples tickets en batch (compra múltiple)
     */
    createMany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.ticket.createMany({
                data,
                skipDuplicates: true,
            });
            return result.count;
        });
    }
    /**
     * Buscar ticket por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.findUnique({
                where: { id },
            });
        });
    }
    /**
     * Buscar ticket por reference_ticket
     */
    findByReference(referenceTicket) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.findFirst({
                where: { reference_ticket: referenceTicket },
            });
        });
    }
    /**
     * Buscar ticket por token_ticket (validación en entrada)
     */
    findByToken(tokenTicket) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.findFirst({
                where: { token_ticket: tokenTicket },
            });
        });
    }
    /**
     * Buscar todos los tickets de un usuario (Wallet)
     */
    findByCustomer(customerId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.findMany({
                where: Object.assign({ customer_id: customerId }, (status && {
                    status_ticket: Array.isArray(status)
                        ? { in: status }
                        : status,
                })),
                orderBy: { ev_date_event: 'asc' },
            });
        });
    }
    /**
     * Buscar tickets por evento
     */
    findByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.findMany({
                where: { event_id: eventId },
                orderBy: { created_at: 'desc' },
            });
        });
    }
    /**
     * Buscar tickets por transaction_id
     */
    findByTransaction(transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.findMany({
                where: { transaction_id: transactionId },
            });
        });
    }
    /**
     * Actualizar ticket (principalmente para transferencias)
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.update({
                where: { id },
                data,
            });
        });
    }
    /**
     * Marcar ticket como usado
     */
    markAsUsed(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.update({
                where: { id },
                data: {
                    ticket_first_time: 0,
                    status_ticket: client_1.TicketStatus.USED,
                    used_at: new Date(),
                },
            });
        });
    }
    /**
     * Actualizar dueño del ticket (transferencia)
     */
    transferOwnership(id, newCustomerId, newCustomerUid, newCustomerIdPhone, newTokenTicket) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.update({
                where: { id },
                data: {
                    customer_id: newCustomerId,
                    customer_uid: newCustomerUid,
                    customer_ID_phone: newCustomerIdPhone,
                    token_ticket: newTokenTicket,
                    status_ticket: client_1.TicketStatus.TRANSFERRED,
                },
            });
        });
    }
    /**
     * Actualizar status del ticket
     */
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.update({
                where: { id },
                data: { status_ticket: status },
            });
        });
    }
    /**
     * Verificar si un ticket existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.ticket.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Verificar si un reference_ticket ya existe
     */
    referenceExists(referenceTicket) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.ticket.count({
                where: { reference_ticket: referenceTicket },
            });
            return count > 0;
        });
    }
    /**
     * Contar tickets por usuario
     */
    countByCustomer(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.count({
                where: { customer_id: customerId },
            });
        });
    }
    /**
     * Contar tickets por evento y status
     */
    countByEventAndStatus(eventId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.count({
                where: {
                    event_id: eventId,
                    status_ticket: status,
                },
            });
        });
    }
    /**
     * Buscar tickets próximos a vencer (para notificaciones)
     */
    findUpcoming(customerId_1) {
        return __awaiter(this, arguments, void 0, function* (customerId, daysAhead = 7) {
            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(now.getDate() + daysAhead);
            return db_1.prisma.ticket.findMany({
                where: {
                    customer_id: customerId,
                    ev_date_event: {
                        gte: now,
                        lte: futureDate,
                    },
                    status_ticket: {
                        in: [client_1.TicketStatus.PAID, client_1.TicketStatus.ACTIVE],
                    },
                },
                orderBy: { ev_date_event: 'asc' },
            });
        });
    }
    /**
     * Eliminar ticket (soft delete - cambiar status a CANCELED)
     */
    softDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.update({
                where: { id },
                data: {
                    status_ticket: client_1.TicketStatus.CANCELED,
                },
            });
        });
    }
    /**
     * Eliminar ticket permanentemente (solo para testing o admin)
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticket.delete({
                where: { id },
            });
        });
    }
}
exports.TicketRepository = TicketRepository;
