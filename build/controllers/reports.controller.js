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
exports.getIntelligenceReport = exports.getSalesReport = exports.getLiquidationReport = exports.getRiskReport = exports.getExpansionReport = exports.getEventsPortfolioReport = exports.getOrganizersReport = exports.getFinancialReport = void 0;
const reports_service_1 = require("../services/reports.service");
const reportsService = new reports_service_1.ReportsService();
const getRange = (req) => ({
    rangeKey: req.query.range || 'month',
    from: req.query.from,
    to: req.query.to,
});
// ── PAYPAC ────────────────────────────────────────────────────────────────────
const getFinancialReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rangeKey, from, to } = getRange(req);
        const data = yield reportsService.getFinancialReport(rangeKey, from, to);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getFinancialReport = getFinancialReport;
const getOrganizersReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rangeKey, from, to } = getRange(req);
        const data = yield reportsService.getOrganizersReport(rangeKey, from, to);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getOrganizersReport = getOrganizersReport;
const getEventsPortfolioReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rangeKey, from, to } = getRange(req);
        const data = yield reportsService.getEventsPortfolioReport(rangeKey, from, to);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getEventsPortfolioReport = getEventsPortfolioReport;
const getExpansionReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield reportsService.getExpansionReport();
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getExpansionReport = getExpansionReport;
const getRiskReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rangeKey, from, to } = getRange(req);
        const data = yield reportsService.getRiskReport(rangeKey, from, to);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getRiskReport = getRiskReport;
// ── ORGANIZER ─────────────────────────────────────────────────────────────────
const getLiquidationReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rangeKey, from, to } = getRange(req);
        const event_id = Number(req.query.event_id);
        if (!event_id) {
            res.status(400).json({ message: 'event_id es requerido' });
            return;
        }
        const data = yield reportsService.getLiquidationReport(req.user.id, event_id, rangeKey, from, to);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getLiquidationReport = getLiquidationReport;
const getSalesReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rangeKey, from, to } = getRange(req);
        const event_id = Number(req.query.event_id);
        const granularity = req.query.granularity || 'day';
        const date = req.query.date;
        if (!event_id) {
            res.status(400).json({ message: 'event_id es requerido' });
            return;
        }
        const data = yield reportsService.getSalesReport(req.user.id, event_id, rangeKey, granularity, from, to, date);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getSalesReport = getSalesReport;
const getIntelligenceReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const event_id = Number(req.query.event_id);
        if (!event_id) {
            res.status(400).json({ message: 'event_id es requerido' });
            return;
        }
        const data = yield reportsService.getIntelligenceReport(event_id);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getIntelligenceReport = getIntelligenceReport;
