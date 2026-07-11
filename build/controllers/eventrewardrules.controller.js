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
exports.validateCode = exports.calculateReward = exports.deleteRewardRule = exports.updateRewardRule = exports.getRewardRuleById = exports.getRewardRulesByEventId = exports.createRewardRule = void 0;
const eventrewardrules_service_1 = require("../services/eventrewardrules.service");
const rewardRulesService = new eventrewardrules_service_1.EventRewardRulesService();
/**
 * POST /api/events/:eventId/reward-rules
 * Crear una nueva regla de recompensa
 */
const createRewardRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const eventId = Number(req.params.eventId);
        const data = req.body;
        const rule = yield rewardRulesService.createRewardRule(eventId, data, user.id, user.role);
        res.status(201).json({
            message: 'Regla de recompensa creada exitosamente',
            rule,
        });
    }
    catch (err) {
        console.error('❌ Error en createRewardRule:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.createRewardRule = createRewardRule;
/**
 * GET /api/events/:eventId/reward-rules
 * Obtener todas las reglas de recompensa de un evento
 */
const getRewardRulesByEventId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = Number(req.params.eventId);
        const rules = yield rewardRulesService.getRewardRulesByEventId(eventId);
        res.status(200).json({
            total: rules.length,
            rules,
        });
    }
    catch (err) {
        console.error('❌ Error en getRewardRulesByEventId:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getRewardRulesByEventId = getRewardRulesByEventId;
/**
 * GET /api/reward-rules/:id
 * Obtener una regla específica por ID
 */
const getRewardRuleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = Number(req.params.id);
        const rule = yield rewardRulesService.getRewardRuleById(id);
        res.status(200).json(rule);
    }
    catch (err) {
        console.error('❌ Error en getRewardRuleById:', err);
        res.status(404).json({ error: err.message });
    }
});
exports.getRewardRuleById = getRewardRuleById;
/**
 * PUT /api/reward-rules/:id
 * Actualizar una regla de recompensa
 */
const updateRewardRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        const data = req.body;
        const updatedRule = yield rewardRulesService.updateRewardRule(id, data, user.id, user.role);
        res.status(200).json({
            message: 'Regla de recompensa actualizada exitosamente',
            rule: updatedRule,
        });
    }
    catch (err) {
        console.error('❌ Error en updateRewardRule:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.updateRewardRule = updateRewardRule;
/**
 * DELETE /api/reward-rules/:id
 * Eliminar una regla de recompensa
 */
const deleteRewardRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'No autenticado' });
            return;
        }
        const id = Number(req.params.id);
        yield rewardRulesService.deleteRewardRule(id, user.id, user.role);
        res.status(200).json({
            message: 'Regla de recompensa eliminada exitosamente',
        });
    }
    catch (err) {
        console.error('❌ Error en deleteRewardRule:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.deleteRewardRule = deleteRewardRule;
/**
 * POST /api/reward-rules/calculate
 * Calcular recompensa para una venta (uso interno o testing)
 */
const calculateReward = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { event_id, quantity, total_amount, locality_id } = req.body;
        const result = yield rewardRulesService.calculateReward(event_id, quantity, total_amount, locality_id);
        if (!result) {
            res.status(200).json({
                hasReward: false,
                message: 'No hay reglas de recompensa aplicables para esta venta',
            });
            return;
        }
        res.status(200).json(Object.assign({ hasReward: true }, result));
    }
    catch (err) {
        console.error('❌ Error en calculateReward:', err);
        res.status(400).json({ error: err.message });
    }
});
exports.calculateReward = calculateReward;
/**
 * GET /api/discounts/validate/:code?event_id=123
 */
const validateCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const code = String(req.params.code).toUpperCase().trim();
        const eventId = Number(req.query.event_id);
        if (!eventId) {
            res.status(400).json({ message: 'event_id es requerido' });
            return;
        }
        const result = yield rewardRulesService.validateCode(code, eventId);
        res.status(200).json(result);
    }
    catch (err) {
        console.error('❌ Error en validateCode:', err);
        res.status(400).json({ message: err.message });
    }
});
exports.validateCode = validateCode;
