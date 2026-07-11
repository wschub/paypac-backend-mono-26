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
exports.InvoiceTicketsService = void 0;
const invoicetickets_repository_1 = require("../repositories/invoicetickets.repository");
const invoice_repository_1 = require("../repositories/invoice.repository");
const invoiceTicketsRepo = new invoicetickets_repository_1.InvoiceTicketsRepository();
const invoiceRepo = new invoice_repository_1.InvoiceRepository();
class InvoiceTicketsService {
    /**
     * Obtener items de una factura
     */
    getInvoiceItems(invoiceId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoice = yield invoiceRepo.findById(invoiceId);
            if (!invoice) {
                throw new Error('Factura no encontrada');
            }
            // Verificar permisos
            const isOwner = invoice.user_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para ver los items de esta factura');
            }
            return invoiceTicketsRepo.findByInvoiceId(invoiceId);
        });
    }
    /**
     * Obtener item por ID
     */
    getItemById(id, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield invoiceTicketsRepo.findById(id);
            if (!item) {
                throw new Error('Item no encontrado');
            }
            // Verificar permisos a través de la factura
            const invoice = yield invoiceRepo.findById(item.invoice_id);
            if (!invoice) {
                throw new Error('Factura asociada no encontrada');
            }
            const isOwner = invoice.user_id === userId;
            const isPaypac = userRole === 'PAYPAC';
            if (!isOwner && !isPaypac) {
                throw new Error('No tienes permisos para ver este item');
            }
            return item;
        });
    }
    /**
     * Obtener tickets vendidos por stage
     */
    getTicketsSoldByStage(stageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return invoiceTicketsRepo.countTicketsByStageId(stageId);
        });
    }
    /**
     * Obtener tickets vendidos por localidad
     */
    getTicketsSoldByLocality(localityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return invoiceTicketsRepo.countTicketsByLocalityId(localityId);
        });
    }
    /**
     * Obtener ingresos por stage
     */
    getRevenueByStage(stageId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            // Solo ORGANIZER o PAYPAC pueden ver ingresos
            if (!['ORGANIZER', 'PAYPAC'].includes(userRole)) {
                throw new Error('No tienes permisos para ver esta información');
            }
            return invoiceTicketsRepo.getRevenueByStageId(stageId);
        });
    }
    /**
     * Obtener resumen de ventas por evento
     */
    getSalesSummaryByEvent(eventId, userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            // Solo ORGANIZER o PAYPAC pueden ver resumen
            if (!['ORGANIZER', 'PAYPAC'].includes(userRole)) {
                throw new Error('No tienes permisos para ver esta información');
            }
            return invoiceTicketsRepo.getSalesSummaryByEvent(eventId);
        });
    }
}
exports.InvoiceTicketsService = InvoiceTicketsService;
