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
exports.getLocalitiesStats = exports.deleteLocality = exports.updateLocality = exports.getLocalityById = exports.getLocalitiesByEventId = exports.createLocality = void 0;
const eventlocalities_service_1 = require("../services/eventlocalities.service");
const localitiesService = new eventlocalities_service_1.EventLocalitiesService();
/**
 * POST /api/events/:eventId/localities
 * Crear una nueva localidad para un evento
 */
const createLocality = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const data = req.body;
        // Validar colores antes de crear
        localitiesService.validateLocalityData(data);
        const locality = yield localitiesService.createLocality(eventId, data, user.id, user.role);
        res.status(201).json({
            message: 'Localidad creada exitosamente',
            locality,
        });
    }
    catch (err) {
        console.error('❌ Error en createLocality:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.createLocality = createLocality;
/**
 * GET /api/events/:eventId/localities
 * Obtener todas las localidades de un evento
 */
const getLocalitiesByEventId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = Number(req.params.eventId);
        const localities = yield localitiesService.getLocalitiesByEventId(eventId);
        res.status(200).json({
            total: localities.length,
            localities,
        });
    }
    catch (err) {
        console.error('❌ Error en getLocalitiesByEventId:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getLocalitiesByEventId = getLocalitiesByEventId;
/**
 * GET /api/localities/:id
 * Obtener una localidad específica por ID
 */
const getLocalityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const locality = yield localitiesService.getLocalityById(id);
        res.status(200).json(locality);
    }
    catch (err) {
        console.error('❌ Error en getLocalityById:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getLocalityById = getLocalityById;
/**
 * PUT /api/localities/:id
 * Actualizar una localidad
 */
const updateLocality = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const data = req.body;
        // Validar colores antes de actualizar
        localitiesService.validateLocalityData(data);
        const updatedLocality = yield localitiesService.updateLocality(id, data, user.id, user.role);
        res.status(200).json({
            message: 'Localidad actualizada exitosamente',
            locality: updatedLocality,
        });
    }
    catch (err) {
        console.error('❌ Error en updateLocality:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.updateLocality = updateLocality;
/**
 * DELETE /api/localities/:id
 * Eliminar una localidad
 */
const deleteLocality = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        yield localitiesService.deleteLocality(id, user.id, user.role);
        res.status(200).json({
            message: 'Localidad eliminada exitosamente',
        });
    }
    catch (err) {
        console.error('❌ Error en deleteLocality:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.deleteLocality = deleteLocality;
/**
 * GET /api/events/:eventId/localities/stats
 * Obtener estadísticas de localidades de un evento
 */
const getLocalitiesStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = Number(req.params.eventId);
        const stats = yield localitiesService.getLocalitiesStats(eventId);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('❌ Error en getLocalitiesStats:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getLocalitiesStats = getLocalitiesStats;
