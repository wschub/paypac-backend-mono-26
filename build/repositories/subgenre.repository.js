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
exports.SubgenreRepository = void 0;
const db_1 = require("../config/db");
class SubgenreRepository {
    /**
     * Crear un nuevo subgénero
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subgenre.create({
                data,
                include: {
                    subcategory: {
                        select: {
                            id: true,
                            subcategory_name: true,
                            category: {
                                select: {
                                    id: true,
                                    category_name: true,
                                    country: { select: { id: true, name_country: true, code: true } },
                                },
                            },
                        },
                    },
                    _count: { select: { events: true } },
                },
            });
        });
    }
    /**
     * Obtener todos los subgéneros con filtros opcionales
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.subcategory_name = { contains: filters.search, mode: 'insensitive' };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.subcategory_id) {
                where.subcategory_id = filters.subcategory_id;
            }
            // Navega subcategory → category
            if (filters === null || filters === void 0 ? void 0 : filters.category_id) {
                where.subcategory = { category_id: filters.category_id };
            }
            // Navega subcategory → category → country
            if (filters === null || filters === void 0 ? void 0 : filters.country_id) {
                where.subcategory = { category: { country_id: filters.country_id } };
            }
            return db_1.prisma.subgenre.findMany({
                where,
                orderBy: { subcategory_name: 'asc' },
                include: {
                    subcategory: {
                        select: {
                            id: true,
                            subcategory_name: true,
                            category: {
                                select: {
                                    id: true,
                                    category_name: true,
                                    country: { select: { id: true, name_country: true, code: true } },
                                },
                            },
                        },
                    },
                    _count: { select: { events: true } },
                },
            });
        });
    }
    /**
     * Buscar subgénero por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subgenre.findUnique({
                where: { id },
                include: {
                    subcategory: {
                        select: {
                            id: true,
                            subcategory_name: true,
                            category: {
                                select: {
                                    id: true,
                                    category_name: true,
                                    country: { select: { id: true, name_country: true, code: true } },
                                },
                            },
                        },
                    },
                    _count: { select: { events: true } },
                },
            });
        });
    }
    /**
     * Subgéneros de una subcategoría específica
     */
    findBySubCategory(subcategory_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subgenre.findMany({
                where: { subcategory_id },
                orderBy: { subcategory_name: 'asc' },
                include: {
                    _count: { select: { events: true } },
                },
            });
        });
    }
    /**
     * Validar nombre único dentro de una subcategoría
     */
    findByNameAndSubCategory(name, subcategory_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subgenre.findFirst({
                where: {
                    subcategory_name: { equals: name, mode: 'insensitive' },
                    subcategory_id,
                },
            });
        });
    }
    /**
     * Actualizar subgénero
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subgenre.update({
                where: { id },
                data,
                include: {
                    subcategory: {
                        select: {
                            id: true,
                            subcategory_name: true,
                            category: {
                                select: {
                                    id: true,
                                    category_name: true,
                                    country: { select: { id: true, name_country: true, code: true } },
                                },
                            },
                        },
                    },
                    _count: { select: { events: true } },
                },
            });
        });
    }
    /**
     * Eliminar subgénero
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.subgenre.delete({ where: { id } });
        });
    }
    /**
     * Verificar si existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.subgenre.count({ where: { id } });
            return count > 0;
        });
    }
    /**
     * Estadísticas de subgéneros
     */
    getStats(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.subcategory_id) {
                where.subcategory_id = filters.subcategory_id;
            }
            else if (filters === null || filters === void 0 ? void 0 : filters.category_id) {
                where.subcategory = { category_id: filters.category_id };
            }
            else if (filters === null || filters === void 0 ? void 0 : filters.country_id) {
                where.subcategory = { category: { country_id: filters.country_id } };
            }
            const [totalSubgenres, subgenresWithEvents] = yield Promise.all([
                db_1.prisma.subgenre.count({ where }),
                db_1.prisma.subgenre.count({
                    where: Object.assign(Object.assign({}, where), { events: { some: {} } }),
                }),
            ]);
            return {
                total_subgenres: totalSubgenres,
                subgenres_with_events: subgenresWithEvents,
            };
        });
    }
}
exports.SubgenreRepository = SubgenreRepository;
