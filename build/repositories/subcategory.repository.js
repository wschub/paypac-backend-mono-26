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
exports.SubCategoryRepository = void 0;
const db_1 = require("../config/db");
class SubCategoryRepository {
    /**
     * Crear una nueva subcategoría
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subCategory.create({
                data,
                include: {
                    category: {
                        select: {
                            id: true,
                            category_name: true,
                            country: { select: { id: true, name_country: true, code: true } },
                        },
                    },
                    _count: { select: { subgenres: true, events: true } },
                },
            });
        });
    }
    /**
     * Obtener todas las subcategorías con filtros opcionales
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.subcategory_name = { contains: filters.search, mode: 'insensitive' };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.category_id) {
                where.category_id = filters.category_id;
            }
            // Filtro por país navegando la relación category → country
            if (filters === null || filters === void 0 ? void 0 : filters.country_id) {
                where.category = { country_id: filters.country_id };
            }
            return db_1.prisma.subCategory.findMany({
                where,
                orderBy: { subcategory_name: 'asc' },
                include: {
                    category: {
                        select: {
                            id: true,
                            category_name: true,
                            country: { select: { id: true, name_country: true, code: true } },
                        },
                    },
                    _count: { select: { subgenres: true, events: true } },
                },
            });
        });
    }
    /**
     * Buscar subcategoría por ID con subgéneros anidados
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subCategory.findUnique({
                where: { id },
                include: {
                    category: {
                        select: {
                            id: true,
                            category_name: true,
                            country: { select: { id: true, name_country: true, code: true } },
                        },
                    },
                    subgenres: { orderBy: { subcategory_name: 'asc' } },
                    _count: { select: { subgenres: true, events: true } },
                },
            });
        });
    }
    /**
     * Subcategorías de una categoría específica
     */
    findByCategory(category_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subCategory.findMany({
                where: { category_id },
                orderBy: { subcategory_name: 'asc' },
                include: {
                    subgenres: { orderBy: { subcategory_name: 'asc' } },
                    _count: { select: { subgenres: true, events: true } },
                },
            });
        });
    }
    /**
     * Validar nombre único dentro de una categoría
     */
    findByNameAndCategory(subcategory_name, category_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subCategory.findFirst({
                where: {
                    subcategory_name: { equals: subcategory_name, mode: 'insensitive' },
                    category_id,
                },
            });
        });
    }
    /**
     * Actualizar subcategoría
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subCategory.update({
                where: { id },
                data,
                include: {
                    category: {
                        select: {
                            id: true,
                            category_name: true,
                            country: { select: { id: true, name_country: true, code: true } },
                        },
                    },
                    _count: { select: { subgenres: true, events: true } },
                },
            });
        });
    }
    /**
     * Eliminar subcategoría
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subCategory.delete({ where: { id } });
        });
    }
    /**
     * Verificar si existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.subCategory.count({ where: { id } });
            return count > 0;
        });
    }
    /**
     * Estadísticas de subcategorías
     */
    getStats(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.category_id)
                where.category_id = filters.category_id;
            if (filters === null || filters === void 0 ? void 0 : filters.country_id)
                where.category = { country_id: filters.country_id };
            const [totalSubcategories, totalSubgenres, subcategoriesWithEvents] = yield Promise.all([
                db_1.prisma.subCategory.count({ where }),
                db_1.prisma.subgenre.count({
                    where: (filters === null || filters === void 0 ? void 0 : filters.category_id)
                        ? { subcategory: { category_id: filters.category_id } }
                        : (filters === null || filters === void 0 ? void 0 : filters.country_id)
                            ? { subcategory: { category: { country_id: filters.country_id } } }
                            : undefined,
                }),
                db_1.prisma.subCategory.count({
                    where: Object.assign(Object.assign({}, where), { events: { some: {} } }),
                }),
            ]);
            return {
                total_subcategories: totalSubcategories,
                total_subgenres: totalSubgenres,
                subcategories_with_events: subcategoriesWithEvents,
            };
        });
    }
}
exports.SubCategoryRepository = SubCategoryRepository;
