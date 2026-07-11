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
exports.getPublicCategories = void 0;
const category_service_1 = require("../../services/category.service");
const categoryService = new category_service_1.CategoryService();
const getPublicCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = req.query;
        const result = yield categoryService.getPublicCategories(filters);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in getPublicCategories:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch categories' });
    }
});
exports.getPublicCategories = getPublicCategories;
