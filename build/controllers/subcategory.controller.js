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
exports.deleteSubCategory = exports.updateSubCategory = exports.getSubCategoryById = exports.getSubCategoriesByCategory = exports.getSubCategoriesStats = exports.getSubCategories = exports.createSubCategory = void 0;
const subcategory_service_1 = require("../services/subcategory.service");
const subCategoryService = new subcategory_service_1.SubCategoryService();
/**
 * POST /api/subcategories
 * Crear una nueva subcategoría
 * Requiere: PAYPAC
 */
const createSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { subcategory_name, category_id } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield subCategoryService.createSubCategory({ subcategory_name, category_id }, userRole);
        res.status(201).json({
            message: 'Subcategoría creada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.createSubCategory = createSubCategory;
/**
 * GET /api/subcategories
 * Listar subcategorías con filtros opcionales
 * Acceso: todos los roles autenticados
 *
 * Query params opcionales:
 * - search: string
 * - category_id: number
 * - country_id: number
 */
const getSubCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, category_id, country_id } = req.query;
        const result = yield subCategoryService.getSubCategories({
            search: search,
            category_id: category_id ? Number(category_id) : undefined,
            country_id: country_id ? Number(country_id) : undefined,
        });
        res.status(200).json({
            message: 'Subcategorías obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getSubCategories = getSubCategories;
/**
 * GET /api/subcategories/stats
 * Estadísticas de subcategorías
 * Requiere: PAYPAC
 *
 * Query params opcionales:
 * - category_id: number
 * - country_id: number
 */
const getSubCategoriesStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const { category_id, country_id } = req.query;
        const result = yield subCategoryService.getSubCategoriesStats(userRole, {
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
exports.getSubCategoriesStats = getSubCategoriesStats;
/**
 * GET /api/subcategories/by-category/:category_id
 * Subcategorías de una categoría con sus subgéneros anidados
 * Acceso: todos los roles autenticados
 */
const getSubCategoriesByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.params;
        const result = yield subCategoryService.getSubCategoriesByCategory(Number(category_id));
        res.status(200).json({
            message: 'Subcategorías de la categoría obtenidas exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSubCategoriesByCategory = getSubCategoriesByCategory;
/**
 * GET /api/subcategories/:id
 * Obtener subcategoría por ID con subgéneros
 * Acceso: todos los roles autenticados
 */
const getSubCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield subCategoryService.getSubCategoryById(Number(id));
        res.status(200).json({
            message: 'Subcategoría obtenida exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(404).json({ message: err.message });
    }
});
exports.getSubCategoryById = getSubCategoryById;
/**
 * PUT /api/subcategories/:id
 * Actualizar subcategoría
 * Requiere: PAYPAC
 */
const updateSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { subcategory_name, category_id } = req.body;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield subCategoryService.updateSubCategory(Number(id), { subcategory_name, category_id }, userRole);
        res.status(200).json({
            message: 'Subcategoría actualizada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateSubCategory = updateSubCategory;
/**
 * DELETE /api/subcategories/:id
 * Eliminar subcategoría (solo si no tiene subgéneros ni eventos)
 * Requiere: PAYPAC
 */
const deleteSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userRole = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || '';
        const result = yield subCategoryService.deleteSubCategory(Number(id), userRole);
        res.status(200).json({
            message: 'Subcategoría eliminada exitosamente',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteSubCategory = deleteSubCategory;
