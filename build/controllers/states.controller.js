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
exports.deleteState = exports.updateState = exports.getStateById = exports.getStatesByCountry = exports.getStatesStats = exports.getStates = exports.createState = void 0;
const states_service_1 = require("../services/states.service");
const statesService = new states_service_1.StatesService();
/**
 * POST /api/states
 * Crear un nuevo estado
 * Requiere: PAYPAC
 */
const createState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name_state, country_id } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield statesService.createState({ name_state, country_id }, userRole);
        res.status(201).json({
            message: 'Estado creado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createState = createState;
/**
 * GET /api/states
 * Listar todos los estados
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string (buscar por nombre)
 * - country_id: number (filtrar por país)
 */
const getStates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, country_id } = req.query;
        const filters = {
            search: search,
            country_id: country_id ? Number(country_id) : undefined,
        };
        const result = yield statesService.getStates(filters);
        res.status(200).json({
            message: 'Estados obtenidos exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getStates = getStates;
/**
 * GET /api/states/stats
 * Estadísticas de estados
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - country_id: number (filtrar stats por país)
 */
const getStatesStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { country_id } = req.query;
        const result = yield statesService.getStatesStats(userRole, country_id ? Number(country_id) : undefined);
        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getStatesStats = getStatesStats;
/**
 * GET /api/states/by-country/:country_id
 * Obtener estados de un país con sus ciudades
 * Acceso: todos los roles autenticados
 */
const getStatesByCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { country_id } = req.params;
        const result = yield statesService.getStatesByCountry(Number(country_id));
        res.status(200).json({
            message: 'Estados del país obtenidos exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getStatesByCountry = getStatesByCountry;
/**
 * GET /api/states/:id
 * Obtener estado por ID con ciudades incluidas
 * Acceso: todos los roles autenticados
 */
const getStateById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield statesService.getStateById(Number(id));
        res.status(200).json({
            message: 'Estado obtenido exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getStateById = getStateById;
/**
 * PUT /api/states/:id
 * Actualizar estado
 * Requiere: PAYPAC
 */
const updateState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name_state, country_id } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield statesService.updateState(Number(id), { name_state, country_id }, userRole);
        res.status(200).json({
            message: 'Estado actualizado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateState = updateState;
/**
 * DELETE /api/states/:id
 * Eliminar estado (solo si no tiene ciudades asociadas)
 * Requiere: PAYPAC
 */
const deleteState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield statesService.deleteState(Number(id), userRole);
        res.status(200).json({
            message: 'Estado eliminado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteState = deleteState;
