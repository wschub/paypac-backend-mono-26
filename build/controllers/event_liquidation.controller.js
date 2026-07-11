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
exports.deleteLiquidation = exports.getMyBalance = exports.updateLiquidationStatus = exports.getLiquidationById = exports.getLiquidations = exports.createLiquidation = void 0;
const event_liquidation_service_1 = require("../services/event_liquidation.service");
const liquidationService = new event_liquidation_service_1.EventLiquidationService();
const createLiquidation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield liquidationService.createLiquidation(req.body, req.user.role);
        res.status(201).json({ message: 'Liquidación creada exitosamente', liquidation: result });
    }
    catch (err) {
        const status = err.message.includes('Solo PAYPAC') ? 403
            : err.message.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.createLiquidation = createLiquidation;
const getLiquidations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { status, event_id, from, to } = req.query;
        const filters = {
            status: status,
            event_id: event_id ? Number(event_id) : undefined,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        };
        // ORGANIZER solo ve las suyas
        if (user.role === 'ORGANIZER')
            filters.company_id = user.company_id;
        const liquidations = yield liquidationService.getLiquidations(filters, user.role, user.id);
        res.status(200).json({ total: liquidations.length, liquidations });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getLiquidations = getLiquidations;
const getLiquidationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = req.user;
        const result = yield liquidationService.getLiquidationById(Number(req.params.id), user.role, (_a = user.company_id) !== null && _a !== void 0 ? _a : undefined);
        res.status(200).json(result);
    }
    catch (err) {
        const status = err.message.includes('no encontrada') ? 404
            : err.message.includes('permisos') ? 403 : 500;
        res.status(status).json({ message: err.message });
    }
});
exports.getLiquidationById = getLiquidationById;
const updateLiquidationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield liquidationService.updateStatus(Number(req.params.id), req.body.status, req.user.role);
        res.status(200).json({ message: 'Estado actualizado exitosamente', liquidation: result });
    }
    catch (err) {
        const status = err.message.includes('Solo PAYPAC') ? 403
            : err.message.includes('no encontrada') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.updateLiquidationStatus = updateLiquidationStatus;
const getMyBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { from, to } = req.query;
        const result = yield liquidationService.getMyBalance(user.company_id, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getMyBalance = getMyBalance;
const deleteLiquidation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield liquidationService.deleteLiquidation(Number(req.params.id), req.user.role);
        res.status(200).json({ message: 'Liquidación eliminada exitosamente' });
    }
    catch (err) {
        const status = err.message.includes('Solo PAYPAC') ? 403
            : err.message.includes('no encontrada') ? 404 : 400;
        res.status(status).json({ message: err.message });
    }
});
exports.deleteLiquidation = deleteLiquidation;
