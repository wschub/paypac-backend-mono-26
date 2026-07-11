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
exports.GeneralSettingsRepository = void 0;
const db_1 = require("../config/db");
class GeneralSettingsRepository {
    /**
     * Crear una nueva variable
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.generalSettingsVariables.create({ data });
        });
    }
    /**
     * Obtener todas las variables con filtro opcional
     */
    findAll(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            return db_1.prisma.generalSettingsVariables.findMany({
                where,
                orderBy: { name: 'asc' },
            });
        });
    }
    /**
     * Buscar variable por ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.generalSettingsVariables.findUnique({ where: { id } });
        });
    }
    /**
     * Buscar variable por nombre (único)
     */
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.generalSettingsVariables.findUnique({ where: { name } });
        });
    }
    /**
     * Actualizar variable
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.generalSettingsVariables.update({ where: { id }, data });
        });
    }
    /**
     * Eliminar variable
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.prisma.generalSettingsVariables.delete({ where: { id } });
        });
    }
    /**
     * Verificar si existe por ID
     */
    exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield db_1.prisma.generalSettingsVariables.count({ where: { id } });
            return count > 0;
        });
    }
}
exports.GeneralSettingsRepository = GeneralSettingsRepository;
