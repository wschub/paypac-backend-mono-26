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
exports.TransactionRepository = void 0;
const db_1 = require("../config/db");
class TransactionRepository {
    //test dlete 
    // transaction.repository.ts
    /**
     * Crear una nueva transacción
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.create({
                data,
            });
        });
    }
    /**
     * Buscar transacción por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.findUnique({
                where: { id },
            });
        });
    }
    /**
     * Buscar transacción por reference (num_invoice)
     */
    findByReference(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.findFirst({
                where: { reference },
            });
        });
    }
    /**
     * Buscar transacciones de un usuario
     */
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
            });
        });
    }
    /**
     * Todas las transacciones
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.findMany({
                orderBy: { created_at: 'desc' },
            });
        });
    }
    /**
     * Buscar transacción por invoice_id
     */
    findByInvoiceId(invoiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.findFirst({
                where: { invoice_id: invoiceId },
            });
        });
    }
    /**
     * Actualizar transacción
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.update({
                where: { id },
                data,
            });
        });
    }
    /**
     * Actualizar status de la transacción
     */
    updateStatus(id, status, statusMessage, finalizedAt, extra) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.update({
                where: { id },
                data: Object.assign(Object.assign(Object.assign({ status, status_message: statusMessage, finalized_at: finalizedAt !== null && finalizedAt !== void 0 ? finalizedAt : new Date() }, ((extra === null || extra === void 0 ? void 0 : extra.payment_method) !== undefined && { payment_method: extra.payment_method })), ((extra === null || extra === void 0 ? void 0 : extra.customer_data) !== undefined && { customer_data: extra.customer_data })), ((extra === null || extra === void 0 ? void 0 : extra.meta) !== undefined && { meta: extra.meta })),
            });
        });
    }
    /**
     * Verificar si existe una transacción
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.transactions.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Contar transacciones por usuario
     */
    countByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.count({
                where: { user_id: userId },
            });
        });
    }
    /**
     * Obtener transacciones por status
     */
    findByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.transactions.findMany({
                where: { status },
                orderBy: { created_at: 'desc' },
            });
        });
    }
}
exports.TransactionRepository = TransactionRepository;
