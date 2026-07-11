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
exports.deleteCity = exports.updateCity = exports.getCityById = exports.getCitiesByState = exports.getCitiesByCountry = exports.getCitiesStats = exports.getCities = exports.createCity = void 0;
const cities_service_1 = require("../services/cities.service");
const citiesService = new cities_service_1.CitiesService();
/**
 * POST /api/cities
 * Crear una nueva ciudad
 * Requiere: PAYPAC
 */
const createCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name_city, state_id, country_id, latitude, longitude } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield citiesService.createCity({ name_city, state_id, country_id, latitude, longitude }, userRole);
        res.status(201).json({
            message: 'Ciudad creada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createCity = createCity;
/**
 * GET /api/cities
 * Listar ciudades con filtros opcionales
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string
 * - country_id: number
 * - state_id: number
 */
const getCities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, country_id, state_id } = req.query;
        const filters = {
            search: search,
            country_id: country_id ? Number(country_id) : undefined,
            state_id: state_id ? Number(state_id) : undefined,
        };
        const result = yield citiesService.getCities(filters);
        res.status(200).json({
            message: 'Ciudades obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCities = getCities;
/**
 * GET /api/cities/stats
 * Estadísticas de ciudades
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - country_id: number
 * - state_id: number
 */
const getCitiesStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { country_id, state_id } = req.query;
        const result = yield citiesService.getCitiesStats(userRole, {
            country_id: country_id ? Number(country_id) : undefined,
            state_id: state_id ? Number(state_id) : undefined,
        });
        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCitiesStats = getCitiesStats;
/**
 * GET /api/cities/by-country/:country_id
 * Obtener ciudades de un país directamente (sin pasar por estados)
 * Acceso: todos los roles autenticados
 */
const getCitiesByCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { country_id } = req.params;
        const result = yield citiesService.getCitiesByCountry(Number(country_id));
        res.status(200).json({
            message: 'Ciudades del país obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getCitiesByCountry = getCitiesByCountry;
/**
 * GET /api/cities/by-state/:state_id
 * Obtener ciudades de un estado específico
 * Acceso: todos los roles autenticados
 */
const getCitiesByState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { state_id } = req.params;
        const result = yield citiesService.getCitiesByState(Number(state_id));
        res.status(200).json({
            message: 'Ciudades del estado obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getCitiesByState = getCitiesByState;
/**
 * GET /api/cities/:id
 * Obtener ciudad por ID
 * Acceso: todos los roles autenticados
 */
const getCityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield citiesService.getCityById(Number(id));
        res.status(200).json({
            message: 'Ciudad obtenida exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getCityById = getCityById;
/**
 * PUT /api/cities/:id
 * Actualizar ciudad
 * Requiere: PAYPAC
 */
const updateCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name_city, state_id, country_id, latitude, longitude } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield citiesService.updateCity(Number(id), { name_city, state_id, country_id, latitude, longitude }, userRole);
        res.status(200).json({
            message: 'Ciudad actualizada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateCity = updateCity;
/**
 * DELETE /api/cities/:id
 * Eliminar ciudad
 * Requiere: PAYPAC
 */
const deleteCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield citiesService.deleteCity(Number(id), userRole);
        res.status(200).json({
            message: 'Ciudad eliminada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteCity = deleteCity;
