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
exports.deleteSubgenre = exports.updateSubgenre = exports.getSubgenreById = exports.getSubgenresBySubCategory = exports.getSubgenresStats = exports.getSubgenres = exports.createSubgenre = void 0;
const subgenre_service_1 = require("../services/subgenre.service");
const subgenreService = new subgenre_service_1.SubgenreService();
/**
 * POST /api/subgenres
 * Crear un nuevo subgénero
 * Requiere: PAYPAC
 */
const createSubgenre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { subcategory_name, subcategory_id } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield subgenreService.createSubgenre({ subcategory_name, subcategory_id }, userRole);
        res.status(201).json({
            message: 'Subgénero creado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createSubgenre = createSubgenre;
/**
 * GET /api/subgenres
 * Listar subgéneros con filtros opcionales
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string
 * - subcategory_id: number
 * - category_id: number
 * - country_id: number
 */
const getSubgenres = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, subcategory_id, category_id, country_id } = req.query;
        const result = yield subgenreService.getSubgenres({
            search: search,
            subcategory_id: subcategory_id ? Number(subcategory_id) : undefined,
            category_id: category_id ? Number(category_id) : undefined,
            country_id: country_id ? Number(country_id) : undefined,
        });
        res.status(200).json({
            message: 'Subgéneros obtenidos exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getSubgenres = getSubgenres;
/**
 * GET /api/subgenres/stats
 * Estadísticas de subgéneros
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - subcategory_id: number
 * - category_id: number
 * - country_id: number
 */
const getSubgenresStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { subcategory_id, category_id, country_id } = req.query;
        const result = yield subgenreService.getSubgenresStats(userRole, {
            subcategory_id: subcategory_id ? Number(subcategory_id) : undefined,
            category_id: category_id ? Number(category_id) : undefined,
            country_id: country_id ? Number(country_id) : undefined,
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
exports.getSubgenresStats = getSubgenresStats;
/**
 * GET /api/subgenres/by-subcategory/:subcategory_id
 * Subgéneros de una subcategoría específica
 * Acceso: todos los roles autenticados
 */
const getSubgenresBySubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subcategory_id } = req.params;
        const result = yield subgenreService.getSubgenresBySubCategory(Number(subcategory_id));
        res.status(200).json({
            message: 'Subgéneros de la subcategoría obtenidos exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSubgenresBySubCategory = getSubgenresBySubCategory;
/**
 * GET /api/subgenres/:id
 * Obtener subgénero por ID
 * Acceso: todos los roles autenticados
 */
const getSubgenreById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield subgenreService.getSubgenreById(Number(id));
        res.status(200).json({
            message: 'Subgénero obtenido exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSubgenreById = getSubgenreById;
/**
 * PUT /api/subgenres/:id
 * Actualizar subgénero
 * Requiere: PAYPAC
 */
const updateSubgenre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { subcategory_name, subcategory_id } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield subgenreService.updateSubgenre(Number(id), { subcategory_name, subcategory_id }, userRole);
        res.status(200).json({
            message: 'Subgénero actualizado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateSubgenre = updateSubgenre;
/**
 * DELETE /api/subgenres/:id
 * Eliminar subgénero (solo si no tiene eventos asociados)
 * Requiere: PAYPAC
 */
const deleteSubgenre = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield subgenreService.deleteSubgenre(Number(id), userRole);
        res.status(200).json({
            message: 'Subgénero eliminado exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteSubgenre = deleteSubgenre;
