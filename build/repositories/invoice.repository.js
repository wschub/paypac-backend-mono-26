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
exports.InvoiceRepository = void 0;
const db_1 = require("../config/db");
const client_1 = require("@prisma/client");
class InvoiceRepository {
    /**
     * Crear una nueva factura
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.create({
                data,
            });
        });
    }
    /**
     * Buscar factura por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.findUnique({
                where: { id },
            });
        });
    }
    /**
     * Buscar factura por número de factura
     */
    findByInvoiceNumber(numInvoice) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.findFirst({
                where: { num_invoice: numInvoice },
            });
        });
    }
    /**
     * Obtener todas las facturas de un usuario
     */
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.findMany({
                where: { user_id: userId },
                orderBy: { id: 'desc' },
            });
        });
    }
    /**
     * Obtener facturas de un usuario por UID
     */
    findByUserUid(userUid) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.findMany({
                where: { user_uid: userUid },
                orderBy: { id: 'desc' },
            });
        });
    }
    /**
     * Obtener facturas de un evento
     */
    findByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.findMany({
                where: { event_id: eventId },
                orderBy: { id: 'desc' },
            });
        });
    }
    /**
     * Obtener facturas por estado
     */
    findByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.findMany({
                where: { status },
                orderBy: { id: 'desc' },
            });
        });
    }
    /**
     * Actualizar factura
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.update({
                where: { id },
                data,
            });
        });
    }
    /**
     * Eliminar factura
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.delete({
                where: { id },
            });
        });
    }
    /**
     * Contar facturas de un usuario
     */
    countByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.count({
                where: { user_id: userId },
            });
        });
    }
    /**
     * Contar facturas de un evento
     */
    countByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoice.count({
                where: { event_id: eventId },
            });
        });
    }
    /**
     * Obtener estadísticas de facturas de un evento
     */
    getEventInvoiceStats(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoices = yield this.findByEventId(eventId);
            const stats = {
                total_invoices: invoices.length,
                by_status: {
                    ISSUED: invoices.filter(i => i.status === client_1.InvoiceStatus.ISSUED).length,
                    PROCESSING: invoices.filter(i => i.status === client_1.InvoiceStatus.PROCESSING).length,
                    PAID: invoices.filter(i => i.status === client_1.InvoiceStatus.PAID).length,
                    PENDING: invoices.filter(i => i.status === client_1.InvoiceStatus.PENDING).length,
                    REJECTED: invoices.filter(i => i.status === client_1.InvoiceStatus.REJECTED).length,
                    CANCELED: invoices.filter(i => i.status === client_1.InvoiceStatus.CANCELED).length,
                },
                total_revenue: invoices
                    .filter(i => i.status === client_1.InvoiceStatus.PAID)
                    .reduce((sum, i) => sum + i.total, 0),
                total_tickets_sold: invoices
                    .filter(i => i.status === client_1.InvoiceStatus.PAID)
                    .reduce((sum, i) => sum + i.num_items, 0),
            };
            return stats;
        });
    }
    /**
     * Verificar si existe factura
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.invoice.count({
                where: { id },
            });
            return count > 0;
        });
    }
    /**
     * Generar número de factura único
     */
    generateInvoiceNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `INV-${timestamp}-${random}`;
        });
    }
}
exports.InvoiceRepository = InvoiceRepository;
