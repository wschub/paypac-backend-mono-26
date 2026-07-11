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
exports.getEventInvoiceStats = exports.cancelInvoice = exports.updateInvoiceStatus = exports.getEventInvoices = exports.getMyInvoices = exports.getInvoiceById = exports.createInvoice = void 0;
const invoice_service_1 = require("../services/invoice.service");
const invoiceService = new invoice_service_1.InvoiceService();
/**
 * POST /api/invoices
 * Crear una nueva factura
 */
const createInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const data = req.body;
        const result = yield invoiceService.createInvoice(user.id, data);
        res.status(201).json(Object.assign({ message: 'Factura creada exitosamente' }, result));
    }
    catch (err) {
        console.error('❌ Error en createInvoice:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.createInvoice = createInvoice;
/**
 * GET /api/invoices/:id
 * Obtener factura por ID
 */
const getInvoiceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const result = yield invoiceService.getInvoiceById(id, user.id, user.role);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Error en getInvoiceById:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getInvoiceById = getInvoiceById;
/**
 * GET /api/invoices/my-invoices
 * Obtener facturas del usuario autenticado
 */
const getMyInvoices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const invoices = yield invoiceService.getMyInvoices(user.id);
        res.status(200).json({
            total: invoices.length,
            invoices,
        });
    }
    catch (err) {
        console.error('❌ Error en getMyInvoices:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getMyInvoices = getMyInvoices;
/**
 * GET /api/events/:eventId/invoices
 * Obtener facturas de un evento
 */
const getEventInvoices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const invoices = yield invoiceService.getEventInvoices(eventId, user.id, user.role);
        res.status(200).json({
            total: invoices.length,
            invoices,
        });
    }
    catch (err) {
        console.error('❌ Error en getEventInvoices:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getEventInvoices = getEventInvoices;
/**
 * PATCH /api/invoices/:id/status
 * Actualizar estado de factura
 * (Usado internamente por webhook de pago)
 */
const updateInvoiceStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const { status, transaction_id, customer_phone } = req.body;
        const invoice = yield invoiceService.updateInvoiceStatus(id, transaction_id, status, customer_phone);
        res.status(200).json({
            message: 'Estado de factura actualizado',
            invoice,
        });
    }
    catch (err) {
        console.error('❌ Error en updateInvoiceStatus:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.updateInvoiceStatus = updateInvoiceStatus;
/**
 * PATCH /api/invoices/:id/cancel
 * Cancelar factura
 */
const cancelInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const invoice = yield invoiceService.cancelInvoice(id, user.id, user.role);
        res.status(200).json({
            message: 'Factura cancelada exitosamente',
            invoice,
        });
    }
    catch (err) {
        console.error('❌ Error en cancelInvoice:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.cancelInvoice = cancelInvoice;
/**
 * GET /api/events/:eventId/invoices/stats
 * Obtener estadísticas de facturas de un evento
 */
const getEventInvoiceStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const stats = yield invoiceService.getEventInvoiceStats(eventId, user.id, user.role);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('❌ Error en getEventInvoiceStats:', err);
        res.status(403).json({ error: err.message });
    }
});
exports.getEventInvoiceStats = getEventInvoiceStats;
