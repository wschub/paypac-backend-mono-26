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
exports.SubCategoryService = void 0;
const subcategory_repository_1 = require("../repositories/subcategory.repository");
const category_repository_1 = require("../repositories/category.repository");
const client_1 = require("../prisma/client");
const subCategoryRepo = new subcategory_repository_1.SubCategoryRepository();
const categoryRepo = new category_repository_1.CategoryRepository();
class SubCategoryService {
    /**
     * Crear subcategoría — solo PAYPAC
     */
    createSubCategory(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede crear subcategorías');
            }
            // Verificar que la categoría existe
            const category = yield categoryRepo.findById(data.category_id);
            if (!category) {
                throw new Error(`La categoría con ID ${data.category_id} no existe`);
            }
            // Validar nombre único dentro de la categoría
            const existing = yield subCategoryRepo.findByNameAndCategory(data.subcategory_name, data.category_id);
            if (existing) {
                throw new Error(`Ya existe la subcategoría "${data.subcategory_name}" en la categoría "${category.category_name}"`);
            }
            return subCategoryRepo.create({
                subcategory_name: data.subcategory_name,
                category: { connect: { id: data.category_id } },
            });
        });
    }
    /**
     * Listar subcategorías con filtros — todos los roles autenticados
     */
    getSubCategories(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return subCategoryRepo.findAll(filters);
        });
    }
    /**
     * Subcategoría por ID con subgéneros — todos los roles
     */
    getSubCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const subcategory = yield subCategoryRepo.findById(id);
            if (!subcategory) {
                throw new Error('Subcategoría no encontrada');
            }
            return subcategory;
        });
    }
    /**
     * Subcategorías de una categoría — todos los roles
     */
    getSubCategoriesByCategory(category_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield categoryRepo.findById(category_id);
            if (!category) {
                throw new Error(`La categoría con ID ${category_id} no existe`);
            }
            return subCategoryRepo.findByCategory(category_id);
        });
    }
    /**
     * Actualizar subcategoría — solo PAYPAC
     */
    updateSubCategory(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede actualizar subcategorías');
            }
            const subcategory = yield subCategoryRepo.findById(id);
            if (!subcategory) {
                throw new Error('Subcategoría no encontrada');
            }
            const targetCategoryId = (_a = data.category_id) !== null && _a !== void 0 ? _a : subcategory.category_id;
            // Verificar que la categoría destino existe si se está cambiando
            if (data.category_id && data.category_id !== subcategory.category_id) {
                const category = yield categoryRepo.findById(data.category_id);
                if (!category) {
                    throw new Error(`La categoría con ID ${data.category_id} no existe`);
                }
            }
            // Validar nombre único en la categoría destino (excluyendo la actual)
            if (data.subcategory_name) {
                const existing = yield subCategoryRepo.findByNameAndCategory(data.subcategory_name, targetCategoryId);
                if (existing && existing.id !== id) {
                    throw new Error(`Ya existe la subcategoría "${data.subcategory_name}" en la categoría con ID ${targetCategoryId}`);
                }
            }
            const updateData = {};
            if (data.subcategory_name)
                updateData.subcategory_name = data.subcategory_name;
            if (data.category_id)
                updateData.category = { connect: { id: data.category_id } };
            return subCategoryRepo.update(id, updateData);
        });
    }
    /**
     * Eliminar subcategoría — solo PAYPAC
     * Valida que no tenga subgéneros ni eventos asociados
     */
    deleteSubCategory(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar subcategorías');
            }
            const subcategory = yield subCategoryRepo.findById(id);
            if (!subcategory) {
                throw new Error('Subcategoría no encontrada');
            }
            const counts = subcategory._count;
            if ((counts === null || counts === void 0 ? void 0 : counts.subgenres) > 0) {
                throw new Error(`No se puede eliminar: la subcategoría tiene ${counts.subgenres} subgénero(s) asociado(s). Elimínalos primero.`);
            }
            if ((counts === null || counts === void 0 ? void 0 : counts.events) > 0) {
                throw new Error(`No se puede eliminar: la subcategoría tiene ${counts.events} evento(s) asociado(s).`);
            }
            return subCategoryRepo.delete(id);
        });
    }
    /**
     * Estadísticas — solo PAYPAC
     */
    getSubCategoriesStats(userRole, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            return subCategoryRepo.getStats(filters);
        });
    }
    getPublicSubcategories(categoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subcategories = yield client_1.prisma.subCategory.findMany({
                where: {
                    category_id: categoryId,
                },
                select: {
                    id: true,
                    category_id: true,
                    subcategory_name: true,
                },
                orderBy: { subcategory_name: 'asc' },
            });
            return { data: subcategories, total: subcategories.length };
        });
    }
}
exports.SubCategoryService = SubCategoryService;
