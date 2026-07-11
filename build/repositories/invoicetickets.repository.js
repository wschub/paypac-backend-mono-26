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
exports.InvoiceTicketsRepository = void 0;
const db_1 = require("../config/db");
class InvoiceTicketsRepository {
    /**
     * Crear un nuevo item de factura
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoiceTickets.create({
                data,
            });
        });
    }
    /**
     * Crear múltiples items de factura en lote
     */
    createMany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.invoiceTickets.createMany({
                data,
            });
            return result.count;
        });
    }
    /**
     * Buscar item por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoiceTickets.findUnique({
                where: { id },
            });
        });
    }
    /**
     * Obtener todos los items de una factura
     */
    findByInvoiceId(invoiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoiceTickets.findMany({
                where: { invoice_id: invoiceId },
                orderBy: { id: 'asc' },
            });
        });
    }
    /**
     * Obtener items por stage
     */
    findByStageId(stageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoiceTickets.findMany({
                where: { stage_id: stageId },
                orderBy: { purchase_date: 'desc' },
            });
        });
    }
    /**
     * Obtener items por localidad
     */
    findByLocalityId(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoiceTickets.findMany({
                where: { locality_id: localityId },
                orderBy: { purchase_date: 'desc' },
            });
        });
    }
    /**
     * Actualizar item
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoiceTickets.update({
                where: { id },
                data,
            });
        });
    }
    /**
     * Actualizar múltiples items (cuando se paga la factura)
     */
    updateManyByInvoiceId(invoiceId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.invoiceTickets.updateMany({
                where: { invoice_id: invoiceId },
                data,
            });
            return result.count;
        });
    }
    /**
     * Eliminar item
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.invoiceTickets.delete({
                where: { id },
            });
        });
    }
    /**
     * Eliminar todos los items de una factura
     */
    deleteByInvoiceId(invoiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.prisma.invoiceTickets.deleteMany({
                where: { invoice_id: invoiceId },
            });
            return result.count;
        });
    }
    /**
     * Contar tickets vendidos por stage
     */
    countTicketsByStageId(stageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield this.findByStageId(stageId);
            return items
                .filter(item => item.status_item === 1) // Solo tickets expedidos (pagados)
                .reduce((sum, item) => sum + item.qty_tickets, 0);
        });
    }
    /**
     * Contar tickets vendidos por localidad
     */
    countTicketsByLocalityId(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield this.findByLocalityId(localityId);
            return items
                .filter(item => item.status_item === 1)
                .reduce((sum, item) => sum + item.qty_tickets, 0);
        });
    }
    /**
     * Calcular ingresos por stage
     */
    getRevenueByStageId(stageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield this.findByStageId(stageId);
            return items
                .filter(item => item.status_item === 1)
                .reduce((sum, item) => sum + item.total_ticket_paid, 0);
        });
    }
    /**
     * Verificar si existe item
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.invoiceTickets.count({
                where: { id },
            });
            return count > 0;
        });
    }
    countTotalTicketsSoldByEventId(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield db_1.prisma.invoiceTickets.aggregate({
                where: {
                    invoice: { event_id: eventId, status: 'PAID' },
                    status_item: 1,
                },
                _sum: { qty_tickets: true },
            });
            return (_a = result._sum.qty_tickets) !== null && _a !== void 0 ? _a : 0;
        });
    }
    /**
     * Obtener resumen de ventas por localidad de un evento
     */
    getSalesSummaryByEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Obtener todas las facturas pagadas del evento
            const invoices = yield db_1.prisma.invoice.findMany({
                where: {
                    event_id: eventId,
                    status: 'PAID',
                },
                select: { id: true },
            });
            const invoiceIds = invoices.map(inv => inv.id);
            // Obtener todos los items de esas facturas
            const items = yield db_1.prisma.invoiceTickets.findMany({
                where: {
                    invoice_id: { in: invoiceIds },
                    status_item: 1, // Expedido
                },
            });
            // Agrupar por localidad
            const byLocality = items.reduce((acc, item) => {
                const key = item.locality_id;
                if (!acc[key]) {
                    acc[key] = {
                        locality_id: item.locality_id,
                        locality_name: item.locality_name,
                        total_tickets: 0,
                        total_revenue: 0,
                    };
                }
                acc[key].total_tickets += item.qty_tickets;
                acc[key].total_revenue += item.total_ticket_paid;
                return acc;
            }, {});
            return Object.values(byLocality);
        });
    }
}
exports.InvoiceTicketsRepository = InvoiceTicketsRepository;
