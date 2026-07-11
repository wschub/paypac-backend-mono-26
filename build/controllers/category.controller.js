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
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategoriesByCountry = exports.getCategoriesStats = exports.getCategories = exports.createCategory = void 0;
const category_service_1 = require("../services/category.service");
const categoryService = new category_service_1.CategoryService();
/**
 * POST /api/categories
 * Crear una nueva categoría
 * Requiere: PAYPAC
 */
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { category_name, category_icon, country_id } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield categoryService.createCategory({ category_name, category_icon, country_id }, userRole);
        res.status(201).json({
            message: 'Categoría creada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createCategory = createCategory;
/**
 * GET /api/categories
 * Listar categorías con filtros opcionales
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string
 * - country_id: number
 */
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, country_id } = req.query;
        const result = yield categoryService.getCategories({
            search: search,
            country_id: country_id ? Number(country_id) : undefined,
        });
        res.status(200).json({
            message: 'Categorías obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCategories = getCategories;
/**
 * GET /api/categories/stats
 * Estadísticas de categorías
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - country_id: number
 */
const getCategoriesStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { country_id } = req.query;
        const result = yield categoryService.getCategoriesStats(userRole, country_id ? Number(country_id) : undefined);
        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getCategoriesStats = getCategoriesStats;
/**
 * GET /api/categories/by-country/:country_id
 * Categorías de un país con subcategorías y subgéneros anidados
 * Acceso: todos los roles autenticados
 */
const getCategoriesByCountry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { country_id } = req.params;
        const result = yield categoryService.getCategoriesByCountry(Number(country_id));
        res.status(200).json({
            message: 'Categorías del país obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getCategoriesByCountry = getCategoriesByCountry;
/**
 * GET /api/categories/:id
 * Obtener categoría por ID con jerarquía completa (subcategorías → subgéneros)
 * Acceso: todos los roles autenticados
 */
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield categoryService.getCategoryById(Number(id));
        res.status(200).json({
            message: 'Categoría obtenida exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getCategoryById = getCategoryById;
/**
 * PUT /api/categories/:id
 * Actualizar categoría
 * Requiere: PAYPAC
 */
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { category_name, category_icon, country_id } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield categoryService.updateCategory(Number(id), { category_name, category_icon, country_id }, userRole);
        res.status(200).json({
            message: 'Categoría actualizada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateCategory = updateCategory;
/**
 * DELETE /api/categories/:id
 * Eliminar categoría (solo si no tiene subcategorías ni eventos)
 * Requiere: PAYPAC
 */
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield categoryService.deleteCategory(Number(id), userRole);
        res.status(200).json({
            message: 'Categoría eliminada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteCategory = deleteCategory;
