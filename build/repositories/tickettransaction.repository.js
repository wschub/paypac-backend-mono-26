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
exports.TicketTransactionRepository = void 0;
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
class TicketTransactionRepository {
    /**
     * Crear una nueva transacción de ticket
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.create({
                data,
            });
        });
    }
    /**
     * Buscar transacción por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.findUnique({
                where: { id },
            });
        });
    }
    /**
     * Buscar transacciones por ticket_id
     */
    findByTicket(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.findMany({
                where: { ticket_id: ticketId },
                orderBy: { created_at: 'desc' },
            });
        });
    }
    /**
     * Buscar transacciones pendientes para un usuario (receptor)
     */
    findPendingForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.findMany({
                where: {
                    to_customer_id: userId,
                    status_ticket: {
                        in: [client_1.TransactionStatus.PENDING, client_1.TransactionStatus.FROZEN],
                    },
                },
                orderBy: { created_at: 'desc' },
            });
        });
    }
    /**
     * Buscar historial de transacciones de un usuario (enviadas y recibidas)
     */
    findUserHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.findMany({
                where: {
                    OR: [
                        { from_customer_id: userId },
                        { to_customer_id: userId },
                    ],
                },
                orderBy: { created_at: 'desc' },
            });
        });
    }
    /**
     * Buscar transacciones enviadas por un usuario
     */
    findSentByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.findMany({
                where: { from_customer_id: userId },
                orderBy: { created_at: 'desc' },
            });
        });
    }
    /**
     * Buscar transacciones recibidas por un usuario
     */
    findReceivedByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.findMany({
                where: { to_customer_id: userId },
                orderBy: { created_at: 'desc' },
            });
        });
    }
    /**
     * Actualizar transacción
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.update({
                where: { id },
                data,
            });
        });
    }
    /**
     * Actualizar status de la transacción
     */
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.update({
                where: { id },
                data: { status_ticket: status },
            });
        });
    }
    /**
     * Completar transacción
     */
    complete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.update({
                where: { id },
                data: {
                    status_ticket: client_1.TransactionStatus.COMPLETED,
                    completed_at: new Date(),
                },
            });
        });
    }
    /**
     * Cancelar transacción
     */
    cancel(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.update({
                where: { id },
                data: {
                    status_ticket: client_1.TransactionStatus.CANCELLED,
                },
            });
        });
    }
    /**
     * Verificar si existe una transacción
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.ticketTransaction.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Contar transacciones pendientes de un usuario
     */
    countPendingForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.count({
                where: {
                    to_customer_id: userId,
                    status_ticket: {
                        in: [client_1.TransactionStatus.PENDING, client_1.TransactionStatus.FROZEN],
                    },
                },
            });
        });
    }
    /**
     * Buscar transacciones por tipo
     */
    findByType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.findMany({
                where: { type_transaction: type },
                orderBy: { created_at: 'desc' },
            });
        });
    }
    /**
     * Eliminar transacción (solo para admin/testing)
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.ticketTransaction.delete({
                where: { id },
            });
        });
    }
}
exports.TicketTransactionRepository = TicketTransactionRepository;
