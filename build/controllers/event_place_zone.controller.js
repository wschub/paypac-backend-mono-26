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
exports.deleteZone = exports.updateZone = exports.getZoneById = exports.getZonesByPlace = exports.createZone = void 0;
const event_place_zone_service_1 = require("../services/event_place_zone.service");
const zoneService = new event_place_zone_service_1.EventPlaceZoneService();
/**
 * POST /api/venues/zones
 * Crear zona dentro de un lugar — solo PAYPAC
 */
const createZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield zoneService.createZone(req.body, userRole);
        res.status(201).json({ message: 'Zona creada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createZone = createZone;
/**
 * GET /api/venues/:place_id/zones
 * Zonas de un lugar
 */
const getZonesByPlace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield zoneService.getZonesByPlace(Number(req.params.place_id));
        res.status(200).json({ message: 'Zonas obtenidas exitosamente', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getZonesByPlace = getZonesByPlace;
/**
 * GET /api/venues/zones/:id
 * Zona por ID con filas y conteos
 */
const getZoneById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield zoneService.getZoneById(Number(req.params.id));
        res.status(200).json({ message: 'Zona obtenida exitosamente', data: result });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getZoneById = getZoneById;
/**
 * PUT /api/venues/zones/:id
 * Actualizar zona — solo PAYPAC
 */
const updateZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield zoneService.updateZone(Number(req.params.id), req.body, userRole);
        res.status(200).json({ message: 'Zona actualizada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateZone = updateZone;
/**
 * DELETE /api/venues/zones/:id
 * Eliminar zona — solo PAYPAC (sin filas)
 */
const deleteZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield zoneService.deleteZone(Number(req.params.id), userRole);
        res.status(200).json({ message: 'Zona eliminada exitosamente', data: result });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteZone = deleteZone;
