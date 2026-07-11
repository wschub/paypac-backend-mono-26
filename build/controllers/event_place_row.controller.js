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
exports.deleteRow = exports.updateRow = exports.getRowById = exports.getRowsByZone = exports.createRow = void 0;
const event_place_row_service_1 = require("../services/event_place_row.service");
const rowService = new event_place_row_service_1.EventPlaceRowService();
/**
 * POST /api/venues/rows
 * Crear fila dentro de una zona — solo PAYPAC
 */
const createRow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield rowService.createRow(req.body, userRole);
        res.status(201).json({ message: 'Fila creada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createRow = createRow;
/**
 * GET /api/venues/zones/:zone_id/rows
 * Filas de una zona con conteo de sillas
 */
const getRowsByZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield rowService.getRowsByZone(Number(req.params.zone_id));
        res.status(200).json({ message: 'Filas obtenidas exitosamente', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getRowsByZone = getRowsByZone;
/**
 * GET /api/venues/rows/:id
 * Fila por ID con sillas incluidas
 */
const getRowById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield rowService.getRowById(Number(req.params.id));
        res.status(200).json({ message: 'Fila obtenida exitosamente', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getRowById = getRowById;
/**
 * PUT /api/venues/rows/:id
 * Actualizar fila — solo PAYPAC
 */
const updateRow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield rowService.updateRow(Number(req.params.id), req.body, userRole);
        res.status(200).json({ message: 'Fila actualizada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateRow = updateRow;
/**
 * DELETE /api/venues/rows/:id
 * Eliminar fila — solo PAYPAC (sin sillas)
 */
const deleteRow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield rowService.deleteRow(Number(req.params.id), userRole);
        res.status(200).json({ message: 'Fila eliminada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteRow = deleteRow;
