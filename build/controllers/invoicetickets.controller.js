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
exports.getSalesSummaryByEvent = exports.getRevenueByStage = exports.getTicketsSoldByLocality = exports.getTicketsSoldByStage = exports.getItemById = exports.getInvoiceItems = void 0;
const invoicetickets_service_1 = require("../services/invoicetickets.service");
const invoiceTicketsService = new invoicetickets_service_1.InvoiceTicketsService();
/**
 * GET /api/invoices/:invoiceId/items
 * Obtener items de una factura
 */
const getInvoiceItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const invoiceId = Number(req.params.invoiceId);
        const items = yield invoiceTicketsService.getInvoiceItems(invoiceId, user.id, user.role);
        res.status(200).json({
            total: items.length,
            items,
        });
    }
    catch (err) {
        console.error('❌ Error en getInvoiceItems:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getInvoiceItems = getInvoiceItems;
/**
 * GET /api/invoice-items/:id
 * Obtener item por ID
 */
const getItemById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const item = yield invoiceTicketsService.getItemById(id, user.id, user.role);
        res.status(200).json(item);
    }
    catch (err) {
        console.error('❌ Error en getItemById:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getItemById = getItemById;
/**
 * GET /api/stages/:stageId/tickets-sold
 * Obtener tickets vendidos por stage
 */
const getTicketsSoldByStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stageId = Number(req.params.stageId);
        const count = yield invoiceTicketsService.getTicketsSoldByStage(stageId);
        res.status(200).json({
            stage_id: stageId,
            tickets_sold: count,
        });
    }
    catch (err) {
        console.error('❌ Error en getTicketsSoldByStage:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.getTicketsSoldByStage = getTicketsSoldByStage;
/**
 * GET /api/localities/:localityId/tickets-sold
 * Obtener tickets vendidos por localidad
 */
const getTicketsSoldByLocality = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const localityId = Number(req.params.localityId);
        const count = yield invoiceTicketsService.getTicketsSoldByLocality(localityId);
        res.status(200).json({
            locality_id: localityId,
            tickets_sold: count,
        });
    }
    catch (err) {
        console.error('❌ Error en getTicketsSoldByLocality:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.getTicketsSoldByLocality = getTicketsSoldByLocality;
/**
 * GET /api/stages/:stageId/revenue
 * Obtener ingresos por stage
 */
const getRevenueByStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const stageId = Number(req.params.stageId);
        const revenue = yield invoiceTicketsService.getRevenueByStage(stageId, user.id, user.role);
        res.status(200).json({
            stage_id: stageId,
            total_revenue: revenue,
        });
    }
    catch (err) {
        console.error('❌ Error en getRevenueByStage:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getRevenueByStage = getRevenueByStage;
/**
 * GET /api/events/:eventId/sales-summary
 * Obtener resumen de ventas por evento
 */
const getSalesSummaryByEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const summary = yield invoiceTicketsService.getSalesSummaryByEvent(eventId, user.id, user.role);
        res.status(200).json({
            event_id: eventId,
            by_locality: summary,
        });
    }
    catch (err) {
        console.error('❌ Error en getSalesSummaryByEvent:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getSalesSummaryByEvent = getSalesSummaryByEvent;
