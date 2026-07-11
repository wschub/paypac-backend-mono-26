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
exports.deleteCountry = exports.updateCountry = exports.getCountryById = exports.getCountriesStats = exports.getCountriesWithRelations = exports.getCountries = exports.createCountry = void 0;
const countries_service_1 = require("../services/countries.service");
const countriesService = new countries_service_1.CountriesService();
/**
 * POST /api/countries
 * Crear un nuevo país
 * Requiere: PAYPAC
 */
const createCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name_country, code, phone_code, currency, language_default } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield countriesService.createCountry({
            name_country,
            code,
            phone_code,
            currency,
            language_default,
        }, userRole);
        res.status(201).json({
            message: 'País creado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createCountry = createCountry;
/**
 * GET /api/countries
 * Listar todos los países
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - search: string (buscar por nombre o código)
 * - code: string (filtrar por código ISO)
 */
const getCountries = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, code } = req.query;
        const filters = {
            search: search,
            code: code,
        };
        const result = yield countriesService.getCountries(filters);
        res.status(200).json({
            message: 'Países obtenidos exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCountries = getCountries;
/**
 * GET /api/countries/with-relations
 * Listar países con estados y ciudades
 * Requiere: PAYPAC
 */
const getCountriesWithRelations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield countriesService.getCountriesWithRelations();
        res.status(200).json({
            message: 'Países con relaciones obtenidos exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCountriesWithRelations = getCountriesWithRelations;
/**
 * GET /api/countries/stats
 * Obtener estadísticas de países
 * Requiere: PAYPAC
 */
const getCountriesStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield countriesService.getCountriesStats(userRole);
        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCountriesStats = getCountriesStats;
/**
 * GET /api/countries/:id
 * Obtener país por ID
 * Requiere: PAYPAC
 */
const getCountryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield countriesService.getCountryById(Number(id));
        res.status(200).json({
            message: 'País obtenido exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getCountryById = getCountryById;
/**
 * PUT /api/countries/:id
 * Actualizar país
 * Requiere: PAYPAC
 */
const updateCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name_country, code, phone_code, currency, language_default } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield countriesService.updateCountry(Number(id), {
            name_country,
            code,
            phone_code,
            currency,
            language_default,
        }, userRole);
        res.status(200).json({
            message: 'País actualizado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateCountry = updateCountry;
/**
 * DELETE /api/countries/:id
 * Eliminar país
 * Requiere: PAYPAC
 */
const deleteCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield countriesService.deleteCountry(Number(id), userRole);
        res.status(200).json({
            message: 'País eliminado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteCountry = deleteCountry;
