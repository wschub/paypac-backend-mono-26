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
exports.checkAvailability = exports.getPriceStats = exports.getUpcomingStages = exports.getActiveStage = exports.deleteStage = exports.updateStage = exports.getStageById = exports.getStagesByLocalityId = exports.createStage = void 0;
const eventstages_service_1 = require("../services/eventstages.service");
const stagesService = new eventstages_service_1.EventStagesService();
/**
 * POST /api/localities/:localityId/stages
 * Crear una nueva etapa para una localidad
 */
const createStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const localityId = Number(req.params.localityId);
        const data = req.body;
        const stage = yield stagesService.createStage(localityId, data, user.id, user.role);
        res.status(201).json({
            message: 'Etapa creada exitosamente',
            stage,
        });
    }
    catch (err) {
        console.error('❌ Error en createStage:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.createStage = createStage;
/**
 * GET /api/localities/:localityId/stages
 * Obtener todas las etapas de una localidad
 */
const getStagesByLocalityId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const localityId = Number(req.params.localityId);
        const stages = yield stagesService.getStagesByLocalityId(localityId);
        res.status(200).json({
            total: stages.length,
            stages,
        });
    }
    catch (err) {
        console.error('❌ Error en getStagesByLocalityId:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getStagesByLocalityId = getStagesByLocalityId;
/**
 * GET /api/stages/:id
 * Obtener una etapa específica por ID
 */
const getStageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const stage = yield stagesService.getStageById(id);
        res.status(200).json(stage);
    }
    catch (err) {
        console.error('❌ Error en getStageById:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getStageById = getStageById;
/**
 * PUT /api/stages/:id
 * Actualizar una etapa
 */
const updateStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const data = req.body;
        const updatedStage = yield stagesService.updateStage(id, data, user.id, user.role);
        res.status(200).json({
            message: 'Etapa actualizada exitosamente',
            stage: updatedStage,
        });
    }
    catch (err) {
        console.error('❌ Error en updateStage:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.updateStage = updateStage;
/**
 * DELETE /api/stages/:id
 * Eliminar una etapa
 */
const deleteStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        yield stagesService.deleteStage(id, user.id, user.role);
        res.status(200).json({
            message: 'Etapa eliminada exitosamente',
        });
    }
    catch (err) {
        console.error('❌ Error en deleteStage:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.deleteStage = deleteStage;
/**
 * GET /api/localities/:localityId/stages/active
 * Obtener la etapa activa actual de una localidad
 */
const getActiveStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const localityId = Number(req.params.localityId);
        const result = yield stagesService.getActiveStage(localityId);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Error en getActiveStage:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getActiveStage = getActiveStage;
/**
 * GET /api/localities/:localityId/stages/upcoming
 * Obtener próximas etapas de una localidad
 */
const getUpcomingStages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const localityId = Number(req.params.localityId);
        const stages = yield stagesService.getUpcomingStages(localityId);
        res.status(200).json({
            total: stages.length,
            upcoming_stages: stages,
        });
    }
    catch (err) {
        console.error('❌ Error en getUpcomingStages:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getUpcomingStages = getUpcomingStages;
/**
 * GET /api/localities/:localityId/stages/price-stats
 * Obtener estadísticas de precios de una localidad
 */
const getPriceStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const localityId = Number(req.params.localityId);
        const stats = yield stagesService.getPriceStats(localityId);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('❌ Error en getPriceStats:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.getPriceStats = getPriceStats;
/**
 * GET /api/stages/:id/availability
 * Verificar disponibilidad de una etapa
 */
const checkAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const availability = yield stagesService.checkAvailability(id);
        res.status(200).json(availability);
    }
    catch (err) {
        console.error('❌ Error en checkAvailability:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.checkAvailability = checkAvailability;
