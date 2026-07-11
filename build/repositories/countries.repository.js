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
exports.CountriesRepository = void 0;
const db_1 = require("../config/db");
class CountriesRepository {
    /**
     * Crear un nuevo país
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.countries.create({ data });
        });
    }
    /**
     * Obtener todos los países (lista limpia, sin relaciones pesadas)
     * Incluye _count para saber cuántos estados y ciudades tiene cada país
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.OR = [
                    { name_country: { contains: filters.search, mode: 'insensitive' } },
                    { code: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            if (filters === null || filters === void 0 ? void 0 : filters.code) {
                where.code = { equals: filters.code, mode: 'insensitive' };
            }
            return db_1.prisma.countries.findMany({
                where,
                orderBy: { name_country: 'asc' },
                include: {
                    _count: {
                        select: {
                            states: true,
                            cities: true,
                            categories: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Buscar país por ID con detalle completo
     * Estados incluyen sus ciudades anidadas
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.countries.findUnique({
                where: { id },
                include: {
                    states: {
                        orderBy: { name_state: 'asc' },
                        include: {
                            cities: {
                                orderBy: { name_city: 'asc' },
                            },
                        },
                    },
                    categories: {
                        select: {
                            id: true,
                            category_name: true,
                        },
                    },
                    _count: {
                        select: {
                            states: true,
                            cities: true,
                            categories: true,
                        },
                    },
                },
            });
        });
    }
    /**
     * Buscar país por código ISO
     */
    findByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.countries.findFirst({
                where: { code: { equals: code, mode: 'insensitive' } },
            });
        });
    }
    /**
     * Buscar país por nombre
     */
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.countries.findFirst({
                where: { name_country: { equals: name, mode: 'insensitive' } },
            });
        });
    }
    /**
     * Actualizar país
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.countries.update({
                where: { id },
                data,
                include: {
                    _count: {
                        select: { states: true, cities: true, categories: true },
                    },
                },
            });
        });
    }
    /**
     * Eliminar país
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.countries.delete({ where: { id } });
        });
    }
    /**
     * Verificar si un país existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.countries.count({ where: { id } });
            return count > 0;
        });
    }
    /**
     * Estadísticas globales usando agregaciones de Prisma (no carga registros en memoria)
     */
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalCountries, totalStates, totalCities] = yield Promise.all([
                db_1.prisma.countries.count(),
                db_1.prisma.states.count(),
                db_1.prisma.cities.count(),
            ]);
            // Países que tienen al menos 1 estado
            const countriesWithStates = yield db_1.prisma.countries.count({
                where: { states: { some: {} } },
            });
            // Países que tienen al menos 1 categoría
            const countriesWithCategories = yield db_1.prisma.countries.count({
                where: { categories: { some: {} } },
            });
            return {
                total_countries: totalCountries,
                total_states: totalStates,
                total_cities: totalCities,
                countries_with_states: countriesWithStates,
                countries_with_categories: countriesWithCategories,
            };
        });
    }
    /**
     * Obtener países con jerarquía completa (estados → ciudades)
     */
    findAllWithRelations() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.countries.findMany({
                orderBy: { name_country: 'asc' },
                include: {
                    states: {
                        orderBy: { name_state: 'asc' },
                        include: {
                            cities: {
                                orderBy: { name_city: 'asc' },
                            },
                        },
                    },
                    _count: {
                        select: { states: true, cities: true },
                    },
                },
            });
        });
    }
}
exports.CountriesRepository = CountriesRepository;
