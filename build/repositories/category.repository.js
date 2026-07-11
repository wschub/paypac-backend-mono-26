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
exports.CategoryRepository = void 0;
const db_1 = require("../config/db");
class CategoryRepository {
    /**
     * Crear una nueva categoría
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.category.create({
                data,
                include: {
                    country: { select: { id: true, name_country: true, code: true } },
                    _count: { select: { subcategories: true, events: true } },
                },
            });
        });
    }
    /**
     * Obtener todas las categorías con filtros opcionales
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.category_name = { contains: filters.search, mode: 'insensitive' };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.country_id) {
                where.country_id = filters.country_id;
            }
            return db_1.prisma.category.findMany({
                where,
                orderBy: { category_name: 'asc' },
                include: {
                    country: { select: { id: true, name_country: true, code: true } },
                    _count: { select: { subcategories: true, events: true } },
                },
            });
        });
    }
    /**
     * Buscar categoría por ID con subcategorías y subgéneros anidados
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.category.findUnique({
                where: { id },
                include: {
                    country: { select: { id: true, name_country: true, code: true } },
                    subcategories: {
                        orderBy: { subcategory_name: 'asc' },
                        include: {
                            subgenres: { orderBy: { subcategory_name: 'asc' } },
                            _count: { select: { events: true, subgenres: true } },
                        },
                    },
                    _count: { select: { subcategories: true, events: true } },
                },
            });
        });
    }
    /**
     * Categorías por país
     */
    findByCountry(country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.category.findMany({
                where: { country_id },
                orderBy: { category_name: 'asc' },
                include: {
                    subcategories: {
                        orderBy: { subcategory_name: 'asc' },
                        include: {
                            subgenres: { orderBy: { subcategory_name: 'asc' } },
                            _count: { select: { events: true } },
                        },
                    },
                    _count: { select: { subcategories: true, events: true } },
                },
            });
        });
    }
    /**
     * Validar nombre único dentro de un país
     */
    findByNameAndCountry(category_name, country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.category.findFirst({
                where: {
                    category_name: { equals: category_name, mode: 'insensitive' },
                    country_id,
                },
            });
        });
    }
    /**
     * Actualizar categoría
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.category.update({
                where: { id },
                data,
                include: {
                    country: { select: { id: true, name_country: true, code: true } },
                    _count: { select: { subcategories: true, events: true } },
                },
            });
        });
    }
    /**
     * Eliminar categoría
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.category.delete({ where: { id } });
        });
    }
    /**
     * Verificar si existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.category.count({ where: { id } });
            return count > 0;
        });
    }
    /**
     * Estadísticas globales o por país
     */
    getStats(country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const categoryWhere = country_id ? { country_id } : {};
            const [totalCategories, totalSubcategories, categoriesWithEvents] = yield Promise.all([
                db_1.prisma.category.count({ where: categoryWhere }),
                db_1.prisma.subCategory.count({
                    where: country_id ? { category: { country_id } } : undefined,
                }),
                db_1.prisma.category.count({
                    where: Object.assign(Object.assign({}, categoryWhere), { events: { some: {} } }),
                }),
            ]);
            return {
                total_categories: totalCategories,
                total_subcategories: totalSubcategories,
                categories_with_events: categoriesWithEvents,
            };
        });
    }
}
exports.CategoryRepository = CategoryRepository;
