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
exports.getPublicSubcategories = void 0;
const subcategory_service_1 = require("../../services/subcategory.service");
const subcategoryService = new subcategory_service_1.SubCategoryService();
const getPublicSubcategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const result = yield subcategoryService.getPublicSubcategories(Number(categoryId));
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error in getPublicSubcategories:', error);
        res.status(500).json({ error: 'Internal server error', message: 'Failed to fetch subcategories' });
    }
});
exports.getPublicSubcategories = getPublicSubcategories;
