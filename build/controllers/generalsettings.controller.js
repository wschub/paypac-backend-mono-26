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
exports.deleteSetting = exports.updateSetting = exports.getSettingById = exports.getSettingByName = exports.getSettings = exports.createSetting = void 0;
const generalsettings_service_1 = require("../services/generalsettings.service");
const settingsService = new generalsettings_service_1.GeneralSettingsService();
/**
 * POST /api/settings
 * Crear una variable de configuración
 * Requiere: PAYPAC
 */
const createSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, value, description } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield settingsService.createSetting({ name, value, description }, userRole);
        res.status(201).json({
            message: 'Variable de configuración creada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createSetting = createSetting;
/**
 * GET /api/settings
 * Listar todas las variables de configuración
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - search: string (busca en name y description)
 */
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { search } = req.query;
        const result = yield settingsService.getSettings(userRole, {
            search: search,
        });
        res.status(200).json({
            message: 'Variables de configuración obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getSettings = getSettings;
/**
 * GET /api/settings/by-name/:name
 * Obtener variable por nombre (clave única)
 * Requiere: PAYPAC
 */
const getSettingByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const name = String(req.params.name);
        const result = yield settingsService.getSettingByName(name, userRole);
        res.status(200).json({
            message: 'Variable de configuración obtenida exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSettingByName = getSettingByName;
/**
 * GET /api/settings/:id
 * Obtener variable por ID
 * Requiere: PAYPAC
 */
const getSettingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { id } = req.params;
        const result = yield settingsService.getSettingById(Number(id), userRole);
        res.status(200).json({
            message: 'Variable de configuración obtenida exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSettingById = getSettingById;
/**
 * PUT /api/settings/:id
 * Actualizar variable de configuración
 * Requiere: PAYPAC
 */
const updateSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name, value, description } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield settingsService.updateSetting(Number(id), { name, value, description }, userRole);
        res.status(200).json({
            message: 'Variable de configuración actualizada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateSetting = updateSetting;
/**
 * DELETE /api/settings/:id
 * Eliminar variable de configuración
 * Requiere: PAYPAC
 */
const deleteSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield settingsService.deleteSetting(Number(id), userRole);
        res.status(200).json({
            message: 'Variable de configuración eliminada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteSetting = deleteSetting;
