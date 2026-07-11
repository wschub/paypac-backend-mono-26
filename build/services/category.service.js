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
exports.CategoryService = void 0;
const category_repository_1 = require("../repositories/category.repository");
const countries_repository_1 = require("../repositories/countries.repository");
const client_1 = require("../prisma/client");
const constants_1 = require("../config/constants");
const categoryRepo = new category_repository_1.CategoryRepository();
const countriesRepo = new countries_repository_1.CountriesRepository();
class CategoryService {
    /**
     * Crear categoría — solo PAYPAC
     */
    createCategory(data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede crear categorías');
            }
            // Verificar que el país existe
            const country = yield countriesRepo.findById(data.country_id);
            if (!country) {
                throw new Error(`El país con ID ${data.country_id} no existe`);
            }
            // Validar nombre único dentro del país
            const existing = yield categoryRepo.findByNameAndCountry(data.category_name, data.country_id);
            if (existing) {
                throw new Error(`Ya existe la categoría "${data.category_name}" en ${country.name_country}`);
            }
            return categoryRepo.create({
                category_name: data.category_name,
                category_icon: data.category_icon,
                country: { connect: { id: data.country_id } },
            });
        });
    }
    /**
     * Listar categorías con filtros — todos los roles autenticados
     */
    getCategories(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return categoryRepo.findAll(filters);
        });
    }
    /**
     * Categoría por ID con jerarquía completa — todos los roles
     */
    getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield categoryRepo.findById(id);
            if (!category) {
                throw new Error('Categoría no encontrada');
            }
            return category;
        });
    }
    /**
     * Categorías de un país con su jerarquía completa — todos los roles
     */
    getCategoriesByCountry(country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const country = yield countriesRepo.findById(country_id);
            if (!country) {
                throw new Error(`El país con ID ${country_id} no existe`);
            }
            return categoryRepo.findByCountry(country_id);
        });
    }
    /**
     * Actualizar categoría — solo PAYPAC
     */
    updateCategory(id, data, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede actualizar categorías');
            }
            const category = yield categoryRepo.findById(id);
            if (!category) {
                throw new Error('Categoría no encontrada');
            }
            const targetCountryId = (_a = data.country_id) !== null && _a !== void 0 ? _a : category.country_id;
            // Verificar que el país destino existe si se está cambiando
            if (data.country_id && data.country_id !== category.country_id) {
                const country = yield countriesRepo.findById(data.country_id);
                if (!country) {
                    throw new Error(`El país con ID ${data.country_id} no existe`);
                }
            }
            // Validar nombre único en el país destino (excluyendo la categoría actual)
            if (data.category_name) {
                const existing = yield categoryRepo.findByNameAndCountry(data.category_name, targetCountryId);
                if (existing && existing.id !== id) {
                    throw new Error(`Ya existe la categoría "${data.category_name}" en el país con ID ${targetCountryId}`);
                }
            }
            const updateData = {};
            if (data.category_name)
                updateData.category_name = data.category_name;
            if (data.category_icon !== undefined)
                updateData.category_icon = data.category_icon;
            if (data.country_id)
                updateData.country = { connect: { id: data.country_id } };
            return categoryRepo.update(id, updateData);
        });
    }
    /**
     * Eliminar categoría — solo PAYPAC
     * Valida que no tenga subcategorías ni eventos asociados
     */
    deleteCategory(id, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede eliminar categorías');
            }
            const category = yield categoryRepo.findById(id);
            if (!category) {
                throw new Error('Categoría no encontrada');
            }
            const counts = category._count;
            if ((counts === null || counts === void 0 ? void 0 : counts.subcategories) > 0) {
                throw new Error(`No se puede eliminar: la categoría tiene ${counts.subcategories} subcategoría(s) asociada(s). Elimínalas primero.`);
            }
            if ((counts === null || counts === void 0 ? void 0 : counts.events) > 0) {
                throw new Error(`No se puede eliminar: la categoría tiene ${counts.events} evento(s) asociado(s).`);
            }
            return categoryRepo.delete(id);
        });
    }
    /**
     * Estadísticas — solo PAYPAC
     */
    getCategoriesStats(userRole, country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userRole !== 'PAYPAC') {
                throw new Error('Solo PAYPAC puede ver estadísticas');
            }
            return categoryRepo.getStats(country_id);
        });
    }
    getPublicCategories(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const countryId = filters.country_id ? parseInt(filters.country_id) : constants_1.DEFAULT_COUNTRY_ID;
            const categories = yield client_1.prisma.category.findMany({
                where: Object.assign({ country_id: countryId }, (filters.search && {
                    category_name: { contains: filters.search, mode: 'insensitive' },
                })),
                select: {
                    id: true,
                    category_name: true,
                    category_icon: true,
                    country_id: true,
                },
                orderBy: { category_name: 'asc' },
            });
            return { data: categories, total: categories.length };
        });
    }
}
exports.CategoryService = CategoryService;
