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
exports.CitiesRepository = void 0;
const db_1 = require("../config/db");
class CitiesRepository {
    /**
     * Crear una nueva ciudad
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.cities.create({
                data,
                include: {
                    country: { select: { id: true, name_country: true, code: true } },
                    state: { select: { id: true, name_state: true } },
                },
            });
        });
    }
    /**
     * Obtener todas las ciudades con filtros opcionales
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.name_city = { contains: filters.search, mode: 'insensitive' };
            }
            if (filters === null || filters === void 0 ? void 0 : filters.country_id) {
                where.country_id = filters.country_id;
            }
            if (filters === null || filters === void 0 ? void 0 : filters.state_id) {
                where.state_id = filters.state_id;
            }
            return db_1.prisma.cities.findMany({
                where,
                orderBy: { name_city: 'asc' },
                include: {
                    country: { select: { id: true, name_country: true, code: true } },
                    state: { select: { id: true, name_state: true } },
                },
            });
        });
    }
    /**
     * Buscar ciudad por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.cities.findUnique({
                where: { id },
                include: {
                    country: { select: { id: true, name_country: true, code: true, currency: true } },
                    state: { select: { id: true, name_state: true } },
                },
            });
        });
    }
    /**
     * Ciudades por país directamente (sin pasar por estados)
     * Usa country_id que existe como FK directo en Cities
     */
    findByCountry(country_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.cities.findMany({
                where: { country_id },
                orderBy: [{ state_id: 'asc' }, { name_city: 'asc' }],
                include: {
                    state: { select: { id: true, name_state: true } },
                },
            });
        });
    }
    /**
     * Ciudades por estado
     */
    findByState(state_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.cities.findMany({
                where: { state_id },
                orderBy: { name_city: 'asc' },
                include: {
                    country: { select: { id: true, name_country: true, code: true } },
                    state: { select: { id: true, name_state: true } },
                },
            });
        });
    }
    /**
     * Buscar ciudad por nombre dentro de un estado (para validar duplicados)
     */
    findByNameAndState(name_city, state_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.cities.findFirst({
                where: {
                    name_city: { equals: name_city, mode: 'insensitive' },
                    state_id,
                },
            });
        });
    }
    /**
     * Actualizar ciudad
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.cities.update({
                where: { id },
                data,
                include: {
                    country: { select: { id: true, name_country: true, code: true } },
                    state: { select: { id: true, name_state: true } },
                },
            });
        });
    }
    /**
     * Eliminar ciudad
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.cities.delete({ where: { id } });
        });
    }
    /**
     * Verificar si existe
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.cities.count({ where: { id } });
            return count > 0;
        });
    }
    /**
     * Estadísticas de ciudades
     */
    getStats(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.country_id)
                where.country_id = filters.country_id;
            if (filters === null || filters === void 0 ? void 0 : filters.state_id)
                where.state_id = filters.state_id;
            const total = yield db_1.prisma.cities.count({ where });
            return { total_cities: total };
        });
    }
}
exports.CitiesRepository = CitiesRepository;
