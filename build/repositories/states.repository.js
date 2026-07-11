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
exports.StatesRepository = void 0;
const db_1 = require("../config/db");
class StatesRepository {
    /**
     * Crear un nuevo estado
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.states.create({ data });
        });
    }
    /**
     * Obtener todos los estados con _count de ciudades
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.name_state = { contains: filters.search, mode: 'insensitive' };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.country_id) {
                where.country_id = filters.country_id;
            }
            return db_1.prisma.states.findMany({
                where,
                orderBy: { name_state: 'asc' },
                include: {
                    country: {
                        select: { id: true, name_country: true, code: true },
                    },
                    _count: {
                        select: { cities: true },
                    },
                },
            });
        });
    }
    /**
     * Buscar estado por ID con ciudades incluidas
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.states.findUnique({
                where: { id },
                include: {
                    country: {
                        select: { id: true, name_country: true, code: true, currency: true },
                    },
                    cities: {
                        orderBy: { name_city: 'asc' },
                    },
                    _count: {
                        select: { cities: true },
                    },
                },
            });
        });
    }
    /**
     * Buscar estados por país
     */
    findByCountry(country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.states.findMany({
                where: { country_id },
                orderBy: { name_state: 'asc' },
                include: {
                    cities: {
                        orderBy: { name_city: 'asc' },
                    },
                    _count: {
                        select: { cities: true },
                    },
                },
            });
        });
    }
    /**
     * Buscar estado por nombre dentro de un país (para validar duplicados)
     */
    findByNameAndCountry(name_state, country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.states.findFirst({
                where: {
                    name_state: { equals: name_state, mode: 'insensitive' },
                    country_id,
                },
            });
        });
    }
    /**
     * Actualizar estado
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.states.update({
                where: { id },
                data,
                include: {
                    country: {
                        select: { id: true, name_country: true, code: true },
                    },
                    _count: {
                        select: { cities: true },
                    },
                },
            });
        });
    }
    /**
     * Eliminar estado
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.states.delete({ where: { id } });
        });
    }
    /**
     * Verificar si existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.states.count({ where: { id } });
            return count > 0;
        });
    }
    /**
     * Estadísticas de estados
     */
    getStats(country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = country_id ? { country_id } : {};
            const [totalStates, totalCities, statesWithCities] = yield Promise.all([
                db_1.prisma.states.count({ where }),
                db_1.prisma.cities.count({ where: country_id ? { country_id } : {} }),
                db_1.prisma.states.count({
                    where: Object.assign(Object.assign({}, where), { cities: { some: {} } }),
                }),
            ]);
            return {
                total_states: totalStates,
                total_cities: totalCities,
                states_with_cities: statesWithCities,
                states_without_cities: totalStates - statesWithCities,
            };
        });
    }
}
exports.StatesRepository = StatesRepository;
